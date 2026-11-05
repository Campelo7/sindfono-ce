import Image from "next/image";

interface CampaignBannerProps {
  variant?: "full" | "compact";
}

export function CampaignBanner({ variant = "full" }: CampaignBannerProps) {
  const bannerImgPath = "/banners/novembro-azul.jpg";

  const bannerText = (
    <>
      <span className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3 block">
        Novembro Azul · Sindfono CE
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
        Cuidar da saúde também é coisa de homem.
      </h2>
      <div className="text-sm text-blue-100/90 leading-relaxed text-justify space-y-3">
        <p className="mb-3">
          Novembro Azul: a importância de cuidar da saúde masculina. A saúde do
          homem merece atenção durante todo o ano. O diagnóstico precoce, o
          acompanhamento médico regular e a adoção de hábitos saudáveis são
          fundamentais para prevenir doenças e aumentar as chances de
          tratamentos bem-sucedidos.
        </p>
        <p className="mb-3">
          O câncer de próstata, um dos tipos de câncer mais frequentes entre os
          homens, exige atenção especial. Em muitos casos, a doença não apresenta
          sintomas nas fases iniciais, tornando ainda mais importante o
          acompanhamento com profissionais de saúde e a avaliação individualizada
          sobre a necessidade de exames preventivos.
        </p>
        <p className="mb-3">
          Além disso, é essencial superar barreiras como o preconceito, o medo e
          a resistência em procurar atendimento médico. Cuidar da saúde não deve
          ser motivo de vergonha, mas uma demonstração de responsabilidade
          consigo mesmo e com aqueles que fazem parte da nossa vida.
        </p>
        <p className="mb-3">
          A atenção à saúde masculina também envolve o cuidado com a saúde
          mental, a alimentação equilibrada, a prática regular de atividades
          físicas e a realização de consultas de rotina.
        </p>
        <p className="mb-3">
          Neste Novembro Azul, reforçamos que a informação é uma importante
          aliada da prevenção. Incentivar o autocuidado, compartilhar conhecimento
          e promover o acesso à saúde são atitudes que podem salvar vidas.
        </p>
        <p className="mb-0 font-semibold text-white">
          A prevenção começa com a conscientização. Cuide-se hoje, cuide-se
          sempre!
        </p>
      </div>
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
