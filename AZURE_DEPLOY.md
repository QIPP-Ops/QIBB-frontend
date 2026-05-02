# Azure Deployment Notes (Frontend)

## Required GitHub Secrets

- `AZURE_WEBAPP_PUBLISH_PROFILE`: Publish profile XML from the **qippop** Web App (download from Azure Portal → **Get publish profile**)

The workflow deploys to app name `qippop` (fixed in `.github/workflows/deploy-azure-webapp.yml`).

## Build-time variables (GitHub Secrets)

- `NEXT_PUBLIC_API_URL` (repository secret)
  - Example: `https://<your-backend-domain>/api`
  - Note: Next.js inlines `NEXT_PUBLIC_*` at build time. Set this as a repository secret (Settings → Secrets) so the GitHub Action can provide it during `npm run build`. Changing this value requires rebuilding the frontend.

## Runtime notes

- App Service startup command should be `npm start`
- Node runtime should be 20+

## Post-deploy checks

1. Open frontend URL and verify login page loads
2. Verify login request goes to `${NEXT_PUBLIC_API_URL}/auth/login`
