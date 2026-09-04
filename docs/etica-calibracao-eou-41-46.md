# Calibração histórica de Ética — EOU 41 a 46

Data da classificação: 04/09/2026.

## Escopo

Foram classificados os oito itens de Ética/Estatuto da Advocacia dos cadernos oficiais Tipo 1 dos 41º, 42º, 43º, 44º, 45º e 46º Exames de Ordem Unificados.

- 6 exames consecutivos
- 48 questões observadas
- 47 questões elegíveis para calibração
- 1 questão anulada: 43º EOU, questão 1 do Tipo 1

A questão anulada permanece na tabela de observações para preservar a trilha histórica, mas não entra em `historical_occurrences` nem no peso.

Comunicado oficial de anulação do 43º EOU: https://oab.fgv.br/arq/646/9785_2025.1%20%2843%20eou%29%20anulacao.%20po.%2043%20eou.%20questao%2001..pdf

## Fontes oficiais

- 41º EOU — 28/07/2024 — https://oab.fgv.br/arq/644/552356_ADVOGADO%20OAB%28CNS01%29%20Tipo%201%20%281%29.pdf
- 42º EOU — 01/12/2024 — https://oab.fgv.br/arq/645/402439_OAB%2042%20-%20ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf
- 43º EOU — 27/04/2025 — https://oab.fgv.br/arq/646/838452_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf
- 44º EOU — 17/08/2025 — https://s.oab.org.br/arquivos/2025/08/fda2cc49-fbbd-4893-9b75-0f61c177cd5d.pdf
- 45º EOU — 21/12/2025 — https://oab.fgv.br/arq/648/405589_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf
- 46º EOU — 03/05/2026 — https://oab.fgv.br/arq/649/561671_ADVOGADO%20OAB%28CNS01%29%20Tipo%201.pdf

## Ocorrências válidas observadas

| Tema | Ocorrências | Média por exame | Peso gravado |
| --- | ---: | ---: | ---: |
| Direitos e prerrogativas | 8 | 1,333 | 1,333 |
| Infrações e sanções disciplinares | 8 | 1,333 | 1,333 |
| Incompatibilidades e impedimentos | 6 | 1,000 | 1,000 |
| Atos privativos da advocacia | 4 | 0,667 | 0,667 |
| Sociedade de advogados | 4 | 0,667 | 0,667 |
| Honorários advocatícios | 3 | 0,500 | 0,500 |
| Publicidade e marketing jurídico | 3 | 0,500 | 0,500 |
| Sigilo profissional | 3 | 0,500 | 0,500 |
| Advogado empregado | 2 | 0,333 | 0,333 |
| Inscrição na OAB | 2 | 0,333 | 0,333 |
| Responsabilidade profissional do advogado | 2 | 0,333 | 0,333 |
| Órgãos da OAB | 1 | 0,167 | 0,167 |
| Princípios fundamentais | 1 | 0,167 | 0,167 |
| Mandato e renúncia | 0 | 0,000 | 0,100 (piso técnico) |

A soma das ocorrências válidas é 47. O 43º EOU teve apenas sete itens elegíveis porque a questão 1 foi anulada.

## Temas revelados pela prova real

O recorte mostrou duas lacunas no mapa editorial anterior:

1. `Advogado empregado` — 2 ocorrências, nos 41º e 45º EOU.
2. `Responsabilidade profissional do advogado` — 2 ocorrências, nos 41º e 42º EOU.

Os dois temas foram cadastrados como inativos por enquanto, pois ainda não possuem questões autorais publicadas. Eles não devem ser ativados no catálogo até que haja conteúdo revisado suficiente.

## Regra do peso

Para os EOU 41–46:

`incidence_weight = max(historical_occurrences / 6, 0.100)`

O piso de 0,100 evita transformar um tema não observado em tema impossível de aparecer. `historical_occurrences` continua guardando o valor observado sem suavização.

## Correção do algoritmo de sorteio

O runtime anterior aplicava `incidence_weight` diretamente em cada questão. Assim, um tema com nove questões autorais ganhava nove oportunidades ponderadas e um tema com três ganhava apenas três, mesmo que ambos tivessem a mesma incidência histórica.

O novo runtime usa, por questão:

`effective_weight = topic_weight / published_questions_in_topic`

Dessa forma, a massa total de probabilidade do tema é determinada pela incidência histórica, não pelo tamanho do banco autoral.

## QA estatístico do runtime

Foram executados 1.000 sorteios do `simulado-etica`, com 3 questões por execução, totalizando 3.000 seleções.

| Tema | Seleções | Frequência observada | Alvo aproximado entre temas disponíveis |
| --- | ---: | ---: | ---: |
| Direitos e prerrogativas | 572 | 19,07% | 18,34% |
| Infrações e sanções disciplinares | 567 | 18,90% | 18,34% |
| Incompatibilidades e impedimentos | 399 | 13,30% | 13,76% |
| Atos privativos da advocacia | 268 | 8,93% | 9,18% |
| Sociedade de advogados | 260 | 8,67% | 9,18% |
| Honorários advocatícios | 203 | 6,77% | 6,88% |
| Sigilo profissional | 197 | 6,57% | 6,88% |
| Publicidade e marketing jurídico | 192 | 6,40% | 6,88% |
| Inscrição na OAB | 155 | 5,17% | 4,58% |
| Órgãos da OAB | 79 | 2,63% | 2,30% |
| Princípios fundamentais | 65 | 2,17% | 2,30% |
| Mandato e renúncia | 43 | 1,43% | 1,38% |

As diferenças são compatíveis com variabilidade aleatória do sorteio e com amostragem sem reposição dentro de cada simulado.

## Próximos passos

- ampliar o recorte para exames anteriores ao 41º;
- criar conteúdo autoral revisado para `Advogado empregado` e `Responsabilidade profissional do advogado`;
- ativar esses temas apenas após existir cobertura pública suficiente;
- recalibrar automaticamente `historical_occurrences` e os pesos quando novas provas forem classificadas;
- validar o simulado completo de 80 questões quando todas as disciplinas tiverem base histórica equivalente.
