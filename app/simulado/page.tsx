"use client";

import { AppHeader } from "@/components/app-header";
import { AlertCircle,ArrowLeft,ArrowRight,Bookmark,CircleCheck,Clock3,Flag,LoaderCircle,LockKeyhole,RotateCcw,ShieldCheck,X } from "lucide-react";
import Link from "next/link";
import { useEffect,useRef,useState } from "react";
import { trackAnalytics } from "@/lib/analytics";

type SimulationMode="study"|"exam";
type Question={id:number;code:string;discipline:string;discipline_slug:string;topic:string|null;statement:string;options:string[];difficulty:string;position:number;option_order:number[]};
type Definition={id:number;slug:string;name:string;description:string|null;question_count:number;time_limit_minutes:number|null;randomize_questions:boolean;randomize_options:boolean};
type Payload={definition:Definition;saved:boolean;attempt_id:number|null;questions:Question[];mode?:SimulationMode};
type Verification={correct:boolean;correct_index:number;explanation:string;answer_locked?:boolean};
type ExamResult={question_id:number;selected_index:number|null;correct:boolean|null;correct_index:number;explanation:string};
type FinishPayload={error?:string;results?:ExamResult[]};
type ReportState={open:boolean;reason:string;message:string;sending:boolean;sent:boolean;error:string};
const initialReport:ReportState={open:false,reason:"gabarito",message:"",sending:false,sent:false,error:""};

