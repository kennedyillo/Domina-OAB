import { Radar, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

const capabilities = [
  { icon: Radar, title: "Diagnóstico por tema", copy: "Cada resposta ajuda a revelar padrões de domínio e lacunas reais." },
  { icon: Target, title: "Prioridades orientadas", copy: "O próximo passo é definido pelo impacto potencial no seu desempenho." },
  { icon: TrendingUp, title: "Evolução mensurável", copy: "Seu histórico transforma sessões isoladas em uma leitura contínua da preparação." },
];

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return <main className="auth-surface">
    <div className="auth-ambient auth-ambient-one" aria-hidden="true" />
    <div className="auth-ambient auth-ambient-two" aria-hidden="true" />
    <section className="auth-shell">
      <aside className="auth-context">
        <Link href="/" className="auth-lockup" aria-label="Domina OAB — início">
          <img src="/brand/wordmark-lockup-dark.svg" alt="Domina OAB" />
        </Link>
        <div className="auth-context-copy">
          <span className="auth-context-kicker">INTELIGÊNCIA DE DESEMPENHO</span>
          <h2>Sua preparação, lida como dados.</h2>
          <p>Entre em um ambiente que transforma respostas em diagnóstico, prioridade e evolução. A mesma lógica do produto, desde o primeiro acesso.</p>
        </div>
        <div className="auth-capabilities">
          {capabilities.map(({ icon: Icon, title: itemTitle, copy }) => <div className="auth-capability" key={itemTitle}>
            <span><Icon size={18} /></span>
            <div><b>{itemTitle}</b><small>{copy}</small></div>
          </div>)}
        </div>
        <div className="auth-context-footer"><span>Evidência</span><i /><span>Prioridade</span><i /><span>Evolução</span></div>
      </aside>

      <section className="auth-card">
        <Link href="/" className="auth-mobile-brand" aria-label="Domina OAB — início">
          <img src="/brand/icon-color.svg" alt="" aria-hidden="true" />
          <span>Domina <b>OAB</b></span>
        </Link>
        <div className="auth-heading">
          <small>{eyebrow}</small>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </section>
    </section>
  </main>;
}
