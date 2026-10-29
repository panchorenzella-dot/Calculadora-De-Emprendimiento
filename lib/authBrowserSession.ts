export function hasStoredSession() {
  if (typeof window === "undefined") return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;

  try {
    const projectReference = new URL(supabaseUrl).hostname.split(".")[0];
    const rawSession = window.localStorage.getItem(
      `sb-${projectReference}-auth-token`,
    );
    if (!rawSession) return false;

    const session = JSON.parse(rawSession) as {
      access_token?: string;
      refresh_token?: string;
    };
    return Boolean(session.access_token || session.refresh_token);
  } catch {
    return false;
  }
}
