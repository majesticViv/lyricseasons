# 准时宝语录 — Security Checklist

## Pre-Deployment Checklist

### Supabase
- [ ] RLS enabled on `entries` table
- [ ] All 4 policies created (SELECT, INSERT, UPDATE, DELETE)
- [ ] Service role key NOT in any front-end code
- [ ] Anon key in environment variables only

### Environment
- [ ] `.env.local` exists with correct values
- [ ] `.env.local` in `.gitignore`
- [ ] No secrets in committed code

### Input Validation
- [ ] Lyric max 2000 characters (DB + client)
- [ ] Song title max 200 characters
- [ ] Artist max 200 characters
- [ ] Season only accepts: spring, summer, autumn, winter
- [ ] Author only accepts: Viv, Bili
- [ ] All user input escaped before rendering (textContent, not innerHTML)

### Network
- [ ] HTTPS only (Vercel default)
- [ ] Spotify link opens with `rel="noopener noreferrer"`

### Privacy
- [ ] `robots.txt` with `Disallow: /`
- [ ] URL not publicly shared
- [ ] No credentials in localStorage (sessionStorage only)

---

## Post-Deploy Verification

- [ ] Can add entry as Viv
- [ ] Entry appears in other browser as Bili (realtime works)
- [ ] Can edit entry
- [ ] Gramophone opens Spotify correctly
- [ ] Works on mobile Safari
- [ ] Works on mobile Chrome

---

## Ongoing

- [ ] Run `npm audit` before deploys
- [ ] Keep dependencies updated
