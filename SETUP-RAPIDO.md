# 🚀 Setup Rápido - UCP Digital 360° Relatórios

## 1️⃣ Configurar Google Cloud (15 minutos)

### a) Criar Projeto
1. Vá a https://console.cloud.google.com/
2. Clique em "Select a project" → "New Project"
3. Nome: "UCP Digital 360 Reports"
4. Clique "Create"

### b) Ativar Google Sheets API
1. No menu lateral: **APIs & Services** → **Library**
2. Procure: "Google Sheets API"
3. Clique **Enable**

### c) Configurar OAuth Consent Screen
1. **APIs & Services** → **OAuth consent screen**
2. User Type: **External** → Create
3. Preencha:
   - App name: `UCP Digital 360 Reports`
   - User support email: (seu email)
   - Developer contact: (seu email)
4. Clique **Save and Continue**
5. **Scopes** → **Add or Remove Scopes**:
   - Procure e selecione:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `../auth/spreadsheets.readonly`
   - Save and Continue
6. **Test users** → **Add Users**
   - Adicione o seu email
   - Save and Continue
7. **Summary** → Back to Dashboard

### d) Criar Credenciais OAuth
1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `UCP Reports Web Client`
5. **Authorized redirect URIs** → Add URI:
   ```
   http://localhost:6699/api/auth/callback/google
   ```
6. **Create**
7. **COPIAR** e guardar:
   - Client ID
   - Client Secret

## 2️⃣ Configurar Projeto (5 minutos)

### a) Criar ficheiro .env.local

```bash
cd ucp-digital360-reports
cp .env.example .env.local
```

### b) Gerar AUTH_SECRET

```bash
openssl rand -base64 32
```

Copie o resultado.

### c) Editar .env.local

Abra `.env.local` e preencha:

```env
AUTH_SECRET=cole-aqui-o-resultado-do-comando-anterior
NEXTAUTH_URL=http://localhost:6699
GOOGLE_CLIENT_ID=cole-aqui-o-client-id
GOOGLE_CLIENT_SECRET=cole-aqui-o-client-secret
```

## 3️⃣ Executar Aplicação (2 minutos)

```bash
npm run dev
```

Abra: http://localhost:6699

## 4️⃣ Testar

1. Clique **"Entrar com Google"**
2. Escolha a conta que tem acesso ao Google Sheets
3. Autorize as permissões
4. Deve ser redirecionado para o Dashboard!

## ⚠️ Problemas Comuns

### "Erro 403: access_denied"
→ Adicione seu email em **OAuth consent screen** → **Test users**

### "Erro de redirect_uri_mismatch"
→ Verifique se adicionou `http://localhost:6699/api/auth/callback/google` nas Authorized redirect URIs

### "Não autenticado"
→ Verifique se o `.env.local` está correto e reinicie o servidor (`npm run dev`)

### "Falha ao carregar dados"
→ Partilhe o Google Sheets com a conta que usou para login

## 📝 Próximos Passos

- [ ] Testar com dados reais do Google Sheets
- [ ] Ajustar layout se necessário
- [ ] Configurar para produção (Vercel)
- [ ] Adicionar mais módulos/edições conforme necessário

## 🆘 Ajuda

Se algo não funcionar:
1. Verifique a consola do browser (F12)
2. Verifique o terminal onde está `npm run dev`
3. Confirme que o Google Sheets está partilhado corretamente
