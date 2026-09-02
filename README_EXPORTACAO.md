# Domina OAB — exportação do código-fonte

Este pacote contém o código-fonte da versão 8 publicada em
`https://domina-oab.kmps16.chatgpt.site`, correspondente ao commit
`1fc37652d17174bcc01cbbd6d64566510f801907` do repositório interno do Site.

## Conteúdo incluído

- Aplicação em Next.js 16 / React 19 executada com Vinext e Cloudflare Workers.
- Páginas públicas, plataforma demonstrativa, simulado e painel administrativo.
- Componentes, estilos, imagens públicas, testes e scripts de build.
- Schema Drizzle e migrações do banco D1.
- Manifesto de hospedagem em `.openai/hosting.json`.
- Arquivos de dependências e configuração necessários para desenvolvimento.

O pacote não contém dados do banco de produção, credenciais, tokens, cookies,
chaves do Mercado Pago nem arquivos `.env`.

## Requisitos

- Node.js 22.13 ou superior.
- Ambiente Linux para os scripts auxiliares incluídos no projeto.

## Instalação e validação

```bash
npm ci
npm run lint
npm test
```

Para desenvolvimento local:

```bash
npm run dev
```

O banco da aplicação usa o binding D1 chamado `DB`. As tabelas podem ser
recriadas pelas migrações existentes em `drizzle/`. Valores de ambiente e
credenciais de serviços externos devem ser configurados apenas no ambiente de
hospedagem; nunca devem ser adicionados ao repositório.

## Observação sobre portabilidade

O código está completo para o ambiente em que foi criado. A autenticação por
ChatGPT e o banco D1 dependem da infraestrutura de hospedagem indicada no
projeto. Para migrar para outro provedor, será necessário substituir esses
adaptadores, sem necessidade de reconstruir as telas e regras já existentes.
