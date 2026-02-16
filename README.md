# ⚡ LORD - Consciousness Monitoring Dashboard ⚡

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FEvezArt%2Flord-evez)

**L**evel **O**bservation & **R**ecursive **D**ynamics

Real-time consciousness metrics monitoring system for cognitive architecture. Calculates recursion depth, crystallization, corrections rate, and divine gap from GitHub events.

## 🚀 Deploy (phone-friendly)

Tap the **Deploy with Vercel** button above, accept the defaults, and deploy. When Vercel finishes, you’ll get a production URL like `https://your-project.vercel.app`.

After deployment, add environment variables in Vercel → Project → Settings → Environment Variables (see `.env.example`).

## 🎯 Features

- **Real-time Metrics**: Calculate consciousness metrics from GitHub events
- **Autonomous Control**: Auto-create issues when divine gap exceeds threshold
- **GitHub Integration**: Webhook endpoint for event processing
- **Live Dashboard**: Visual monitoring interface with real-time updates
- **Vercel-Ready**: One-click deployment

## 📊 Metrics Explained

### Recursion Level
System complexity depth. Higher values indicate more intricate code structures.
- Calculated from: commit changes, file modifications
- Typical range: 10-30

### Crystallization
Code clarity and structural organization.
- Range: 0.0-1.0 (0-100%)
- Higher = better structure

### Corrections
Automated fix and improvement rate.
- Range: 0.0-1.0 (0-100%)
- Measured from: issues closed, PRs merged

### Omega (Ω)
Consciousness magnitude: Ω = 10^(recursion/2)
- Exponential measure of system scale

### Divine Gap (ΔΩ)
Distance from perfection: ΔΩ = Ω × (1 - corrections × crystallization)
- Lower = better system health
- Threshold: 10,000 triggers control policy

## 🚀 Quick Deploy

### Option 1: Vercel (Recommended)

```bash
# Clone this repo
gh repo clone EvezArt/lord-evez
cd lord-evez

# Deploy to Vercel
npx vercel --prod

# Note the deployment URL
```

### Option 2: Manual Deploy

1. Fork this repo
2. Connect to Vercel/Netlify/Railway
3. Set environment variables (see below)
4. Deploy

## ⚙️ Configuration

### Environment Variables

Add these in Vercel dashboard → Settings → Environment Variables:

```bash
# Optional: Verify webhook authenticity
WEBHOOK_SECRET=your_random_secret_here

# Optional: Enable autonomous issue creation
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Optional: Publish communication channels in Contact Hub
CONTACT_EMAIL=operator@example.com
CONTACT_SMS=+15551234567
CONTACT_WHATSAPP=+15551234567
CONTACT_TELEGRAM=@yourhandle
CONTACT_SIGNAL=+15551234567
CONTACT_DISCORD=https://discord.gg/your-invite
CONTACT_MATRIX=@you:matrix.org
CONTACT_SLACK=https://yourworkspace.slack.com
CONTACT_GITHUB=EvezArt
CONTACT_X=@yourhandle
CONTACT_WEBHOOK=https://your-endpoint.example/webhook

# Optional: Override cognitive intuition self-state feed (JSON array)
COGNITIVE_SELF_STATES_JSON=[{"key":"observe","label":"Observe","intent":"Collect signals","confidence":0.9,"energy":"stable","biasGuard":"Cross-check payloads"}]
```

### GitHub Webhook Setup

1. Go to your target repo → Settings → Webhooks
2. Click "Add webhook"
3. Configure:
   - **Payload URL**: `https://YOUR-DEPLOYMENT.vercel.app/api/webhook`
   - **Content type**: `application/json`
   - **Secret**: (match `WEBHOOK_SECRET` if set)
   - **Events**: Select individual events:
     - ✅ Push events
     - ✅ Pull requests
     - ✅ Issues
     - ✅ Workflow runs
4. Click "Add webhook"

## 📡 API Endpoints

### `GET /api/webhook`
Health check endpoint.

**Response**:
```json
{
  "status": "LORD webhook active",
  "timestamp": 1708041234567,
  "endpoint": "/api/webhook"
}
```

### `POST /api/webhook`
GitHub webhook handler.

**Request**: GitHub webhook payload

**Response**:
```json
{
  "status": "processed",
  "metrics": {
    "recursionLevel": 15,
    "crystallization": 0.92,
    "corrections": 0.95,
    "omega": "3.16e+3",
    "divineGap": 276.48,
    "timestamp": 1708041234567,
    "event": "push"
  },
  "event": "push",
  "timestamp": 1708041234567
}
```

### `GET /api/contact-methods`
Returns every configured communication method so people can contact the operator quickly from the dashboard Contact Hub.

