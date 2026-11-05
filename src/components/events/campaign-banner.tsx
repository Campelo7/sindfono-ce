import Image from "next/image";

interface CampaignBannerProps {
  variant?: "full" | "compact";
}

export function CampaignBanner({ variant = "full" }: CampaignBannerProps) {
  const bannerImgPath = "/banners/novembro-azul.jpg";

  const bannerText = (
    <>
      <span className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-2 block">
        Novembro Azul · Sindfono CE
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
        Cuidar da saúde também é coisa de homem.
      </h2>
      <p className="text-sm text-blue-100/90 max-w-lg leading-relaxed">
        Neste mês, o Sindfono CE reforça a conscientização sobre a prevenção e o
        diagnóstico precoce do câncer de próstata. Cuide de você.
      </p>
    </>
  );

  // Se tiver a arte oficial do banner, exibe lado a lado com texto
  return (
    <div className="w-full max-w-[800px] mx-auto overflow-hidden rounded-3xl bg-[#0a1a4a] shadow-xl border border-blue-200/40">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-0">
        {/* Texto */}
        <div className="p-6 sm:p-10 lg:p-12">
          {bannerText}
        </div>
        {/* Imagem */}
        <div className="h-auto min-h-[260px] lg:min-h-[360px] relative overflow-hidden">
          <Image
            src={bannerImgPath}
            alt="Novembro Azul — Sindfono CE: Cuidar da saúde também é coisa de homem"
            width={1024}
            height={682}
            className="w-full h-full object-cover block"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      </div>
    </div>
  );
}
