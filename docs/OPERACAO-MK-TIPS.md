# MK Tips — operação do dia a dia

Plataforma: https://saa-s-sports-tips-three.vercel.app  
Admin: `/mktipsadmin`  
Cliente: `/dashboard/tips`

## O que já está pronto

- Cadastro Free / checkout / Supabase
- Tips Control (publicar, Green/Red, importar jogos futuros)
- Cliente vê tips **Pendentes** e histórico Green/Red
- Dashboard admin (faturamento, usuários, CRM)
- **WhatsApp / comunidades desligado** de propósito até vocês anunciarem

## Rotina recomendada (sem WhatsApp ainda)

1. **Tips Control** → *Importar jogos futuros* ou *Publicar Oportunidade* (odd/casa parceira manual).
2. Ajuste mercado, odd e casa antes do jogo.
3. Após o jogo → marque **Green** ou **Red**.
4. Leads/clientes veem oportunidades em **Tips do Dia** e histórico em **Histórico**.

## Scripts no PC (opcional)

```powershell
# Só preenche tips no painel (NÃO manda WhatsApp)
node --env-file=.env.local scripts/auto-pipeline.mjs
```

`config/auto-pipeline.json` → `"sendToWhatsApp": false` (padrão atual).

## Contatos das comunidades (sem enviar mensagem)

1. Rode `supabase-community-contacts.sql` no Supabase (uma vez).
2. No PC:
   ```powershell
   node --env-file=.env.local scripts/sync-community-contacts.mjs
   ```
3. Admin → **CRM WhatsApp → Contatos** → lista de clientes por comunidade.

O sync compara com o snapshot anterior e grava quem **saiu** em `community-leavers.json` (Storage + `config/`).

## Recuperação de quem saiu (DM individual, sem link)

Mensagem editável em `config/recovery-message.json` (proibido link).

**Estabilizar sessão (importante):**
```powershell
# 1) Conectar QR (uma vez, quando cair)
node scripts/wacli-auth-qr.mjs

# 2) Manter sessão ligada em segundo plano
node scripts/wacli-keepalive.mjs
```

**Automático (só detecção — sem DM enquanto `enabled: false`):**
```powershell
# Uma rodada: sync + grava quem saiu
node --env-file=.env.local scripts/auto-recover-leavers.mjs --detect-only

# Loop a cada 15 min (PC ligado, sem enviar mensagem)
powershell -ExecutionPolicy Bypass -File scripts/start-leaver-detection.ps1
```

Lista no Admin → **CRM WhatsApp → Contatos** (tags Ex-membro / Recovery pendente).

Para reativar DM no futuro: `config/recovery-message.json` → `"enabled": true` (só com conta estável).


1. wacli autenticado: `wacli --account me auth status`
2. Grupos já mapeados em `config/auto-pipeline.json` → `targets`
3. Ligar envio automático local:
   ```json
   "sendToWhatsApp": true
   ```
4. (Opcional) API do painel CRM: no `.env.local` do projeto e na Vercel:
   ```
   WHATSAPP_SEND_ENABLED=true
   WACLI_BASE_URL=http://localhost:3333
   ```
   O envio real continua no **PC** via wacli; a Vercel só orquestra se houver bridge local.

5. Agendar no Windows (1–2×/dia):
   ```powershell
   node --env-file=.env.local scripts/auto-pipeline.mjs
   ```

6. Limpar mensagens de teste antigas (se precisar):
   ```powershell
   # Feche outros wacli antes
   node --env-file=.env.local scripts/revoke-auto-broadcasts.mjs
   ```

## Variáveis de ambiente (referência)

Ver `.env.example`.

## Checklist antes de divulgar

- [ ] Pelo menos algumas tips **Pendentes** visíveis no app
- [ ] Histórico com volume Green/Red (seed ou tips reais fechadas)
- [ ] Pagamento testado (Starter) refletindo no admin
- [ ] PWA / login cliente ok
- [ ] Só então: `sendToWhatsApp: true` + primeiro disparo manual de teste em **1 grupo**
