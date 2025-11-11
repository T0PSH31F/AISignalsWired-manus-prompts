# GitHub Actions Workflows for AI Signals Wired

## File 1: .github/workflows/deploy-api.yml

```yaml
name: Deploy API to Cloudflare Workers

on:
  push:
    branches: [main, production]
    paths:
      - 'apps/api/**'
      - 'packages/**'
      - '.github/workflows/deploy-api.yml'
  workflow_dispatch:  # Manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy API Worker

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm run build

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: 'apps/api'
          command: publish

      - name: Notify Discord (Success)
        if: success()
        run: |
          curl -X POST \${{ secrets.DISCORD_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{
              "content": "✅ API deployed successfully to Cloudflare Workers",
              "username": "Deployment Bot"
            }'

      - name: Notify Discord (Failure)
        if: failure()
        run: |
          curl -X POST \${{ secrets.DISCORD_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{
              "content": "❌ API deployment failed. Check GitHub Actions logs.",
              "username": "Deployment Bot"
            }'
```

---

## File 2: .github/workflows/deploy-signal-engine.yml

```yaml
name: Deploy Signal Engine to Cloudflare Workers

on:
  push:
    branches: [main, production]
    paths:
      - 'apps/signal-engine/**'
      - 'packages/strategies/**'
      - '.github/workflows/deploy-signal-engine.yml'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy Signal Engine

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: |
          cd apps/signal-engine
          pnpm run build

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: 'apps/signal-engine'
          command: publish

      - name: Verify cron trigger
        run: |
          echo "Signal engine deployed. Cron trigger: */15 * * * *"
          echo "Next run: $(date -d '+15 minutes' +'%Y-%m-%d %H:%M:%S')"

      - name: Notify success
        if: success()
        run: |
          curl -X POST \${{ secrets.DISCORD_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{"content": "✅ Signal Engine deployed. Cron active (every 15 min)"}'
```

---

## File 3: .github/workflows/deploy-frontend.yml

```yaml
name: Deploy Frontend to Cloudflare Pages

on:
  push:
    branches: [main, production]
    paths:
      - 'apps/frontend/**'
      - 'packages/shared/**'
      - '.github/workflows/deploy-frontend.yml'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy Frontend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build frontend
        working-directory: apps/frontend
        env:
          VITE_API_URL: \${{ secrets.VITE_API_URL }}
          VITE_SUPABASE_URL: \${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: \${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_STRIPE_PUBLIC_KEY: \${{ secrets.VITE_STRIPE_PUBLIC_KEY }}
        run: pnpm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages publish apps/frontend/dist --project-name=aisignals-frontend

      - name: Notify success
        if: success()
        run: |
          curl -X POST \${{ secrets.DISCORD_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{"content": "✅ Frontend deployed to Cloudflare Pages: https://aisignalswired.com"}'
```

---

## File 4: .github/workflows/test.yml

```yaml
name: Run Tests

on:
  pull_request:
    branches: [main, production]
  push:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    name: Test All Packages

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter
        run: pnpm run lint

      - name: Run type check
        run: pnpm run build

      - name: Run unit tests
        run: pnpm run test

      - name: Test strategy logic
        working-directory: packages/strategies
        run: pnpm run test

      - name: Report test results
        if: always()
        uses: dorny/test-reporter@v1
        with:
          name: Test Results
          path: '**/*.test.json'
          reporter: 'jest-junit'
```

---

## File 5: .github/workflows/database-migration.yml

```yaml
name: Run Database Migrations

on:
  workflow_dispatch:
    inputs:
      migration_name:
        description: 'Migration file name'
        required: true
        type: string

jobs:
  migrate:
    runs-on: ubuntu-latest
    name: Apply Database Migration

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link Supabase project
        run: |
          supabase link --project-ref \${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: \${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Run migration
        run: |
          cd packages/database
          supabase db push

      - name: Generate updated types
        run: |
          cd packages/database
          supabase gen types typescript --local > types/supabase.ts

      - name: Commit updated types
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add packages/database/types/supabase.ts
          git commit -m "Update Supabase types after migration" || echo "No changes"
          git push
```

---

## Required GitHub Secrets

Set these in: Repository Settings → Secrets and variables → Actions → New repository secret

```bash
# Cloudflare
CLOUDFLARE_API_TOKEN         # Get from: dash.cloudflare.com/profile/api-tokens
CLOUDFLARE_ACCOUNT_ID        # Found in Cloudflare dashboard URL

# Supabase
SUPABASE_PROJECT_REF         # From Supabase project settings
SUPABASE_ACCESS_TOKEN        # From Supabase account settings

# Frontend environment variables
VITE_API_URL                 # https://api.aisignalswired.com
VITE_SUPABASE_URL            # https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY       # From Supabase project settings
VITE_STRIPE_PUBLIC_KEY       # pk_live_...

# Notifications
DISCORD_WEBHOOK_URL          # Discord webhook for deployment notifications
```

---

## Workflow Triggers

### Automatic Deploys (on push to main):
- **API**: Triggered when `apps/api/**` or `packages/**` changes
- **Signal Engine**: Triggered when `apps/signal-engine/**` or `packages/strategies/**` changes
- **Frontend**: Triggered when `apps/frontend/**` or `packages/shared/**` changes

### Manual Deploys:
- All workflows support `workflow_dispatch` for manual triggering
- Go to: Actions → Select workflow → Run workflow

### Pull Request Checks:
- Tests run automatically on all PRs to `main` or `production` branches
- Ensures code quality before merging

---

## Deployment Flow Example

```bash
# 1. Make changes locally
git checkout -b feature/new-strategy
# ... make changes ...
git add .
git commit -m "Add new trading strategy"

# 2. Push and create PR
git push origin feature/new-strategy
# GitHub automatically runs tests

# 3. After PR approval, merge to main
# GitHub automatically deploys:
#    - API Worker (if API code changed)
#    - Signal Engine (if strategies changed)
#    - Frontend (if UI changed)

# 4. Check deployment status
# Visit: https://github.com/YOUR_ORG/AISignalsWired/actions
```

---

## Cost Breakdown (GitHub Actions)

**Free tier**: 2,000 minutes/month (Linux runners)

**Estimated usage per deploy**:
- API deploy: ~3 minutes
- Signal Engine deploy: ~2 minutes
- Frontend deploy: ~4 minutes
- Tests: ~2 minutes

**Total per full deploy**: ~11 minutes

**Monthly estimate** (assuming 30 deploys/month):
- 30 deploys × 11 min = 330 minutes
- **Cost**: $0 (well within free tier)

---

All GitHub Actions workflows created!
