import Image from "next/image";
import fs from "fs";
import path from "path";

interface CampaignBannerProps {
  variant?: "full" | "compact";
}

export function CampaignBanner({ variant = "full" }: CampaignBannerProps) {
  let bannerImgPath: string | null = null;
  const publicDir = path.join(process.cwd(), "public", "banners");
  if (fs.existsSync(path.join(publicDir, "novembro-azul.jpg"))) {
    bannerImgPath = "/banners/novembro-azul.jpg";
  } else if (fs.existsSync(path.join(publicDir, "novembro-azul.png"))) {
    bannerImgPath = "/banners/novembro-azul.png";
  } else if (fs.existsSync(path.join(publicDir, "novembro-azul.webp"))) {
    bannerImgPath = "/banners/novembro-azul.webp";
  }

  // Se tiver a arte oficial do banner, exibe a imagem de forma limpa e direta
  if (bannerImgPath) {
    return (
      <div className="w-full overflow-hidden rounded-3xl bg-[#0a1a4a] shadow-xl border border-blue-200/40">
        <Image
          src={bannerImgPath}
          alt="Novembro Azul — Sindfono CE: Cuidar da saúde também é coisa de homem"
          width={1200}
          height={675}
          className="w-full h-auto object-cover block"
          priority
        />
      </div>
    );
  }

  // Fallback vetorial simples
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071644] via-[#0d276b] to-[#1e40af] text-white shadow-xl p-6 sm:p-10 border border-blue-400/20">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
          Novembro Azul · Sindfono CE
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Cuidar da saúde também é coisa de homem.
        </h2>
        <p className="text-sm text-blue-100/90 max-w-2xl">
          Neste mês, o Sindfono CE reforça a conscientização sobre a prevenção e o diagnóstico precoce do câncer de próstata.
        </p>
      </div>
    </section>
  );
}
