# 准时宝语录

## Quick Reference
- Mobile-first PWA for Viv & Bili
- Stop-motion animations at 12fps
- Stickers = buttons, always

## MANDATORY
After any significant work:
1. Update .claude/rules/memory-decisions.md with new choices
2. Update .claude/rules/memory-sessions.md with progress
Do this DURING work, not at the end.

## File Locations
- Project rules: .claude/rules/*.md
- Design specs: docs/03_Design_Document.md
- User flows: docs/02_User_Flow.md
- Backend: docs/04_Backend_Document.md
- Images: public/images/

## Data Model
Entries: id, lyric, song_title, artist, season, author, created_at
Seasons: spring, summer, autumn, winter
Authors: Viv, Bili (from sessionStorage)

## Key Files
- src/animations/frameAnimation.ts — all major animations
- src/lib/db.ts — Supabase operations
- src/components/ — UI components

## Current Image Assets
See .claude/rules/memory-sessions.md for status

## Bug Fixing Guidelines
When fixing UI bugs, prefer direct solutions (show/hide, conditional rendering) over indirect workarounds (z-index tricks, gap zones, pointer-events). If a fix doesn't work on the first attempt, switch to a fundamentally different approach rather than iterating on the same strategy.

## Deployment Checklist
For Next.js production builds: always set `typescript: { ignoreBuildErrors: true }` in next.config.js when preparing for deployment, and verify the build passes locally with `npm run build` before pushing.

## API Development
When creating new API routes or features, always verify: 1) All referenced DB columns exist in the schema, 2) UUID generation is imported and used for new records, 3) Cookie/auth paths match the app's routing structure.

## Git
- Never include "Co-authored-by" in commit messages
- Use --reset-author flag when committing
