# Deployment Guide - UCP Digital 360° Reports

## Pré-requisitos
- ✅ Conta Vercel (já tens)
- ✅ Base de dados Neon PostgreSQL (já tens)
- ✅ Google OAuth credentials configuradas
- ✅ Código no GitHub (já está)

## Passo a Passo - Deployment na Vercel

### 1. Aceder à Vercel
1. Vai a https://vercel.com
2. Faz login com a tua conta
3. Clica em **"Add New"** → **"Project"**

### 2. Importar o Repositório
1. Seleciona o repositório: `ucp-digital360-reports`
2. Clica em **"Import"**

### 3. Configurar Variáveis de Ambiente
Na secção **"Environment Variables"**, adiciona as seguintes variáveis:

#### 🔐 Base de Dados (Neon)
```
DATABASE_URL
```
Valor: Copia da tua `.env.local` (começa com `postgresql://...`)

#### 🔑 NextAuth
```
AUTH_SECRET
```
Valor: Copia da tua `.env.local`

```
NEXTAUTH_URL
```
Valor: `https://SEU-DOMINIO.vercel.app` (a Vercel dará um domínio temporário, depois atualizas)

#### 🔵 Google OAuth
```
GOOGLE_CLIENT_ID
```
Valor: Copia da tua `.env.local`

```
GOOGLE_CLIENT_SECRET
```
Valor: Copia da tua `.env.local`

**💡 Dica**: Podes copiar todos os valores do ficheiro `.env.local` que já tens localmente.

### 4. Deploy
1. Clica em **"Deploy"**
2. Aguarda 2-3 minutos
3. A Vercel vai:
   - Instalar dependências
   - Gerar o Prisma Client
   - Fazer build do Next.js
   - Deploy automático

### 5. Atualizar Google OAuth
Depois do primeiro deploy, vais ter um URL tipo: `https://ucp-digital360-reports.vercel.app`

1. Vai a https://console.cloud.google.com/apis/credentials
2. Edita as credenciais OAuth:
   - **Authorized JavaScript origins**: adiciona `https://ucp-digital360-reports.vercel.app`
   - **Authorized redirect URIs**: adiciona `https://ucp-digital360-reports.vercel.app/api/auth/callback/google`

3. Volta à Vercel → Settings → Environment Variables
4. Atualiza `NEXTAUTH_URL` para o URL real

### 6. Re-deploy
1. Na Vercel, vai a **"Deployments"**
2. Clica nos 3 pontos do último deployment
3. Clica em **"Redeploy"**

## ✅ Verificação

Depois do deployment, testa:
- [ ] Login com Google funciona
- [ ] Sincronização com Google Sheets funciona
- [ ] Relatórios aparecem corretamente
- [ ] Export PDF funciona
- [ ] Painel admin acessível

## 🌐 Domínio Custom (Opcional)

Se quiseres usar um domínio do Hostinger:

### Na Vercel:
1. Project Settings → Domains
2. Adiciona: `relatorios.teudominio.com`
3. A Vercel vai dar-te um valor CNAME

### No Hostinger:
1. Acede ao painel DNS do teu domínio
2. Adiciona um registo CNAME:
   - **Nome**: `relatorios`
   - **Valor**: `cname.vercel-dns.com`
   - **TTL**: 3600

Aguarda 5-30 minutos para propagação DNS.

## 🔄 Deployments Automáticos

A partir de agora, cada push para `main` faz deploy automático!

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

A Vercel deteta e faz deploy automático em 2-3 minutos.

## 🐛 Troubleshooting

### Erro de Build
- Verifica logs na Vercel
- Certifica-te que todas as variáveis de ambiente estão corretas

### Login não funciona
- Confirma que `NEXTAUTH_URL` está correto
- Verifica Google OAuth redirect URIs

### Prisma/Database
- Confirma `DATABASE_URL` está correto
- A Neon deve estar acessível publicamente

## 📊 Monitorização

- **Logs**: Vercel → Project → Logs
- **Analytics**: Vercel tem analytics gratuitas
- **Alerts**: Configura em Project → Settings → Alerts

---

**Tempo estimado**: 10-15 minutos
**Custo**: €0 (free tier Vercel + Neon)
