---
description: "Rules for Git commits and branch management."
---
# Git Workflow Rules

The user has a CI/CD pipeline connected to the `main` and/or `staging` branches which automatically deploys to production. Therefore, pushing code without permission can cause unintended live deployments.

**Follow these rules STRICTLY:**
1. **Never commit or push without explicit permission.** Only commit and push when the user explicitly asks you to.
2. **Use Feature Branches.** When the user says "push", this automatically means you should commit and push your changes to a **feature branch** (or `develop` if specifically on it), NEVER directly to `staging` or `main`.
3. **No Automatic Merging.** Do NOT merge into `develop`, `staging`, or `main` unless the user explicitly requests you to perform a merge for that specific branch.
4. **Always Ask.** If you have finished a task and believe the code is ready, inform the user and ask for their instructions on committing and pushing.
