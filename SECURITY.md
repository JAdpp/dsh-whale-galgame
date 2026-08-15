# Security policy

## Secrets

Never commit a DashScope key, provider token, private endpoint, workspace save,
or exported conversation. The checked-in `cordis.patch.yml` deliberately uses
an empty key. For optional CG generation, provide `DASHSCOPE_API_KEY` only in
the local process environment or in an untracked local configuration file.

If a key has ever been committed or copied into a shared log, revoke it at the
provider and issue a new one. Removing the text from a later commit is not a
substitute for rotation.

## Reporting a vulnerability

Please open a GitHub security advisory or, if unavailable, a minimal issue that
contains no credentials or private data. Include the affected version and a
small reproducible example.
