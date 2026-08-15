# Contributing

1. Fork the repository and create a focused branch.
2. Run `npm ci` and `npm run verify` with Node.js 22.19+ or 24+.
3. Keep credentials, workspace saves, dialogue exports, CGs, and personal
   visual assets out of commits.
4. Preserve per-character isolation for affection, memory, history, CGs, and
   custom sprites.
5. Update all four README files when an installation or user-facing workflow
   changes.

Generated bundles in `lib/` are committed so GitHub installation works without
a build step. Please rebuild them after changing `src/`.
