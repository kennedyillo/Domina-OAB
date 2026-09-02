import { BarChart3, BookOpen, ClipboardCheck, LockKeyhole, Radar } from "lucide-react";
import Link from "next/link";

export function Brand({compact=false}:{compact?:boolean}) {
  return <Link className={`brand ${compact ? "brand-compact" : ""}`} href="/" aria-label="Domina OAB — início">
    <span className="brand-seal" aria-hidden="true"><span>D</span></span>
    <span className="brand-name">Domina <b>OAB</b></span>
  </Link>;
}

export function AppHeader({active,access="visitor"}:{active:"inicio"|"disciplinas"|"simulado";access?:"visitor"|"subscriber"}){
  return <header className="app-header">
    <Brand compact/>
    <nav className="app-nav" aria-label="Área de estudos">
      <a className={active==="inicio"?"active":""} href="/plataforma"><BarChart3 size={16}/>Visão geral</a>
      <a href="/plataforma#diagnostico"><Radar size={16}/>Diagnóstico</a>
      <a className={active==="disciplinas"?"active":""} href="/disciplinas"><BookOpen size={16}/>Disciplinas</a>
      <a className={active==="simulado"?"active":""} href="/simulado"><ClipboardCheck size={16}/>Simulados</a>
    </nav>
    <div className="app-tools">
      <div className="phase-control" aria-label="Fase do Exame de Ordem">
        <span className="phase-active">1ª fase</span>
        <span className="phase-future"><LockKeyhole size={12}/>2ª fase</span>
      </div>
      <div className="student-chip"><span>{access==="subscriber"?"DO":"V"}</span><div><b>{access==="subscriber"?"Minha conta":"Visitante"}</b><small>{access==="subscriber"?"PLANO DOMINA":"NÃO SALVA DESEMPENHO"}</small></div></div>
    </div>
  </header>;
}
