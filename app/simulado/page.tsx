"use client";
import { AppHeader } from "@/components/app-header";
import { AlertCircle, ArrowLeft, ArrowRight, Bookmark, CircleCheck, Clock3, Flag, LockKeyhole, RotateCcw, ShieldCheck, X } from "lucide-react";
import { useRef, useState } from "react";
import Link from "next/link";
import { trackAnalytics } from "@/lib/analytics";

const questions=[
  {topic:"Princípios fundamentais",text:"No exercício profissional, qual conduta está alinhada ao papel social da advocacia?",options:["Tratar a atividade exclusivamente como comércio","Atuar com independência, honestidade e compromisso com a Justiça","Subordinar a orientação jurídica à conveniência de terceiros","Priorizar a publicidade pessoal sobre o interesse do cliente"],correct:1,basis:"A advocacia é função essencial à Justiça e deve ser exercida com independência, honestidade e observância da função social da profissão."},
  {topic:"Sigilo profissional",text:"O dever de sigilo profissional do advogado alcança informações recebidas em razão de sua atividade?",options:["Não, quando ainda não existe processo judicial","Sim, inclusive informações recebidas em consulta, salvo hipóteses legalmente justificadas","Somente quando o cliente assina termo específico","Apenas informações presentes em autos sigilosos"],correct:1,basis:"O sigilo alcança fatos conhecidos em razão do exercício profissional, inclusive durante consultas, ressalvadas as hipóteses justificadas pelo Código de Ética."},
  {topic:"Honorários advocatícios",text:"Ao ajustar honorários, qual prática melhor preserva a transparência na relação com o cliente?",options:["Definir apenas verbalmente para permitir alterações","Omitir despesas previsíveis até o final do serviço","Formalizar condições, valores e extensão do serviço contratado","Vincular todo pagamento obrigatoriamente ao êxito"],correct:2,basis:"O contrato escrito delimita o serviço, a forma de pagamento, as despesas e as responsabilidades, reduzindo ambiguidades na relação profissional."},
];

