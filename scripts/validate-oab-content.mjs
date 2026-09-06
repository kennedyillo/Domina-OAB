import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("content/oab");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateQuestionFile(file, items, seenCodes) {
  assert(Array.isArray(items), `${file}: raiz deve ser array`);
  assert(items.length > 0, `${file}: lote vazio`);

  const answerCounts = [0, 0, 0, 0];
  for (const [index, item] of items.entries()) {
    const where = `${file}#${index + 1}`;
    assert(item && typeof item === "object" && !Array.isArray(item), `${where}: item inválido`);
    for (const field of ["code", "discipline_slug", "topic", "statement", "explanation", "source_label", "difficulty", "subtopic", "incidence"]) {
      assert(nonEmpty(item[field]), `${where}: campo obrigatório ausente: ${field}`);
    }
    assert(!seenCodes.has(item.code), `${where}: código duplicado globalmente: ${item.code}`);
    seenCodes.add(item.code);
    assert(Array.isArray(item.options) && item.options.length === 4, `${where}: deve haver exatamente quatro alternativas`);
    assert(item.options.every(nonEmpty), `${where}: alternativa vazia`);
    assert(new Set(item.options.map((x) => x.trim().toLowerCase())).size === 4, `${where}: alternativas duplicadas`);
    assert(Number.isInteger(item.correct_index) && item.correct_index >= 0 && item.correct_index <= 3, `${where}: correct_index inválido`);
    answerCounts[item.correct_index] += 1;
    assert(["easy", "medium", "hard"].includes(item.difficulty), `${where}: difficulty inválida`);
    assert(["low", "medium", "high"].includes(item.incidence), `${where}: incidence inválida`);
    assert(item.statement.trim().length >= 40, `${where}: enunciado curto demais`);
    assert(item.explanation.trim().length >= 60, `${where}: explicação curta demais`);
    assert(!/quest[aã]o oficial/i.test(item.source_label), `${where}: source_label não deve sugerir reprodução de questão oficial`);
  }

  if (items.length >= 16) {
    const max = Math.max(...answerCounts);
    const min = Math.min(...answerCounts);
    assert(max - min <= Math.ceil(items.length * 0.2), `${file}: distribuição de gabarito excessivamente desequilibrada ${answerCounts.join("/")}`);
  }

  console.log(`✓ ${path.basename(file)}: ${items.length} questões; gabaritos A/B/C/D = ${answerCounts.join("/")}`);
}

function validateIncidenceFile(file, data) {
  assert(data && typeof data === "object" && !Array.isArray(data), `${file}: raiz inválida`);
  assert(Array.isArray(data.observations), `${file}: observations deve ser array`);
  assert(Number.isInteger(data.total_observations), `${file}: total_observations inválido`);
  assert(data.observations.length === data.total_observations, `${file}: total_observations não confere`);
  const summaryTotal = Object.values(data.summary ?? {}).reduce((sum, value) => sum + Number(value || 0), 0);
  assert(summaryTotal === data.total_observations, `${file}: soma do summary não confere`);
  const keys = new Set(Object.keys(data.summary ?? {}));
  for (const [index, observation] of data.observations.entries()) {
    assert(nonEmpty(observation.exam), `${file}#${index + 1}: exam ausente`);
    assert(Number.isInteger(observation.question), `${file}#${index + 1}: question inválida`);
    assert(keys.has(observation.topic), `${file}#${index + 1}: topic fora do summary: ${observation.topic}`);
    assert(nonEmpty(observation.subtopic), `${file}#${index + 1}: subtopic ausente`);
  }
  console.log(`✓ ${path.basename(file)}: ${data.total_observations} observações históricas`);
}

const files = await walk(ROOT);
const questionFiles = files.filter((file) => /-questoes-.*\.json$/i.test(file));
const incidenceFiles = files.filter((file) => /-incidencia-.*\.json$/i.test(file));
const seenCodes = new Set();

assert(questionFiles.length > 0, "Nenhum arquivo de questões estruturadas encontrado em content/oab");

for (const file of questionFiles) {
  const data = JSON.parse(await fs.readFile(file, "utf8"));
  validateQuestionFile(path.relative(process.cwd(), file), data, seenCodes);
}

for (const file of incidenceFiles) {
  const data = JSON.parse(await fs.readFile(file, "utf8"));
  validateIncidenceFile(path.relative(process.cwd(), file), data);
}

console.log(`QA acadêmico concluído: ${questionFiles.length} lote(s), ${seenCodes.size} questão(ões), ${incidenceFiles.length} mapa(s) de incidência.`);