export default function Simulado(){
  const [mode,setMode]=useState<SimulationMode>("exam");
  const [questions,setQuestions]=useState<Question[]>([]);
  const [definition,setDefinition]=useState<Definition|null>(null);
  const [saved,setSaved]=useState(false);
  const [attemptId,setAttemptId]=useState<number|null>(null);
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState("");
  const [current,setCurrent]=useState(0);
  const [answers,setAnswers]=useState<(number|null)[]>([]);
  const [verified,setVerified]=useState<Record<number,Verification>>({});
  const [verifying,setVerifying]=useState(false);
  const [savingAnswer,setSavingAnswer]=useState(false);
  const [finished,setFinished]=useState(false);
  const [timedOut,setTimedOut]=useState(false);
  const [timeLeft,setTimeLeft]=useState<number|null>(null);
  const [report,setReport]=useState<ReportState>(initialReport);
  const started=useRef(false);
  const finishing=useRef(false);
  const completionTracked=useRef(false);

  async function loadSimulation(){
    setLoading(true);setLoadError("");setFinished(false);setTimedOut(false);setVerified({});setCurrent(0);setReport(initialReport);started.current=false;finishing.current=false;completionTracked.current=false;
    try{
      const url=new URL(window.location.href);
      const slug=url.searchParams.get("slug")||"simulado-etica";
      const requestedMode:SimulationMode=url.searchParams.get("mode")==="study"?"study":"exam";
      setMode(requestedMode);
      const response=await fetch(`/api/simulations?slug=${encodeURIComponent(slug)}&mode=${requestedMode}`,{cache:"no-store"});
      const data=await response.json() as Payload&{error?:string};
      if(!response.ok) throw new Error(data.error||"Erro ao carregar simulado.");
      setDefinition(data.definition);setSaved(Boolean(data.saved));setAttemptId(data.attempt_id??null);setQuestions(data.questions||[]);setAnswers(Array(data.questions?.length||0).fill(null));
      setTimeLeft(data.definition.time_limit_minutes?data.definition.time_limit_minutes*60:null);
    }catch(e){setLoadError(e instanceof Error?e.message:"Erro ao carregar simulado.");setQuestions([]);}finally{setLoading(false);}
  }

  function trackCompletedOnce(){
    if(completionTracked.current) return;
    completionTracked.current=true;
    trackAnalytics("simulado_completed");
  }

  useEffect(()=>{void loadSimulation();},[]);
  useEffect(()=>{
    if(timeLeft===null||finished||loading) return;
    const timer=window.setInterval(()=>setTimeLeft(value=>{
      if(value===null) return null;
      if(value<=1){window.clearInterval(timer);void complete(true);return 0;}
      return value-1;
    }),1000);
    return ()=>window.clearInterval(timer);
  },[timeLeft===null,finished,loading,attemptId,mode]);

  if(loading) return <main className="app-surface"><AppHeader active="simulado"/><div className="practice-shell"><section className="result-card"><LoaderCircle className="spin"/><h1>Preparando simulado...</h1></section></div></main>;
  if(loadError&&questions.length===0) return <main className="app-surface"><AppHeader active="simulado"/><div className="practice-shell"><section className="result-card"><AlertCircle/><h1>Não foi possível abrir o simulado.</h1><p>{loadError}</p></section></div></main>;
  if(questions.length===0||!definition) return <main className="app-surface"><AppHeader active="simulado"/><div className="practice-shell"><section className="result-card"><AlertCircle/><h1>Não foi possível abrir o simulado.</h1><p>Nenhuma questão disponível para esta prova.</p></section></div></main>;

  const q=questions[current];
  const result=verified[q.id];
  const verifiedCount=Object.keys(verified).length;
  const answeredCount=answers.filter(value=>value!==null).length;
  const score=Object.values(verified).filter(v=>v.correct).length;

  async function select(option:number){
    if(finished||savingAnswer||(mode==="study"&&result)) return;
    if(!started.current){started.current=true;trackAnalytics("simulado_started");}
    const previous=answers[current];
    setAnswers(values=>values.map((value,index)=>index===current?option:value));

    if(mode==="exam"&&attemptId){
      setSavingAnswer(true);setLoadError("");
      try{
        const response=await fetch("/api/simulations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"record",attempt_id:attemptId,question_id:q.id,selected_index:option})});
        const data=await response.json() as {error?:string;expired?:boolean};
        if(!response.ok){
          if(data.expired){setTimedOut(true);await complete(true);}
          throw new Error(data.error||"Não foi possível salvar a resposta.");
        }
      }catch(e){
        setAnswers(values=>values.map((value,index)=>index===current?previous:value));
        setLoadError(e instanceof Error?e.message:"Não foi possível salvar a resposta.");
      }finally{setSavingAnswer(false);}
    }
  }

  async function verify(){
    if(mode!=="study") return;
    const option=answers[current];
    if(option===null) return;
    setVerifying(true);setLoadError("");
    try{
      const response=await fetch("/api/simulations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"answer",attempt_id:attemptId,question_id:q.id,selected_index:option,option_order:q.option_order})});
      const data=await response.json() as Verification&{error?:string;expired?:boolean};
      if(!response.ok){
        if(data.expired){setTimedOut(true);setFinished(true);trackCompletedOnce();}
        throw new Error(data.error||"Não foi possível verificar a resposta.");
      }
      setVerified(values=>({...values,[q.id]:data}));
    }catch(e){if(!(e instanceof Error&&e.message.includes("tempo"))) setLoadError(e instanceof Error?e.message:"Erro ao verificar resposta.");}finally{setVerifying(false);}
  }

  async function gradeGuestExam(){
    const graded:Record<number,Verification>={};
    for(let index=0;index<questions.length;index++){
      const selected=answers[index];
      if(selected===null) continue;
      const question=questions[index];
      const response=await fetch("/api/simulations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"answer",attempt_id:null,question_id:question.id,selected_index:selected,option_order:question.option_order})});
      const data=await response.json() as Verification&{error?:string};
      if(!response.ok) throw new Error(data.error||"Não foi possível corrigir o simulado.");
      graded[question.id]=data;
    }
    setVerified(graded);
  }

  async function complete(byTimeout=false){
    if(finishing.current) return;
    finishing.current=true;
    if(byTimeout) setTimedOut(true);
    setLoadError("");
    try{
      if(mode==="exam"){
        if(attemptId){
          const response=await fetch("/api/simulations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"finish",attempt_id:attemptId})});
          const data=await response.json() as FinishPayload;
          if(!response.ok) throw new Error(data.error||"Não foi possível concluir o simulado.");
          const graded:Record<number,Verification>={};
          for(const item of data.results||[]){
            if(item.selected_index===null||item.correct===null) continue;
            graded[item.question_id]={correct:item.correct,correct_index:item.correct_index,explanation:item.explanation,answer_locked:true};
          }
          setVerified(graded);
        }else{
          await gradeGuestExam();
        }
      }else if(attemptId){
        const response=await fetch("/api/simulations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"finish",attempt_id:attemptId})});
        const data=await response.json() as {error?:string};
        if(!response.ok) throw new Error(data.error||"Não foi possível concluir o simulado.");
      }
      trackCompletedOnce();
      setFinished(true);
    }catch(e){
      if(byTimeout) setTimeLeft(null);
      setLoadError(e instanceof Error?e.message:"Não foi possível concluir o simulado.");
    }finally{finishing.current=false;}
  }

  async function sendReport(){
    setReport(v=>({...v,sending:true,error:""}));
    try{
      const response=await fetch("/api/questions/report",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question_id:q.id,reason:report.reason,message:report.message})});
      const data=await response.json() as {error?:string};
      if(!response.ok) throw new Error(data.error||"Não foi possível enviar o reporte.");
      setReport(v=>({...v,sending:false,sent:true}));
    }catch(e){setReport(v=>({...v,sending:false,error:e instanceof Error?e.message:"Erro ao enviar reporte."}));}
  }

  const modeHref=(target:SimulationMode)=>`/simulado?slug=${encodeURIComponent(definition.slug)}&mode=${target}`;

  return <main className="app-surface"><AppHeader active="simulado"/><div className="practice-shell">{!finished?<>
    <aside className="practice-diagnostic">
      <span className="eyebrow"><span/> {saved?"Acesso Domina":"Modo visitante"}</span><h1>{definition.name}</h1>
      <p>{mode==="study"?"Modo estudo: confira a resposta e a fundamentação depois de cada questão. A alternativa fica travada após a correção.":"Simulado tradicional: responda e revise livremente. Gabarito e explicações aparecem somente ao concluir."}</p>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"16px 0"}}>
        <Link className={mode==="exam"?"button button-small":"button button-small button-secondary"} href={modeHref("exam")}>Tradicional</Link>
        <Link className={mode==="study"?"button button-small":"button button-small button-secondary"} href={modeHref("study")}>Modo estudo</Link>
      </div>
      <div className="sprint-score"><div><strong>{Math.round(((mode==="study"?verifiedCount:answeredCount)/questions.length)*100)}</strong><span>%</span></div><p><b>{mode==="study"?verifiedCount:answeredCount} de {questions.length}</b> {mode==="study"?"questões verificadas":"questões respondidas"}</p></div>
      {!saved&&<><div className="visitor-lock"><LockKeyhole/><div><small>DIAGNÓSTICO PROTEGIDO</small><b>Domínio por tema, padrões de erro e plano de ação</b><p>Disponíveis no Plano Domina.</p></div></div><Link className="plan-link" href="/#planos"><LockKeyhole size={16}/>Conhecer o Plano Domina<ArrowRight size={15}/></Link></>}
    </aside>

    <section className="practice-main">
      <div className="practice-top"><div><small>{mode==="study"?"MODO ESTUDO":"SIMULADO TRADICIONAL"} · {q.discipline.toUpperCase()}</small><h2>{definition.name}</h2>{definition.description&&<p>{definition.description}</p>}</div><div><span><Clock3 size={15}/>{timeLeft===null?"Sem limite":formatTime(timeLeft)}</span><span><ShieldCheck size={15}/>{definition.randomize_questions?"Questões embaralhadas":"Ordem definida"}</span></div></div>
      {loadError&&<p className="form-error" role="alert">{loadError}</p>}
      <div className="question-toolbar"><span>QUESTÃO {String(current+1).padStart(2,"0")} DE {questions.length}</span><span>ASSUNTO: {q.topic||"GERAL"}</span></div>
      <article className="question-surface"><h3>{q.statement}</h3><div className="options">{q.options.map((option,index)=>{const selected=answers[current]===index;const correct=Boolean(result)&&index===result.correct_index;const wrong=Boolean(result)&&selected&&index!==result.correct_index;return <button className={`${selected?"selected":""} ${correct?"correct":""} ${wrong?"wrong":""}`} disabled={finished||savingAnswer||(mode==="study"&&Boolean(result))} onClick={()=>void select(index)} key={`${q.id}-${index}`}><span>{String.fromCharCode(65+index)}</span><b>{option}</b>{correct&&<CircleCheck size={19}/>} {wrong&&<X size={19}/>}</button>})}</div>
        <div className="question-actions"><div><button><Bookmark size={16}/>Marcar para revisão</button><button onClick={()=>setReport({...initialReport,open:true})}><Flag size={16}/>Reportar questão</button></div>
          {mode==="study"?(!result?<button className="verify" disabled={answers[current]===null||verifying} onClick={()=>void verify()}>{verifying?<LoaderCircle className="spin" size={16}/>:null}Verificar resposta</button>:current<questions.length-1?<button className="verify" onClick={()=>{setCurrent(v=>v+1);setReport(initialReport);}}>Próxima questão <ArrowRight size={16}/></button>:<button className="verify" onClick={()=>void complete(false)}>Ver resultado <ArrowRight size={16}/></button>):current<questions.length-1?<button className="verify" disabled={savingAnswer} onClick={()=>{setCurrent(v=>v+1);setReport(initialReport);}}>Próxima questão <ArrowRight size={16}/></button>:<button className="verify" disabled={savingAnswer||finishing.current} onClick={()=>void complete(false)}>Finalizar simulado <ArrowRight size={16}/></button>}
        </div>
        {mode==="study"&&result&&<div className={`answer-feedback ${result.correct?"is-correct":"is-wrong"}`}><div>{result.correct?<CircleCheck/>:<AlertCircle/>}<strong>{result.correct?"Resposta correta":"Resposta incorreta"}</strong></div><p><b>Fundamentação:</b> {result.explanation}</p></div>}
        {mode==="exam"&&<p style={{marginTop:14,fontSize:14,opacity:.75}}>{savingAnswer?"Salvando resposta...":saved?"Resposta salva. Você pode alterá-la enquanto o simulado estiver aberto.":"Você pode alterar esta resposta antes de concluir o simulado."}</p>}
        {report.open&&<div style={{marginTop:18,padding:18,border:"1px solid #ddd8ce",background:"#fff"}}>{report.sent?<div><CircleCheck/><strong>Reporte enviado.</strong><p>A equipe poderá revisar esta questão pelo painel administrativo.</p><button onClick={()=>setReport(initialReport)}>Fechar</button></div>:<><div style={{display:"flex",justifyContent:"space-between"}}><strong>Reportar questão {q.code}</strong><button onClick={()=>setReport(initialReport)} aria-label="Fechar"><X size={16}/></button></div><select value={report.reason} onChange={e=>setReport(v=>({...v,reason:e.target.value}))} style={{width:"100%",marginTop:12,padding:10}}><option value="gabarito">Gabarito possivelmente incorreto</option><option value="enunciado">Problema no enunciado</option><option value="explicacao">Problema na explicação</option><option value="desatualizada">Conteúdo desatualizado</option><option value="duplicada">Questão duplicada</option><option value="outro">Outro</option></select><textarea value={report.message} onChange={e=>setReport(v=>({...v,message:e.target.value}))} placeholder="Descreva o problema (opcional)" rows={3} style={{width:"100%",marginTop:10,padding:10}}/>{report.error&&<p className="form-error">{report.error}</p>}<button className="button button-small" disabled={report.sending} onClick={()=>void sendReport()}>{report.sending?<LoaderCircle className="spin" size={15}/>:<Flag size={15}/>}Enviar reporte</button></>}</div>}
      </article>
      <div className="practice-footer"><button disabled={current===0} onClick={()=>{setCurrent(v=>v-1);setReport(initialReport);}}><ArrowLeft size={16}/>Anterior</button><div>{questions.map((item,index)=><button aria-label={`Ir para questão ${index+1}`} onClick={()=>{setCurrent(index);setReport(initialReport);}} className={`${index===current?"current":""} ${(mode==="study"?verified[item.id]:answers[index]!==null)?"answered":""}`} key={item.id}>{index+1}</button>)}</div><span>{mode==="study"?verifiedCount:answeredCount}/{questions.length} {mode==="study"?"verificadas":"respondidas"}</span></div>
    </section>
  </>:<section className="result-card"><span className="result-kicker">{timedOut?"TEMPO ENCERRADO":mode==="study"?"MODO ESTUDO CONCLUÍDO":"SIMULADO CONCLUÍDO"}</span><div className="result-score"><strong>{score}</strong><span>de {questions.length}</span></div><h1>{timedOut?"O tempo definido para esta prova terminou.":score>=Math.ceil(questions.length*.6)?"Você teve um bom resultado nesta sessão.":"Há espaço para melhorar na próxima tentativa."}</h1><p>{saved?"Seu desempenho foi registrado no histórico e já alimenta seu diagnóstico.":"Este é o resultado básico do modo visitante. O desempenho não foi salvo."}</p><div className="result-breakdown">{questions.map((item,index)=>{const v=verified[item.id];return <div key={item.id}><span className={v?.correct?"right":"wrong"}>{v?.correct?"Acertou":v?"Errou":"Não respondida"}</span><b>Questão {String(index+1).padStart(2,"0")}</b><small>Gabarito: {v?String.fromCharCode(65+v.correct_index):"não verificada"}</small></div>})}</div>{!saved&&<div className="result-locked"><LockKeyhole/><div><small>EXCLUSIVO DO PLANO DOMINA</small><h2>Transforme esta tentativa em diagnóstico.</h2><p>Salve o desempenho, identifique padrões por tema e receba um plano personalizado.</p></div></div>}<div className="result-actions">{saved?<Link className="button" href="/desempenho">Ver meu diagnóstico <ArrowRight size={17}/></Link>:<Link className="button" href="/#planos">Conhecer o Plano Domina <ArrowRight size={17}/></Link>}<button onClick={()=>void loadSimulation()}><RotateCcw size={16}/>Novo {mode==="study"?"estudo":"simulado"}</button></div></section>}</div></main>;
}

function formatTime(total:number){const minutes=Math.floor(total/60);const seconds=total%60;return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;}