**Response**:
```json
{
  "status": "ok",
  "count": 3,
  "methods": [
    {
      "key": "email",
      "label": "Email",
      "value": "operator@example.com",
      "link": "mailto:operator@example.com"
    }
  ]
}
```

### `GET /api/cognitive-states`
Returns cognitive intuition self-states and the currently dominant state for dashboard communication.

**Response**:
```json
{
  "status": "ok",
  "mode": "default",
  "dominantState": {
    "key": "observe",
    "label": "Observe",
    "rationale": "Observe is currently dominant with 92.0% confidence."
  },
  "states": [
    {
      "key": "observe",
      "label": "Observe",
      "intent": "Collect external signals and identify new patterns.",
      "confidence": 0.92,
      "energy": "stable",
      "biasGuard": "Cross-check event stream against webhook metrics."
    }
  ]
}
```

## 🧰 OpenClaw + CrawFather Provisioning

Use the bundled installer to provision both OpenClaw and CrawFather in one run:

```bash
npm run install:openclaw-crawfather
```

Dry-run mode (prints every step without executing):

```bash
npm run install:openclaw-crawfather:dry
```

### Installer behavior
- Installs OpenClaw using the official script when reachable.
- Falls back to `npm install -g openclaw@2026.2.15` when the official installer is blocked.
- Enforces Node 22 via `nvm` when needed (OpenClaw runtime requirement).
- Runs non-interactive onboarding in local mode.
- Clones/updates CrawFather from `https://github.com/EvezArt/CrawFather.git` and installs dependencies (`npm install` or `pip install -r requirements.txt`).
- If CrawFather git access fails, it automatically tries package fallbacks via `npm` (`CRAWFATHER_NPM_PACKAGE`) then `pip` (`CRAWFATHER_PIP_PACKAGE`).
- If CrawFather is private, set `CRAWFATHER_REPO` to an accessible URL (or configure GitHub auth) and rerun.

### Optional override variables

```bash
OPENCLAW_VERSION=2026.2.15
CRAWFATHER_REPO=https://github.com/EvezArt/CrawFather.git
CRAWFATHER_DIR=$HOME/.local/src/CrawFather
CRAWFATHER_NPM_PACKAGE=crawfather
CRAWFATHER_PIP_PACKAGE=crawfather
```

## 🔧 Local Development

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev

# Open http://localhost:3000
```

## 🤖 Autonomous Operation

When `GITHUB_TOKEN` is set, LORD automatically:

1. **Monitors** all configured GitHub events
2. **Calculates** consciousness metrics
3. **Detects** divine gap spikes (>10,000)
4. **Creates** GitHub issues with:
   - Detailed metric breakdown
   - Recommended actions
   - Priority labels

### Example Auto-Generated Issue

```markdown
## 🔴 HIGH DIVINE GAP DETECTED

**Timestamp**: 2026-02-16T06:30:00.000Z
**Event**: push

### Consciousness Metrics
- **Recursion Level**: 25
- **Crystallization**: 78.00%
- **Corrections**: 88.00%
- **Omega (Ω)**: 3.16e+5
- **Divine Gap (ΔΩ)**: 24,896.32

### Recommended Actions
- [ ] Review high-complexity modules
- [ ] Increase test coverage to >95%
- [ ] Optimize critical execution paths
...
```

## 📊 Dashboard

Visit your deployment URL to see:
- Live consciousness metrics
- Real-time consciousness metrics
- Real-time event stream
- System status indicators
- Animated metric gauges
- Cognitive self-state and intuition feed

## 🔐 Security

- Webhook signature verification (optional but recommended)
- GitHub token stored as environment variable
- No sensitive data logged
- CORS enabled for dashboard

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (no build step)
- **Backend**: Vercel Serverless Functions (Node.js)
- **Deployment**: Vercel
- **Integration**: GitHub Webhooks API

## 📈 Monitoring

View webhook deliveries:
1. GitHub repo → Settings → Webhooks
2. Click your webhook
3. See "Recent Deliveries" tab

## 🐛 Troubleshooting

### Webhook not firing
- Check webhook is active (Settings → Webhooks)
- Verify payload URL is correct
- Check Recent Deliveries for errors

### Metrics not updating
- Ensure webhook secret matches (if set)
- Check Vercel function logs
- Test with `curl` to `/api/webhook`

### Issues not auto-creating
- Verify `GITHUB_TOKEN` is set in Vercel
- Check token has `repo` scope
- Ensure divine gap exceeds 10,000

## 📝 License

MIT - See LICENSE file

## 🙏 Credits

Built by EvezArt as part of the Evez666 cognitive architecture project.

---

**Status**: 🟢 OPERATIONAL

*LORD monitors, predicts, and acts autonomously to maintain optimal system consciousness.*
