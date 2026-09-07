import { chromium } from 'playwright';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';

const BASE=process.env.BASE_URL||'https://www.dominaoab.com.br';
const RUN=`${process.env.GITHUB_RUN_ID||Date.now()}-${process.env.GITHUB_RUN_ATTEMPT||'1'}`;
const EMAIL=`kmps16+dominaqa-rbac-${RUN}@gmail.com`;
const PASSWORD=`Qa!${crypto.randomBytes(18).toString('base64url')}`;
const NAME=`QA RBAC ${RUN}`;

await fs.mkdir('artifacts/rbac-mobile-smoke',{recursive:true});
function log(text){console.log(`✓ ${text}`)}
async function shot(page,name){await page.screenshot({path:`artifacts/rbac-mobile-smoke/${name}.png`,fullPage:true})}
async function noOverflow(page,label){
  const result=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  if(result.scroll>result.width+2) throw new Error(`${label} com overflow horizontal: ${result.scroll}px > ${result.width}px`);
  log(`${label} sem overflow horizontal`);
}

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();

try{
  await page.goto(`${BASE}/cadastro`,{waitUntil:'networkidle'});
  await noOverflow(page,'/cadastro mobile');
  await page.getByLabel('Nome completo').fill(NAME);
  await page.getByLabel('E-mail').fill(EMAIL);
  await page.getByLabel('Senha').fill(PASSWORD);
  await Promise.all([
    page.waitForURL(url=>url.pathname==='/conta'||url.pathname==='/cadastro',{timeout:20000}),
    page.getByRole('button',{name:'Criar conta'}).click(),
  ]);
  if(!page.url().includes('/conta')) throw new Error(`Cadastro comum não chegou a /conta: ${page.url()}`);
  log('conta comum criada e autenticada');
  await noOverflow(page,'/conta mobile');

  await page.goto(`${BASE}/preferencias`,{waitUntil:'networkidle'});
  await page.getByRole('checkbox').first().waitFor({state:'visible',timeout:15000});
  await noOverflow(page,'/preferencias mobile');

  await page.goto(`${BASE}/plataforma`,{waitUntil:'networkidle'});
  await noOverflow(page,'/plataforma mobile');

  await page.goto(`${BASE}/admin`,{waitUntil:'networkidle'});
  await page.waitForURL(url=>url.pathname==='/admin/login'&&url.searchParams.get('return_to')==='/admin',{timeout:15000});
  if(await page.getByText('Visão geral',{exact:true}).count()) throw new Error('Usuário comum visualizou conteúdo administrativo.');
  await shot(page,'01-usuario-comum-negado-admin-mobile');
  log('usuário comum autenticado negado em /admin sem vazamento do painel');
  await noOverflow(page,'/admin/login mobile');

  await page.goto(`${BASE}/entrar`,{waitUntil:'networkidle'});
  await noOverflow(page,'/entrar mobile');

  await page.setViewportSize({width:1440,height:900});
  for(const path of ['/conta','/preferencias','/plataforma','/cadastro','/entrar']){
    await page.goto(`${BASE}${path}`,{waitUntil:'networkidle'});
    await noOverflow(page,`${path} desktop`);
  }
  await shot(page,'02-regressao-desktop');

  console.log('RBAC_MOBILE_SMOKE_OK');
  console.log(`QA_EMAIL=${EMAIL}`);
}catch(error){
  await shot(page,'99-falha').catch(()=>{});
  console.error('RBAC_MOBILE_SMOKE_FAILED:',error instanceof Error?error.message:error);
  process.exitCode=1;
}finally{
  await context.close();
  await browser.close();
}
