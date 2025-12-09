# Guia de Deploy no Vercel

## 🚀 Passo a Passo

### 1. Configure as Variáveis de Ambiente no Vercel

No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```
VITE_SUPABASE_URL = sua_url_do_supabase
VITE_SUPABASE_ANON_KEY = sua_chave_anonima_do_supabase
VITE_ASAAS_API_KEY = sua_chave_api_do_asaas
VITE_ASAAS_API_URL = https://api.asaas.com/v3
VITE_SUBSCRIPTION_VALUE = 34.90
```

### 2. Onde Encontrar as Chaves

#### Supabase:
1. Acesse [supabase.com](https://supabase.com)
2. Abra seu projeto
3. Vá em **Settings > API**
4. Copie:
   - `URL` → VITE_SUPABASE_URL
   - `anon public` → VITE_SUPABASE_ANON_KEY

#### Asaas:
1. Acesse [asaas.com](https://www.asaas.com)
2. Vá em **Configurações > Integrações > API**
3. Copie sua chave de produção → VITE_ASAAS_API_KEY

### 3. Deploy

```bash
npm run build
```

O Vercel fará o deploy automaticamente ao fazer push no repositório.

## ⚠️ IMPORTANTE

- **NUNCA** commite o arquivo `.env` no Git
- As variáveis devem estar configuradas no Vercel ANTES do build
- Use `.env.example` como referência

## 🔒 Segurança

✅ **Corrigido**: API keys agora usam variáveis de ambiente
✅ **Corrigido**: `.env` no `.gitignore`
✅ **Corrigido**: Validação de variáveis obrigatórias

## 🐛 Troubleshooting

**Erro: "Supabase configuration missing"**
- Verifique se configurou as variáveis no Vercel
- Faça redeploy após adicionar variáveis

**Erro no build**
- Certifique-se que todas as variáveis estão preenchidas
- Verifique os logs de build no Vercel