export default function Simulado(){
  const [current,setCurrent]=useState(0);
  const [answers,setAnswers]=useState<(number|null)[]>(Array(questions.length).fill(null));
  const [verified,setVerified]=useState<boolean[]>(Array(questions.length).fill(false));
  const [finished,setFinished]=useState(false);
  const started=useRef(false);
  const q=questions[current];
  const score=answers.filter((answer,index)=>answer===questions[index].correct).length;
  const select=(option:number)=>{if(!verified[current]){if(!started.current){started.current=true;trackAnalytics("simulado_started");}setAnswers(values=>values.map((value,index)=>index===current?option:value));}};
  const verify=()=>setVerified(values=>values.map((value,index)=>index===current?true:value));
  const reset=()=>{setAnswers(Array(questions.length).fill(null));setVerified(Array(questions.length).fill(false));setCurrent(0);setFinished(false);started.current=false;};
  const finish=()=>{trackAnalytics("simulado_completed");setFinished(true);};

  return <main className="app-surface"><AppHeader active="simulado"/><div className="practice-shell">{!finished?<>
    <aside className="practice-diagnostic">
      <span className="eyebrow"><span/> Modo visitante</span><h1>Ética Profissional</h1><p>Você pode concluir o simulado normalmente. Esta tentativa não será salva.</p>
      <div className="sprint-score"><div><strong>{Math.round((verified.filter(Boolean).length/questions.length)*100)}</strong><span>%</span></div><p><b>{verified.filter(Boolean).length} de {questions.length}</b> questões verificadas</p></div>
      <div className="visitor-lock"><LockKeyhole/><div><small>DIAGNÓSTICO PROTEGIDO</small><b>Domínio por tema, padrões de erro e plano de ação</b><p>Disponíveis no Plano Domina.</p></div></div>
      <Link className="plan-link" href="/#planos"><LockKeyhole size={16}/>Conhecer o Plano Domina<Chevron/></Link>
    </aside>

    <section className="practice-main">
      <div className="practice-top"><div><small>PRATICAR · ÉTICA PROFISSIONAL</small><h2>Diagnóstico por questões</h2></div><div><span><Clock3 size={15}/>Sem limite</span><span><ShieldCheck size={15}/>Questões autorais</span></div></div>
      <div className="question-toolbar"><span>QUESTÃO {String(current+1).padStart(2,"0")} DE {questions.length}</span><span>ASSUNTO: {q.topic}</span></div>
      <article className="question-surface"><h3>{q.text}</h3><div className="options">{q.options.map((option,index)=>{const selected=answers[current]===index;const correct=verified[current]&&index===q.correct;const wrong=verified[current]&&selected&&index!==q.correct;return <button className={`${selected?"selected":""} ${correct?"correct":""} ${wrong?"wrong":""}`} disabled={verified[current]} onClick={()=>select(index)} key={option}><span>{String.fromCharCode(65+index)}</span><b>{option}</b>{correct&&<CircleCheck size={19}/>} {wrong&&<X size={19}/>}</button>})}</div>
        <div className="question-actions"><div><button><Bookmark size={16}/>Marcar para revisão</button><button><Flag size={16}/>Reportar questão</button></div>{!verified[current]?<button className="verify" disabled={answers[current]===null} onClick={verify}>Verificar resposta</button>:current<questions.length-1?<button className="verify" onClick={()=>setCurrent(value=>value+1)}>Próxima questão <ArrowRight size={16}/></button>:<button className="verify" onClick={finish}>Ver diagnóstico <ArrowRight size={16}/></button>}</div>
        {verified[current]&&<div className={`answer-feedback ${answers[current]===q.correct?"is-correct":"is-wrong"}`}><div>{answers[current]===q.correct?<CircleCheck/>:<AlertCircle/>}<strong>{answers[current]===q.correct?"Resposta correta":"Resposta incorreta"}</strong></div><p><b>Fundamentação:</b> {q.basis}</p></div>}
      </article>
      <div className="practice-footer"><button disabled={current===0} onClick={()=>setCurrent(value=>value-1)}><ArrowLeft size={16}/>Anterior</button><div>{questions.map((_,index)=><button aria-label={`Ir para questão ${index+1}`} onClick={()=>setCurrent(index)} className={`${index===current?"current":""} ${verified[index]?"answered":""}`} key={index}>{index+1}</button>)}</div><span>{verified.filter(Boolean).length}/{questions.length} verificadas</span></div>
    </section>
  </>:<section className="result-card"><span className="result-kicker">SIMULADO CONCLUÍDO</span><div className="result-score"><strong>{score}</strong><span>de {questions.length}</span></div><h1>{score>=2?"Você teve um bom resultado nesta sessão.":"Há espaço para melhorar na próxima tentativa."}</h1><p>Este é o resultado básico do modo visitante. Você pode conferir suas respostas, mas o desempenho não será salvo.</p><div className="result-breakdown">{questions.map((item,index)=><div key={item.topic}><span className={answers[index]===item.correct?"right":"wrong"}>{answers[index]===item.correct?"Acertou":"Errou"}</span><b>Questão {String(index+1).padStart(2,"0")}</b><small>Gabarito: {String.fromCharCode(65+item.correct)}</small></div>)}</div><div className="result-locked"><LockKeyhole/><div><small>EXCLUSIVO DO PLANO DOMINA</small><h2>Transforme esta tentativa em diagnóstico.</h2><p>Salve o desempenho, identifique padrões por tema e receba um plano personalizado para a próxima sessão.</p></div></div><div className="result-actions"><Link className="button" href="/#planos">Conhecer o Plano Domina <ArrowRight size={17}/></Link><button onClick={reset}><RotateCcw size={16}/>Refazer simulado</button></div><small>Conteúdo demonstrativo sujeito a revisão jurídica antes do lançamento comercial.</small></section>}</div></main>;
}

function Chevron(){return <ArrowRight size={15}/>}
