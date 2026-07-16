import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { getFeaturedEvents } from "@/lib/events-public";
import { EventCard } from "@/components/events/event-card";

export const revalidate = 300;

export default async function HomePage() {
  const featuredEvents = await getFeaturedEvents(3);

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">Sindicato dos Fonoaudiólogos do Ceará</div>
            <h1 className="hero-title">
              Sua voz tem<br />
              <em className="highlight">força coletiva</em>
            </h1>
            <p className="hero-desc">
              Filie-se ao Sindfono CE e faça parte do movimento que defende os direitos
              e o desenvolvimento profissional dos fonoaudiólogos cearenses.
            </p>
            <div className="hero-actions">
              <Link href="/sindicalizar" className="btn btn-primary">
                Sindicalizar-se agora
              </Link>
              <Link href="#sobre" className="btn btn-outline">
                Saiba mais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOBRE ── */}
      <section className="sobre" id="sobre">
        <div className="container sobre-inner">
          <div className="section-header left sobre-header">
            <span className="section-tag">Quem somos</span>
            <h2 className="section-title">
              Sindicato dos<br />Fonoaudiólogos<br />do Ceará
            </h2>
            <p className="section-desc" style={{ marginLeft: 0 }}>
              Representamos e defendemos os fonoaudiólogos cearenses desde 2010, atuando
              por melhores condições de trabalho, valorização profissional
              e benefícios exclusivos para os filiados.
            </p>
            <Link href="/sindicalizar" className="sobre-cta">
              Quero me filiar →
            </Link>
          </div>

          <div className="sobre-cards">
            {[
              {
                color: "orange",
                icon: (
                  <svg width="22" height="22" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: "Proteção Jurídica",
                desc: "Assessoria especializada na defesa dos seus direitos trabalhistas e profissionais.",
              },
              {
                color: "blue",
                icon: (
                  <svg width="22" height="22" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                title: "Força Coletiva",
                desc: "Negociações coletivas que garantem melhores salários e condições para todos.",
              },
              {
                color: "blue",
                icon: (
                  <svg width="22" height="22" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                ),
                title: "Contribuição acessível",
                desc: "Valor mensal reduzido com retorno direto em benefícios e luta constante pela classe.",
              },
            ].map((c) => (
              <div className="card" key={c.title}>
                <div className={`card-icon ${c.color}`}>{c.icon}</div>
                <div className="card-body">
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CCT ── */}
      <section className="conquistas" id="conquistas">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">CCT 2025/2026</span>
            <h2 className="section-title">
              Convenção Coletiva<br />de Trabalho
            </h2>
            <p className="section-desc">
              Vigente de setembro de 2025 a agosto de 2026, firmada pelo Sindfono CE.
              Acesse o documento completo para consultar todas as cláusulas e conquistas da categoria.
            </p>
            <a
              href="https://www3.mte.gov.br/sistemas/mediador/Resumo/ResumoVisualizar?nrSolicitacao=MR076881/2025"
              target="_blank"
              rel="noopener noreferrer"
              className="cct-link"
            >
              Acessar o documento completo da CCT →
            </a>
          </div>
        </div>
      </section>

      {/* ── ATUALIZAÇÕES / EVENTOS ── */}
      {featuredEvents.length > 0 && (
        <section id="atualizacoes" className="home-events">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Fique por dentro</span>
              <h2 className="section-title">
                Últimas<br />atualizações
              </h2>
              <p className="section-desc">
                Reuniões, assembleias, treinamentos e comunicados oficiais publicados
                pela diretoria do Sindfono CE.
              </p>
            </div>

            <div className="events-grid">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} variant="compact" />
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Link href="/eventos" className="btn-events">
                <CalendarDays size={16} /> Ver todos os eventos <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── BENEFÍCIOS ── */}
      <section className="beneficios" id="beneficios">
        <div className="container">
          <div className="section-header light">
            <span className="section-tag-light">Por que se filiar?</span>
            <h2 className="section-title light">
              O que o sindicato<br />faz por você
            </h2>
          </div>

          <div className="beneficios-list">
            {[
              "Negociação coletiva: piso salarial, reajustes e adicionais garantidos em CCT",
              "Assessoria jurídica especializada em direito trabalhista e previdenciário",
              "Representação e assistência em descumprimento de convenções ou acordos coletivos",
              "Participação em assembleias e decisões que afetam a categoria",
              "Faltas abonadas para congressos, cursos e consultas médicas de dependentes",
              "Apoio em casos de descumprimento de direitos por empregadores",
              "Rede de apoio, networking profissional e atualizações sobre legislação",
            ].map((b) => (
              <div className="beneficio-item" key={b}>
                <div className="beneficio-check">—</div>
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="contribuicao-box">
            <div className="contribuicao-info">
              <h3>Contribuição Sindical</h3>
              <p>Valores acessíveis para defender seus direitos</p>
            </div>
            <div className="contribuicao-valores">
              <div className="valor-item">
                <span className="valor-label">Matrícula</span>
                <span className="valor-preco">R$ 50<span className="valor-period">,00</span></span>
              </div>
              <div className="valor-item">
                <span className="valor-label">Mensalidade</span>
                <span className="valor-preco">R$ 12<span className="valor-period">,50/mês</span></span>
              </div>
              <div className="valor-item destaque">
                <span className="valor-label">Anuidade à vista</span>
                <span className="valor-preco">R$ 150<span className="valor-period">,00/ano</span></span>
              </div>
            </div>
          </div>

          <div className="beneficios-cta">
            <Link href="/sindicalizar" className="btn btn-primary">
              Iniciar sindicalização
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
