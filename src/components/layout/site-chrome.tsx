"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/#sobre",      label: "Sobre"         },
  { href: "/#conquistas", label: "CCT 2025/2026" },
  { href: "/#beneficios", label: "Benefícios"    },
  { href: "/eventos",     label: "Eventos"       },
  { href: "/diretoria",   label: "Diretoria"     },
];

function isLinkActive(pathname: string, href: string, currentHash: string): boolean {
  const hashIdx = href.indexOf("#");
  if (hashIdx >= 0) {
    const basePath = href.slice(0, hashIdx) || "/";
    const targetHash = href.slice(hashIdx);
    if (pathname !== basePath) return false;
    return currentHash === targetHash;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <header className={`header${open ? " menu-open" : ""}`}>
      <div className="container header-inner">
        <Link href="/" className="logo" onClick={close}>
          <span className="logo-frame">
            <Image
              src="/logo.png"
              alt="Sindfono CE — Sindicato dos Fonoaudiólogos do Ceará"
              width={60}
              height={60}
              sizes="64px"
              className="logo-img"
              priority
            />
          </span>
          <span className="logo-text">
            <span className="logo-main">Sindfono</span>
            <span className="logo-sub">CEARÁ</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Navegação principal">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isLinkActive(pathname, l.href, hash) ? "active" : ""}
            >
              {l.label}
            </Link>
          ))}
          <div className="header-actions">
            <Link
              href="/auth/login?next=/portal"
              className={`btn-nav-login${pathname.startsWith("/auth/login") ? " active" : ""}`}
            >
              Entrar
            </Link>
            <Link href="/sindicalizar" className="btn-nav">
              Sindicalizar-se
            </Link>
          </div>
        </nav>

        <button
          type="button"
          className={`hamburger${open ? " open" : ""}`}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      <button
        type="button"
        className={`mobile-overlay${open ? " visible" : ""}`}
        aria-label="Fechar menu"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={close}
      />

      <nav
        id="mobile-nav"
        className={`mobile-menu${open ? " open" : ""}`}
        aria-label="Menu mobile"
        aria-hidden={!open}
      >
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={isLinkActive(pathname, l.href, hash) ? "active" : ""}
            onClick={close}
          >
            {l.label}
          </Link>
        ))}
        <Link href="/auth/login?next=/portal" className="mobile-menu-login" onClick={close}>
          Entrar no portal
        </Link>
        <Link href="/sindicalizar" className="mobile-menu-cta" onClick={close}>
          Sindicalizar-se
        </Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer" id="localizacao">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-logo">
            <span className="footer-logo-frame">
              <Image
                src="/logo.png"
                alt="Sindfono CE"
                width={68}
                height={68}
                sizes="72px"
                loading="lazy"
                className="footer-logo-img"
              />
            </span>
            <div>
              <p className="footer-brand-name">Sindfono CE</p>
              <p className="footer-brand-sub">Sindicato dos Fonoaudiólogos do Estado do Ceará</p>
            </div>
          </div>

          <nav className="footer-nav" aria-label="Links do rodapé">
            <Link href="/#sobre">Sobre o sindicato</Link>
            <Link href="/#conquistas">CCT 2025/2026</Link>
            <Link href="/#beneficios">Benefícios</Link>
            <Link href="/eventos">Eventos</Link>
            <Link href="/diretoria">Diretoria</Link>
            <Link href="/auth/login?next=/portal">Entrar no portal</Link>
            <Link href="/sindicalizar">Sindicalizar-se</Link>
          </nav>

          <div className="footer-contact">
            <p>
              Fale conosco<br />
              <a href="mailto:sindfonoce@sindfonce.com">sindfonoce@sindfonce.com</a>
            </p>
            <div className="footer-social">
              <p className="footer-social-label">Redes sociais</p>
              <div className="footer-social-links">
                <a
                  href="https://www.facebook.com/sindfonoce/"
                  className="footer-social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook do Sindfono CE"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/sindfonoce"
                  className="footer-social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram do Sindfono CE"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} Sindfono CE. Todos os direitos reservados.</p>
          <p className="footer-info">Triênio 2024–2027 · Chapa Reaviva Fono</p>
        </div>
      </div>
    </footer>
  );
}
