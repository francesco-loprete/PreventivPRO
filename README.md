# PreventivPRO

Gestione preventivi con Next.js, Supabase e export PDF.

## Sviluppo locale

```bash
npm install
cp .env.example .env.local
# Inserisci URL e chiave anon da Supabase → Project Settings → API
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Variabili d'ambiente

| Variabile | Obbligatoria | Descrizione |
|-----------|--------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sì | URL del progetto Supabase (senza slash finale) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sì | Chiave anon / publishable (Settings → API) |

Vercel espone automaticamente `VERCEL_URL` in produzione; non va configurata a mano.

## Deploy su Vercel

1. Collega il repository GitHub/GitLab/Bitbucket a [Vercel](https://vercel.com).
2. **Framework Preset**: Next.js (rilevato automaticamente).
3. **Environment Variables** (per Production, Preview e Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Avvia il deploy. Il comando di build è `npm run build`.

### Supabase in produzione

- Tabella: `Preventivi` (colonne: `cliente`, `descrizione`, `prezzo`, opzionale `user_id`).
- **Auth**: abilita Email in Authentication → Providers.
- Redirect URL in Supabase → Authentication → URL Configuration:
  - `http://localhost:3000/auth/callback` (dev)
  - `https://tuo-dominio.vercel.app/auth/callback` (produzione)
- Esegui `supabase/auth-rls-preventivi.sql` per RLS per utente autenticato.

### Autenticazione

- `/login` — accesso
- `/registrazione` — nuovo account
- `/preventivi` e `/nuovo-preventivo` — protette da middleware (redirect a login)
- Sessione in cookie via `@supabase/ssr`
- In Supabase → Authentication → URL Configuration, aggiungi il dominio Vercel se usi auth in futuro.

### Verifica pre-deploy

```bash
npm run lint
npm run build
npm run start
```

## PWA

PreventivPRO è una Progressive Web App (`@ducanh2912/next-pwa`):

- `public/manifest.json` — manifest installabile
- `public/icons/` — icone 72–512px + maskable + Apple Touch
- Service worker in produzione (`public/sw.js` dopo `npm run build`)
- Banner **Installa app** su mobile (Chrome/Edge/Android)

In sviluppo la PWA è disabilitata; per testarla:

```bash
npm run build && npm run start
```

Rigenera le icone da SVG: `npm run generate:icons`

## Script

| Comando | Uso |
|---------|-----|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Build di produzione (+ service worker PWA) |
| `npm run start` | Server dopo `build` |
| `npm run lint` | ESLint |
| `npm run generate:icons` | Rigenera PNG da `public/icon-base.svg` |
