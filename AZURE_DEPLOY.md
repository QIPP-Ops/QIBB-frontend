# Azure Deployment Notes (Frontend)

## Azure resources

- **Resource group:** `AcwaOpsQIPP` (West Europe)
- **App Service plan:** `plan-qibb-qipp` (Linux, B1)
- **Web App:** `qippop` → https://qippop.azurewebsites.net

The GitHub workflow (`.github/workflows/deploy-azure-webapp.yml`) builds the Next.js **standalone** output and deploys the `.next/standalone` folder. The Web App startup command is `node server.js`.

## Required GitHub Secrets (repository: Settings → Secrets and variables → Actions)

1. **`AZURE_WEBAPP_PUBLISH_PROFILE`**
   - Full publish profile XML for Web App **qippop**.
   - Azure CLI (logged in):  
     `az webapp deployment list-publishing-profiles --name qippop --resource-group AcwaOpsQIPP --xml`
   - Or Portal: Web App **qippop** → **Get publish profile** → paste entire `.PublishSettings` content into the secret.

2. **`NEXT_PUBLIC_API_URL`**
   - Must point at the deployed backend API base path (includes `/api`).
   - Production example (same subscription/RG): **`https://qipp-api.azurewebsites.net/api`**
   - Next.js inlines `NEXT_PUBLIC_*` at **build** time. Changing this requires a new deploy.

Backend repo: **https://github.com/QIPP-Ops/QIBB-backend** — deploy workflow and App Service **`qipp-api`** live there; see that repo’s `AZURE_DEPLOY.md` for API secrets (`COSMOS_CONNECTION_STRING`, `JWT_SECRET`).

## Runtime notes

- App Service uses **Node.js 22 LTS** on Linux (matches GitHub Actions `node-version`).
- Startup is **`node server.js`** (standalone server), not `npm start`.

## Post-deploy checks

1. Open https://qippop.azurewebsites.net and verify the app loads.
2. Verify API calls use `${NEXT_PUBLIC_API_URL}` (e.g. login → `${NEXT_PUBLIC_API_URL}/auth/login`).
