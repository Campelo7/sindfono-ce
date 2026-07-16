import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Diretoria – Sindfono CE",
  description: "Chapa Reaviva Fono · Triênio 2024–2027. Conheça a diretoria do Sindfono CE.",
};

type Membro = {
  nome: string;
  cargo: string;
  foto: string | null;
  initials: string;
};

const EXECUTIVA: Membro[] = [
  { nome: "Josafá Justo Leite",                       cargo: "Presidência",                        foto: "/diretoria/josafa-justo-leite.png",       initials: "JL" },
  { nome: "Francisca Elza Gonçalves Araújo Studart",  cargo: "Economia e Finanças",                foto: "/diretoria/francisca-elza-studart.jpg",   initials: "FS" },
  { nome: "Nadjane Maria de Araújo Marques",          cargo: "Assuntos da Saúde",                  foto: "/diretoria/nadjane-maria-marques.png",    initials: "NM" },
  { nome: "Adriana Araújo Castello Branco",           cargo: "Formação e Relações Sindicais",      foto: "/diretoria/adriana-araujo-branco.png",    initials: "AB" },
  { nome: "Rafaela Lessa Cavalcante",                  cargo: "Pesquisa, Divulgação e Imprensa",    foto: "/diretoria/rafaela-lessa-cavalcante.jpg", initials: "RC" },
  { nome: "Adna Santos Lima Aragão",                  cargo: "Assuntos Jurídicos",                 foto: "/diretoria/adna-santos-aragao.png",       initials: "AA" },
];

const SUPLENTES_EXEC: Membro[] = [
  { nome: "Renan da Rocha Lira",                      cargo: "Suplente · Economia e Finanças",            foto: "/diretoria/renan-da-rocha-lira.jpg", initials: "RL" },
  { nome: "Douglas da Silva Barroso",                 cargo: "Suplente · Assuntos da Saúde",              foto: "/diretoria/douglas-silva-barroso.png",    initials: "DB" },
  { nome: "Vicente Rodrigues dos Santos Júnior",      cargo: "Suplente · Formação e Relações Sindicais",  foto: "/diretoria/vicente-rodrigues-junior.png", initials: "VJ" },
  { nome: "Maria Laura Barbosa Rocha Carneiro",       cargo: "Suplente · Pesquisa, Divulgação e Imprensa",foto: "/diretoria/maria-laura-carneiro.png",     initials: "MC" },
];

const CONSELHO: Membro[] = [
  { nome: "Ana Paula Rocha",                          cargo: "Conselho Fiscal",  foto: "/diretoria/ana-paula-rocha.png",             initials: "AR" },
  { nome: "Emanuela Oliveira Soares Balbino",         cargo: "Conselho Fiscal",  foto: "/diretoria/emanuela-oliveira-balbino.png",   initials: "EB" },
];

const SUPLENTES_CONSELHO: Membro[] = [
  { nome: "Kelviane Batista Saraiva Luz",             cargo: "Suplente · Conselho Fiscal", foto: "/diretoria/kelviane-batista-luz.png",      initials: "KL" },
  { nome: "Palloma Ferreira Alves",                   cargo: "Suplente · Conselho Fiscal", foto: "/diretoria/palloma-ferreira-alves.jpg",    initials: "PA" },
  { nome: "Hugo Leandro Cavalcante de Medeiros",      cargo: "Suplente · Conselho Fiscal", foto: "/diretoria/hugo-leandro-medeiros.jpg", initials: "HM" },
];

function MembroCard({ membro }: { membro: Membro }) {
  return (
    <div className="membro-card">
      <div className={`membro-foto${membro.foto ? "" : " sem-foto"}`} style={{ position: "relative" }}>
        {membro.foto && (
          <Image
            src={membro.foto}
            alt={membro.nome}
            fill
            sizes="148px"
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
          />
        )}
        <div className="membro-initials">{membro.initials}</div>
      </div>
      <div className="membro-info">
        <p className="membro-cargo">{membro.cargo}</p>
        <h3 className="membro-nome">{membro.nome}</h3>
      </div>
    </div>
  );
}

function Grupo({ title, membros }: { title: string; membros: Membro[] }) {
  return (
    <div className="diretoria-grupo">
      <h3 className="diretoria-grupo-title">{title}</h3>
      <div className="diretoria-grid">
        {membros.map((m) => (
          <MembroCard key={m.nome} membro={m} />
        ))}
      </div>
    </div>
  );
}

export default function DiretoriaPage() {
  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">Nossa gestão</div>
            <h1 className="hero-title">
              Diretoria do<br />
              <em className="highlight">Sindfono CE</em>
            </h1>
            <p className="hero-desc">
              Chapa Reaviva Fono · Triênio 2024 – 2027. Conheça quem representa
              e trabalha pela categoria no Estado do Ceará.
            </p>
          </div>
        </div>
      </section>

      {/* Membros */}
      <section className="diretoria diretoria-page">
        <div className="container">
          <Grupo title="Diretoria Executiva"              membros={EXECUTIVA}           />
          <Grupo title="Suplentes da Diretoria Executiva" membros={SUPLENTES_EXEC}      />
          <Grupo title="Conselho Fiscal"                  membros={CONSELHO}            />
          <Grupo title="Suplentes do Conselho Fiscal"     membros={SUPLENTES_CONSELHO}  />
        </div>
      </section>
    </>
  );
}
