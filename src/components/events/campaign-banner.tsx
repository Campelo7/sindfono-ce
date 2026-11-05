import Image from "next/image";

interface CampaignBannerProps {
  variant?: "full" | "compact";
}

export function CampaignBanner({ variant = "full" }: CampaignBannerProps) {
  const bannerImgPath = "/banners/novembro-azul.jpg";

  // Se tiver a arte oficial do banner, exibe sem esticar e com boa qualidade
  return (
    <div className="w-full max-w-[800px] mx-auto overflow-hidden rounded-3xl bg-[#0a1a4a] shadow-xl border border-blue-200/40">
      <Image
        src={bannerImgPath}
        alt="Novembro Azul — Sindfono CE: Cuidar da saúde também é coisa de homem"
        width={1024}
        height={682}
        className="w-full h-auto object-cover block"
        sizes="(max-width: 768px) 100vw, 800px"
      />
    </div>
  );
}
