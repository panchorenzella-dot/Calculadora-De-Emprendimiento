# Backups de Supabase

Este proyecto utiliza un respaldo lógico diario porque los proyectos Free de
Supabase no incluyen backups diarios descargables. El workflow
`.github/workflows/supabase-backup.yml` también se puede ejecutar manualmente.

## Qué queda respaldado

- Roles personalizados compatibles con Supabase (`roles.sql`).
- Esquema SQL de la aplicación (`schema.sql`).
- Datos de la base, incluidos los escenarios, planes y conversaciones
  (`data.sql`). El comando sigue la receta oficial de Supabase y omite dos
  tablas vectoriales de Storage que no son portables.
- Metadatos del job y checksums SHA-256 de todos los archivos.

Los objetos binarios de Supabase Storage no forman parte de un dump de base de
datos. La aplicación actualmente no depende de Storage; si se incorpora en el
futuro, hay que agregar una copia independiente de cada bucket.

## Configuración única en GitHub

En `Settings → Secrets and variables → Actions`, crear estos secretos:

1. `SUPABASE_DB_URL`: connection string del **Session pooler** de producción,
   copiada desde `Supabase → Connect`. Debe usar el puerto 5432 y la contraseña
   debe estar codificada para una URL si contiene caracteres especiales. No usar
   una URL de API ni una service-role key.
2. `BACKUP_ENCRYPTION_PASSPHRASE`: secreto aleatorio de al menos 32 caracteres.
   Se puede generar localmente con `openssl rand -base64 48`. Guardar una copia
   en el gestor de contraseñas del propietario: si se pierde, los backups no se
   pueden descifrar.

El job corre todos los días a las 06:17 UTC, cifra el archivo con AES-256 antes
de subirlo y conserva el artefacto cifrado durante 30 días. El repositorio nunca
recibe SQL en claro ni credenciales. Después de configurar los secretos, ejecutar
`Supabase encrypted backup → Run workflow` y comprobar que aparezca un artifact.

## Verificación rápida de un artifact

Descargar y descomprimir el artifact desde GitHub Actions. En una terminal,
ubicarse en esa carpeta y ejecutar:

```bash
sha256sum -c supabase-*.tar.gz.gpg.sha256
gpg --output backup.tar.gz --decrypt supabase-*.tar.gz.gpg
mkdir backup-verificado
tar -xzf backup.tar.gz -C backup-verificado
cd backup-verificado
sha256sum -c MANIFEST.sha256
```

En macOS, si no está disponible `sha256sum`, instalar `coreutils` o usar
`shasum -a 256` para comparar manualmente el hash exterior. No subir ni enviar
por correo los SQL descifrados: contienen datos personales.

## Simulacro de restauración mensual

Una copia solo es confiable después de comprobar que restaura. Una vez por mes:

1. Crear un proyecto Supabase temporal y vacío, nunca usar producción como
   destino del simulacro.
2. Descargar el artifact más reciente, verificar ambos niveles de checksum y
   descifrarlo siguiendo la sección anterior.
3. Copiar el connection string del Session pooler del proyecto temporal en una
   variable local `RESTORE_DB_URL`. Verificar visualmente que el project ref sea
   distinto del de producción.
4. Restaurar con PostgreSQL `psql`:

   ```bash
   psql \
     --single-transaction \
     --variable ON_ERROR_STOP=1 \
     --file roles.sql \
     --file schema.sql \
     --command 'SET session_replication_role = replica' \
     --file data.sql \
     --dbname "$RESTORE_DB_URL"
   ```

5. Comparar conteos básicos con producción desde el Table Editor: usuarios,
   `saved_scenarios`, `ai_conversations` y `user_plans`. Probar inicio de sesión
   con una cuenta de prueba; al restaurar en otro proyecto, las sesiones activas
   pueden requerir un nuevo login por usar otro secreto JWT.
6. Registrar fecha, artifact, resultado y cualquier corrección necesaria; luego
   eliminar el proyecto temporal y los archivos descifrados.

Si `psql` informa conflictos con un rol administrado por Supabase, seguir la
sección de troubleshooting de la guía oficial antes de editar el dump. No omitir
errores ni ejecutar una restauración parcial en producción.

## Recuperación real

Para un incidente, preservar primero el proyecto afectado y acordar el punto de
recuperación. Restaurar inicialmente en un proyecto nuevo permite validar datos
antes de cambiar DNS o variables de Vercel. Además de la base, se deben recrear
las opciones de Auth, proveedores OAuth, claves API, webhooks y cualquier ajuste
de Realtime, porque no viven dentro del dump lógico.

Referencias oficiales:

- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/deployment/ci/backups
- https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
