import { ImageResponse } from "next/og";

export const alt =
  "Calculadora Emprendedora — decisiones de negocio con números claros";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(135deg, #050706 0%, #0b1510 58%, #07110d 100%)",
        color: "#ffffff",
        padding: "70px 76px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 440,
          height: 440,
          right: -110,
          top: -190,
          borderRadius: 999,
          background: "rgba(52, 211, 153, 0.16)",
          filter: "blur(5px)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            border: "1px solid rgba(110, 231, 183, 0.28)",
            borderRadius: 999,
            background: "rgba(52, 211, 153, 0.08)",
            color: "#a7f3d0",
            padding: "12px 20px",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 2.4,
          }}
        >
          HERRAMIENTAS PARA EMPRENDEDORES
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 920,
            marginTop: 34,
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: -3.2,
          }}
        >
          Decidí con números más claros
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 890,
            marginTop: 24,
            color: "rgba(255, 255, 255, 0.66)",
            fontSize: 27,
            lineHeight: 1.4,
          }}
        >
          Precios, márgenes, rentabilidad, inversiones e impuestos en un solo
          lugar.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          color: "rgba(255, 255, 255, 0.9)",
          fontSize: 25,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 16,
            height: 16,
            marginRight: 13,
            borderRadius: 5,
            background: "#6ee7b7",
          }}
        />
        Calculadora Emprendedora
      </div>
    </div>,
    size,
  );
}
