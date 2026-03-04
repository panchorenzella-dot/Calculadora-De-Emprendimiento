import "./globals.css";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-zinc-950 text-white">
        <Navbar />

        {children}

        <Footer />
      </body>
    </html>
  );
}