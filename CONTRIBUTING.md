# Contributing

1. Fork the repository and create a focused branch.
2. Run `npm ci` and `npm run verify` with Node.js 22.19+ or 24+.
3. Keep credentials, workspace saves, dialogue exports, CGs, and personal
   visual assets out of commits.
4. Preserve per-character isolation for affection, memory, history, CGs, and
   custom sprites.
5. Update all four README files when an installation or user-facing workflow
   changes.

Generated bundles in `lib/`, `src/client/art.generated.ts`, and
`src/client/workshop.generated.ts` stay out of Git. Keep the source images and
manifests in sync; the `prepare` script embeds them and builds Git installations.
Published npm packages include the prebuilt bundles without duplicate raw images.
