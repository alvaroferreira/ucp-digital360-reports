# UCP Digital 360° - Sistema de Relatórios

Sistema de relatórios para o **Programa Avançado Digital 360°: da Estratégia à Implementação** da Universidade Católica Portuguesa.

## 📊 Funcionalidades

- ✅ Autenticação segura via Google OAuth
- ✅ Integração direta com Google Sheets (BD viva)
- ✅ Filtros dinâmicos por Módulo e Edição
- ✅ Tabelas com estatísticas (média, desvio padrão, distribuição)
- ✅ Gráficos interativos com Recharts
- ✅ Export para PDF via impressão do browser
- ✅ Design responsivo e profissional

## 🚀 Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **UI**: React + Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Autenticação**: NextAuth.js v5 (Auth.js)
- **Integração**: Google Sheets API v4
- **Deploy**: Vercel (recomendado)

## 📋 Pré-requisitos

1. Node.js 18+ instalado
2. Conta Google Cloud com projeto criado
3. Google Sheets API ativada
4. Credenciais OAuth 2.0 configuradas

## ⚙️ Configuração

### 1. Instalar Dependências

\`\`\`bash
cd ucp-digital360-reports
npm install
\`\`\`

### 2. Configurar Google Cloud Console

1. Aceda a [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Sheets API**:
   - Menu → APIs & Services → Library
   - Procure "Google Sheets API"
   - Clique em "Enable"

4. Configure o OAuth Consent Screen:
   - APIs & Services → OAuth consent screen
   - Escolha "External" (ou "Internal" se for workspace)
   - Preencha os campos obrigatórios
   - Em "Scopes", adicione:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `.../auth/spreadsheets.readonly`

5. Crie credenciais OAuth 2.0:
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:6699/api/auth/callback/google`
   - Copie o Client ID e Client Secret

### 3. Configurar Variáveis de Ambiente

Crie um ficheiro \`.env.local\` na raiz do projeto:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edite \`.env.local\` com os seus valores:

\`\`\`env
# Gerar secret: openssl rand -base64 32
AUTH_SECRET=sua-chave-secreta-aqui

NEXTAUTH_URL=http://localhost:6699

GOOGLE_CLIENT_ID=seu-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
\`\`\`

### 4. Partilhar Google Sheets

Certifique-se que o Google Sheets está partilhado com a conta Google que será usada para login, ou torne-o público (apenas leitura).

## 🏃 Executar Localmente

\`\`\`bash
npm run dev
\`\`\`

Abra [http://localhost:6699](http://localhost:6699) no browser.

## 📦 Build para Produção

\`\`\`bash
npm run build
npm start
\`\`\`

## 🚀 Deploy no Vercel

1. Crie conta no [Vercel](https://vercel.com)
2. Importe o projeto do GitHub
3. Configure as variáveis de ambiente no Vercel:
   - \`AUTH_SECRET\`
   - \`NEXTAUTH_URL\` (URL do Vercel)
   - \`GOOGLE_CLIENT_ID\`
   - \`GOOGLE_CLIENT_SECRET\`
4. Adicione a URL do Vercel aos Authorized redirect URIs no Google Cloud Console
5. Deploy!

## 📁 Estrutura do Projeto

\`\`\`
ucp-digital360-reports/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/      # NextAuth handlers
│   │   └── sheets/                  # API routes para Google Sheets
│   ├── auth/signin/                 # Página de login
│   ├── dashboard/                   # Dashboard principal
│   └── page.tsx                     # Página inicial
├── components/
│   ├── ui/                          # Componentes shadcn/ui
│   ├── ReportTable.tsx              # Tabela de estatísticas
│   ├── ReportCharts.tsx             # Gráficos
│   ├── ReportViewer.tsx             # Visualizador completo
│   └── PDFExporter.tsx              # Export para PDF
├── lib/
│   ├── google-sheets.ts             # Cliente Google Sheets API
│   ├── data-processor.ts            # Processamento de dados
│   ├── statistics.ts                # Cálculos estatísticos
│   └── utils.ts                     # Utilitários
├── types/
│   ├── index.ts                     # Tipos TypeScript
│   └── next-auth.d.ts               # Tipos NextAuth
└── auth.ts                          # Configuração NextAuth
\`\`\`

## 🔧 Estrutura de Dados do Google Sheets

O sistema espera que cada folha (sheet) siga este padrão:

### Nome da Folha
- Formato: \`FAP M1\`, \`FAP M2 Ed1\`, \`FAP P1 Ed2\`, etc.
- Módulos: M1, M2, M3, M4, M5, M6, M7, M8, M9, P1, P2
- Edições: Ed1, Ed2, etc.

### Estrutura das Colunas (Headers na linha 1)

| Coluna | Campo | Descrição |
|--------|-------|-----------|
| A | Timestamp | Data/hora da resposta |
| B | Módulo | Código do módulo (M1, M2, etc.) |
| C | Edição | Código da edição (Ed1, Ed2, etc.) |
| D-H | Avaliação da Disciplina | 5 perguntas (escala 1-7) |
| I-O | Avaliação Docente | 7 perguntas (escala 1-7) |

### Perguntas (Escala 1-7)

**Avaliação da Disciplina:**
1. Clareza dos objetivos e do programa
2. Articulação entre temáticas
3. Utilização de plataformas digitais
4. Contributo para aquisição de conhecimentos
5. Apreciação global

**Avaliação Docente:**
1. Estruturação e dinâmica das aulas
2. Exposição e abordagem dos conteúdos
3. Domínio dos conteúdos
4. Cumprimento do horário
5. Disponibilidade para apoio
6. Estímulo à participação
7. Apreciação global

## 📊 Como Usar

1. Faça login com a sua conta Google
2. Selecione a **Edição** desejada (ou "Todas")
3. Selecione o **Módulo** desejado (ou "Todos")
4. Visualize as tabelas e gráficos gerados automaticamente
5. Clique em **"Exportar para PDF"** para guardar/imprimir

## 🔐 Segurança

- Autenticação OAuth 2.0 segura
- Acesso apenas de leitura ao Google Sheets
- Sessões protegidas com NextAuth.js
- Variáveis de ambiente para credenciais sensíveis

## 🐛 Troubleshooting

### Erro: "Não autenticado"
- Verifique se o Google OAuth está configurado corretamente
- Confirme que as redirect URIs estão corretas

### Erro: "Falha ao carregar dados"
- Verifique se o Google Sheets está partilhado
- Confirme que a Google Sheets API está ativada
- Verifique se o ID do spreadsheet está correto

### Gráficos não aparecem
- Certifique-se que há dados válidos (respostas 1-7)
- Verifique a consola do browser para erros

## 📝 Notas

- O ID do Google Sheets está hardcoded em \`lib/google-sheets.ts\`
- Para usar outro spreadsheet, altere a constante \`SPREADSHEET_ID\`
- Os dados são lidos em tempo real do Google Sheets
- Não há cache - cada visualização faz uma nova leitura

## 👤 Autor

Desenvolvido para a Universidade Católica Portuguesa - Porto
Programa Avançado Digital 360°

## 📄 Licença

Uso interno UCP
