import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const BASE=process.env.BASE_URL||'https://www.dominaoab.com.br';
const UTM={utmSource:'qa-browser',utmMedium:'chromium',utmCampaign:'marco-a'};

await fs.mkdir('artifacts/analytics-browser-smoke',{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
await context.addInitScript(()=>{
  Object.defineProperty(navigator,'sendBeacon',{value:undefined,configurable:true});
});
const page=await context.newPage();
const events=[];
const statuses=[];

page.on('request',request=>{
  if(new URL(request.url()).pathname==='/api/analytics'&&request.method()==='POST'){
    try{events.push(JSON.parse(request.postData()||'{}'))}catch(error){console.log('ANALYTICS_PARSE_ERROR',String(error))}
  }
});
page.on('response',response=>{
  if(new URL(response.url()).pathname==='/api/analytics') statuses.push(response.status());
});

function sameUtm(event){return event&&event.utmSource===UTM.utmSource&&event.utmMedium===UTM.utmMedium&&event.utmCampaign===UTM.utmCampaign}
function log(text){console.log(`✓ ${text}`)}

try{
  await page.goto(`${BASE}/plataforma?utm_source=${UTM.utmSource}&utm_medium=${UTM.utmMedium}&utm_campaign=${UTM.utmCampaign}`,{waitUntil:'networkidle'});
  await page.waitForTimeout(500);
  await page.goto(`${BASE}/simulado`,{waitUntil:'networkidle'});

  for(let index=0;index<3;index++){
    await page.locator('.options button').first().click();
    await page.getByRole('button',{name:'Verificar resposta'}).click();
    await page.locator('.answer-feedback').waitFor({state:'visible',timeout:15000});
    if(index<2) await page.getByRole('button',{name:/Próxima questão/}).click();
    else await page.getByRole('button',{name:/Ver resultado/}).click();
  }
  await page.getByText(/SIMULADO CONCLUÍDO|TEMPO ENCERRADO/).waitFor({state:'visible',timeout:15000});
  await page.waitForTimeout(1000);

  const platformView=events.find(event=>event.eventType==='page_view'&&event.path==='/plataforma'&&sameUtm(event));
  const simulationView=events.find(event=>event.eventType==='page_view'&&event.path==='/simulado'&&sameUtm(event));
  const started=events.find(event=>event.eventType==='simulado_started'&&event.path==='/simulado'&&sameUtm(event));
  const completed=events.find(event=>event.eventType==='simulado_completed'&&event.path==='/simulado'&&sameUtm(event));

  if(!platformView) throw new Error(`page_view inicial sem UTM: ${JSON.stringify(events)}`);
  if(!simulationView) throw new Error(`UTM perdida no page_view após navegação: ${JSON.stringify(events)}`);
  if(!started) throw new Error(`UTM perdida no simulado_started: ${JSON.stringify(events)}`);
  if(!completed) throw new Error(`UTM perdida no simulado_completed: ${JSON.stringify(events)}`);
  if(statuses.length<4||statuses.some(status=>status!==204)) throw new Error(`Analytics sem HTTP 204 consistente: ${JSON.stringify(statuses)}`);

  log('page_view inicial contém UTM');
  log('UTM persiste após navegação sem query string');
  log('simulado_started mantém a atribuição original');
  log('simulado_completed mantém a atribuição original');
  log('todos os eventos observados responderam HTTP 204');
  await page.screenshot({path:'artifacts/analytics-browser-smoke/01-resultado.png',fullPage:true});
  console.log('ANALYTICS_BROWSER_SMOKE_OK');
  console.log(`EVENTS=${JSON.stringify(events)}`);
  console.log(`STATUSES=${JSON.stringify(statuses)}`);
}catch(error){
  await page.screenshot({path:'artifacts/analytics-browser-smoke/99-falha.png',fullPage:true}).catch(()=>{});
  console.error('ANALYTICS_BROWSER_SMOKE_FAILED:',error instanceof Error?error.message:error);
  process.exitCode=1;
}finally{
  await context.close();
  await browser.close();
}
