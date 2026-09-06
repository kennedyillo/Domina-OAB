import { chromium } from 'playwright';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';

const BASE = process.env.BASE_URL || 'https://www.dominaoab.com.br';
const RUN = process.env.GITHUB_RUN_ID || Date.now().toString();
const PRIMARY_EMAIL = `kmps16+dominaqa-${RUN}@gmail.com`;
const SECONDARY_EMAIL = `kmps16+dominaqa-${RUN}-dup@gmail.com`;
const PASSWORD = `Qa!${crypto.randomBytes(18).toString('base64url')}`;
const NAME = `QA Domina ${RUN}`;
const SECOND_NAME = `QA Duplicidade ${RUN}`;

function makeCpf(seed) {
  let digits = String(seed).replace(/\D/g, '').slice(-9).padStart(9, '1').split('').map(Number);
  if (new Set(digits).size === 1) digits[8] = (digits[8] + 1) % 10;
  const check = (arr, factor) => {
    let total = 0;
    for (const d of arr) total += d * factor--;
    const r = (total * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const d1 = check(digits, 10);
  const d2 = check([...digits, d1], 11);
  return [...digits, d1, d2].join('');
}

const CPF1 = makeCpf(`${RUN}317`);
const CPF2 = makeCpf(`${RUN}829`);
const PHONE1 = `83${String(RUN).replace(/\D/g,'').slice(-8).padStart(8,'7')}`.slice(0,10) + '9';
const PHONE2 = `84${String(RUN).replace(/\D/g,'').slice(-8).padStart(8,'6')}`.slice(0,10) + '9';

await fs.mkdir('artifacts/auth-smoke', { recursive: true });

function log(step) { console.log(`✓ ${step}`); }
async function shot(page, name) { await page.screenshot({ path: `artifacts/auth-smoke/${name}.png`, fullPage: true }); }
async function expectText(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 });
}
async function login(page, identifier, label) {
  await page.goto(`${BASE}/entrar`, { waitUntil: 'networkidle' });
  await page.getByLabel('CPF, e-mail ou telefone').fill(identifier);
  await page.getByLabel('Senha').fill(PASSWORD);
  await Promise.all([
    page.waitForURL(url => !url.pathname.startsWith('/entrar'), { timeout: 20000 }),
    page.getByRole('button', { name: 'Entrar' }).click(),
  ]);
  await page.goto(`${BASE}/conta`, { waitUntil: 'networkidle' });
  await expectText(page, PRIMARY_EMAIL);
  log(`login por ${label}`);
}
async function logout(page) {
  await page.goto(`${BASE}/conta`, { waitUntil: 'networkidle' });
  await Promise.all([
    page.waitForURL('**/entrar', { timeout: 15000 }),
    page.getByRole('link', { name: 'Sair da conta' }).click(),
  ]);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
page.on('console', msg => { if (msg.type() === 'error') console.log(`BROWSER_ERROR: ${msg.text()}`); });

try {
  // 1. Cadastro novo em navegador.
  await page.goto(`${BASE}/cadastro`, { waitUntil: 'networkidle' });
  await page.getByLabel('Nome completo').fill(NAME);
  await page.getByLabel('E-mail').fill(PRIMARY_EMAIL);
  await page.getByLabel('Senha').fill(PASSWORD);
  await Promise.all([
    page.waitForURL(url => url.pathname === '/conta' || url.pathname === '/cadastro', { timeout: 20000 }),
    page.getByRole('button', { name: 'Criar conta' }).click(),
  ]);
  if (page.url().includes('check_email=1')) throw new Error('Cadastro exige confirmação de e-mail; smoke não pode prosseguir automaticamente.');
  if (!page.url().includes('/conta')) throw new Error(`Cadastro não chegou à conta: ${page.url()}`);
  await expectText(page, NAME);
  await expectText(page, PRIMARY_EMAIL);
  await shot(page, '01-cadastro-conta-mobile');
  log('cadastro novo + /conta com nome/e-mail corretos');

  // 2. Preferências: defaults, persistência e opt-out.
  await page.goto(`${BASE}/preferencias`, { waitUntil: 'networkidle' });
  const marketing = page.getByRole('checkbox').nth(0);
  const reminders = page.getByRole('checkbox').nth(1);
  await marketing.waitFor({ state: 'visible', timeout: 15000 });
  if (await marketing.isChecked()) throw new Error('Marketing deveria iniciar desmarcado para conta QA.');
  if (await reminders.isChecked()) throw new Error('Lembretes deveriam iniciar desmarcados para conta QA.');
  await marketing.check();
  await reminders.check();
  await page.getByRole('button', { name: 'Salvar preferências' }).click();
  await expectText(page, 'Preferências atualizadas.');
  await page.reload({ waitUntil: 'networkidle' });
  await marketing.waitFor({ state: 'visible', timeout: 15000 });
  if (!(await marketing.isChecked()) || !(await reminders.isChecked())) throw new Error('Preferências não persistiram após reload.');
  await page.getByRole('button', { name: 'Cancelar comunicações opcionais' }).click();
  await page.waitForTimeout(800);
  if (await marketing.isChecked()) throw new Error('Marketing não foi cancelado.');
  if (await reminders.isChecked()) throw new Error('Lembretes não foram cancelados.');
  await shot(page, '02-preferencias');
  log('/preferencias carrega, salva, persiste e cancela corretamente');

  // 3. Vincular CPF/telefone pela ativação founder.
  await page.goto(`${BASE}/ativar-fundador`, { waitUntil: 'networkidle' });
  await page.getByLabel('Nome completo').fill(NAME);
  await page.getByLabel('CPF').fill(CPF1);
  await page.getByLabel('Telefone').fill(PHONE1);
  await Promise.all([
    page.waitForURL(url => url.pathname === '/plataforma' || url.pathname === '/ativar-fundador', { timeout: 20000 }),
    page.getByRole('button', { name: 'Ativar acesso fundador' }).click(),
  ]);
  if (!page.url().includes('founder=active')) throw new Error(`Ativação founder falhou: ${page.url()}`);
  await page.goto(`${BASE}/conta`, { waitUntil: 'networkidle' });
  await expectText(page, 'Acesso até');
  if (await page.getByText('Nenhum plano ativo.', { exact: false }).count()) throw new Error('Conta founder aparece sem plano ativo.');
  await shot(page, '03-conta-founder');
  log('CPF/telefone vinculados + founder ativo + /conta correto');

  // 4. Logout/login por e-mail, CPF, telefone e novamente e-mail.
  await logout(page);
  await login(page, PRIMARY_EMAIL, 'e-mail');
  await logout(page);
  await login(page, CPF1, 'CPF');
  await logout(page);
  await login(page, PHONE1, 'telefone');
  await logout(page);
  await login(page, PRIMARY_EMAIL, 'e-mail após logout');
  await shot(page, '04-login-final');
  log('logout + login novamente');

  // 5. Duplicidade de e-mail em novo contexto.
  await logout(page);
  const dupContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const dupPage = await dupContext.newPage();
  await dupPage.goto(`${BASE}/cadastro`, { waitUntil: 'networkidle' });
  await dupPage.getByLabel('Nome completo').fill('QA Email Duplicado');
  await dupPage.getByLabel('E-mail').fill(PRIMARY_EMAIL);
  await dupPage.getByLabel('Senha').fill(PASSWORD);
  await Promise.all([
    dupPage.waitForURL(url => url.pathname === '/cadastro' && url.searchParams.has('error'), { timeout: 20000 }),
    dupPage.getByRole('button', { name: 'Criar conta' }).click(),
  ]);
  await expectText(dupPage, 'Não foi possível criar a conta.');
  await shot(dupPage, '05-duplicidade-email');
  log('duplicidade de e-mail exibe erro visual sem enumerar conta');

  // 6. Segunda conta QA para mensagens explícitas de CPF/telefone duplicados.
  await dupPage.goto(`${BASE}/cadastro`, { waitUntil: 'networkidle' });
  await dupPage.getByLabel('Nome completo').fill(SECOND_NAME);
  await dupPage.getByLabel('E-mail').fill(SECONDARY_EMAIL);
  await dupPage.getByLabel('Senha').fill(PASSWORD);
  await Promise.all([
    dupPage.waitForURL(url => url.pathname === '/conta' || url.pathname === '/cadastro', { timeout: 20000 }),
    dupPage.getByRole('button', { name: 'Criar conta' }).click(),
  ]);
  if (!dupPage.url().includes('/conta')) throw new Error(`Cadastro secundário falhou: ${dupPage.url()}`);

  await dupPage.goto(`${BASE}/ativar-fundador`, { waitUntil: 'networkidle' });
  await dupPage.getByLabel('Nome completo').fill(SECOND_NAME);
  await dupPage.getByLabel('CPF').fill(CPF1);
  await dupPage.getByLabel('Telefone').fill(PHONE2);
  await Promise.all([
    dupPage.waitForURL(url => url.pathname === '/ativar-fundador' && url.searchParams.get('error') === 'cpf', { timeout: 20000 }),
    dupPage.getByRole('button', { name: 'Ativar acesso fundador' }).click(),
  ]);
  await expectText(dupPage, 'Este CPF já está associado a outra conta.');
  log('duplicidade de CPF exibe mensagem visual correta');

  await dupPage.getByLabel('Nome completo').fill(SECOND_NAME);
  await dupPage.getByLabel('CPF').fill(CPF2);
  await dupPage.getByLabel('Telefone').fill(PHONE1);
  await Promise.all([
    dupPage.waitForURL(url => url.pathname === '/ativar-fundador' && url.searchParams.get('error') === 'phone', { timeout: 20000 }),
    dupPage.getByRole('button', { name: 'Ativar acesso fundador' }).click(),
  ]);
  await expectText(dupPage, 'Este telefone já está associado a outra conta.');
  await shot(dupPage, '06-duplicidade-cpf-telefone');
  log('duplicidade de telefone exibe mensagem visual correta');
  await dupContext.close();

  console.log('AUTH_SMOKE_OK');
  console.log(`QA_TAG=${RUN}`);
  console.log('QA_EMAIL_PREFIX=kmps16+dominaqa-');
} catch (error) {
  await shot(page, '99-falha').catch(() => {});
  console.error('AUTH_SMOKE_FAILED:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
