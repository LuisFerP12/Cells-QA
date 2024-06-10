//page.jsx
import Navbar from "@/components/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center p-16">
        <div className="mb-20">
          <h1 className="!text-[60px]">CELLS QA</h1>
          <h3>Your Self-Healing Testing Aplicaction</h3>
          <div className="flex">
            <div className="button !bg-[#24374B] !px-8 mt-8">Try</div>
          </div>
        </div>
        <Image
          src="/img/main.png"
          alt="Descripción de la imagen"
          width={600} // Ancho deseado de la imagen
          height={600} // Alto deseado de la imagen
        />
      </div>
    </main>
  );
}
