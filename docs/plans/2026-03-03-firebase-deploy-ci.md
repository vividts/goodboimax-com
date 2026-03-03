# Firebase Deploy + Auto-Deploy on Main Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy the Next.js app to Firebase Hosting (web frameworks mode) and wire up GitHub Actions to auto-deploy on every push to main.

**Architecture:** Firebase Hosting already has `source: "."` + `frameworksBackend` configured, meaning Firebase CLI detects Next.js and handles SSR via Cloud Run. CI auth uses a Firebase CI token stored as a GitHub secret. Environment variables for the Firebase Admin SDK are stored as additional GitHub secrets and injected at deploy time.

**Tech Stack:** Firebase CLI, GitHub Actions, `firebase-tools`, `actions/checkout`, `actions/setup-node`, `google-github-actions/auth`

---

### Task 1: Verify firebase-tools is installed locally

**Files:**
- None (CLI check only)

**Step 1: Check if firebase-tools is installed globally**

```bash
firebase --version
```

Expected: a version string like `13.x.x`. If not found, install it:

```bash
npm install -g firebase-tools
```

**Step 2: Confirm you're logged in and the right project is active**

```bash
firebase projects:list
```

Expected: `goodboimax` appears in the list and matches `.firebaserc`.

---

### Task 2: Do a manual deploy to confirm the current config works

**Files:**
- None (validate existing config)

**Step 1: Build the Next.js app**

```bash
npm run build
```

Expected: build succeeds, `.next/` is populated.

**Step 2: Deploy to Firebase**

```bash
firebase deploy
```

Expected: Firebase CLI detects Next.js (you'll see "Detected a Next.js codebase"), uploads to Cloud Run, and prints a live URL ending in `goodboimax.com` or a `web.app` preview URL.

If this succeeds, your local config is correct. If it fails, fix the error before proceeding to CI setup.

---

### Task 3: Create a GCP service account for CI

**Files:**
- None (GCP Console steps)

**Step 1: Create the service account**

Go to https://console.cloud.google.com → select project `goodboimax` → **IAM & Admin** → **Service Accounts** → **Create service account**.

- Name: `github-actions-deploy`
- Grant these roles:
  - `Firebase Admin`
  - `Cloud Run Admin`
  - `Cloud Build Editor`
  - `Artifact Registry Administrator`
  - `Service Account User`

**Step 2: Download the JSON key**

Open the new service account → **Keys** tab → **Add Key** → **Create new key** → **JSON**.

A `.json` file downloads — keep it, you'll paste its contents into GitHub next.

---

### Task 4: Add GitHub secrets

**Files:**
- None (GitHub UI steps)

Go to your repo on GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add each of these secrets:

| Secret Name | Value |
|---|---|
| `GCP_SERVICE_ACCOUNT_KEY` | Paste the **entire contents** of the downloaded JSON key file |
| `FIREBASE_PROJECT_ID` | `goodboimax` |
| `FIREBASE_CLIENT_EMAIL` | Value from `.env.local` |
| `FIREBASE_PRIVATE_KEY` | Value from `.env.local` (include the full `-----BEGIN PRIVATE KEY-----...` string with literal `\n` chars) |

---

### Task 5: Create the GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create the workflows directory**

```bash
mkdir -p .github/workflows
```

**Step 2: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Build
        env:
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          FIREBASE_CLIENT_EMAIL: ${{ secrets.FIREBASE_CLIENT_EMAIL }}
          FIREBASE_PRIVATE_KEY: ${{ secrets.FIREBASE_PRIVATE_KEY }}
        run: npm run build

      - name: Deploy to Firebase
        env:
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          FIREBASE_CLIENT_EMAIL: ${{ secrets.FIREBASE_CLIENT_EMAIL }}
          FIREBASE_PRIVATE_KEY: ${{ secrets.FIREBASE_PRIVATE_KEY }}
        run: npx firebase-tools deploy --non-interactive
```

> **Why `npx firebase-tools` instead of `firebase`?** The runner doesn't have firebase-tools globally installed. `npx firebase-tools` uses the version from your project's `node_modules` (or downloads it). This keeps the version consistent with what you have locally.

> **Why skip e2e tests?** Playwright e2e tests require a running server and browser. Running them in CI against production after deploy is a separate concern (smoke testing). Skipping them here keeps the deploy fast and reliable. Add a separate `e2e` job later if desired.

**Step 3: Commit the workflow**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add Firebase auto-deploy on push to main"
```

---

### Task 6: Verify the CI deploy works

**Step 1: Push to main**

```bash
git push origin main
```

**Step 2: Watch the Actions run**

Go to GitHub → **Actions** tab. You should see "Deploy to Firebase" in progress.

Expected: all steps green, deploy step ends with Firebase printing the live URL.

**Step 3: Confirm the live site is updated**

Visit `https://goodboimax.com` (or the `web.app` URL Firebase printed). Verify the latest changes are live.

---

### Task 7: (Optional) Add a deploy status badge to README

**Files:**
- Modify: `README.md` (if it exists)

Add to the top of the README:

```markdown
![Deploy](https://github.com/<YOUR_GITHUB_USERNAME>/goodboimax.com/actions/workflows/deploy.yml/badge.svg)
```

Replace `<YOUR_GITHUB_USERNAME>` with your actual GitHub username.

---

## Troubleshooting Reference

| Issue | Fix |
|---|---|
| `firebase: command not found` in CI | Use `npx firebase-tools` (already in workflow above) |
| `Error: Failed to get Firebase project` | Check `GCP_SERVICE_ACCOUNT_KEY` secret is set and has required roles |
| Build fails with missing env vars | Ensure all 3 `FIREBASE_*` secrets are set in GitHub |
| `FIREBASE_PRIVATE_KEY` newline issues | The private key contains literal `\n`; GitHub Actions handles this fine if copied exactly |
| Cloud Run quota errors | First deploy may take a few minutes; retry if it times out |
| Permission denied on Cloud Run / Cloud Build | Add `Cloud Run Admin`, `Cloud Build Editor`, `Artifact Registry Admin` roles to service account |
