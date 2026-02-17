# Dexter — Personal AI Assistant

<p align="center">
  <strong>Your AI assistant, your rules.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

**Dexter** is a _personal AI assistant_ you run on your own machine.
It answers you on the channels you already use (WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, iMessage, Microsoft Teams, WebChat), plus extension channels like BlueBubbles, Matrix, Zalo, and Zalo Personal. It can speak and listen on macOS/iOS/Android, and can render a live Canvas you control.

Based on [OpenClaw](https://github.com/openclaw/openclaw), Dexter adds a **web-based setup wizard** — no terminal needed to get started.

## What's different from OpenClaw?

- **Web Setup Wizard** — run the gateway in setup mode and a browser-based wizard walks you through API key entry, model selection, and channel configuration. No CLI wizardry required.
- **Auto-opens in browser** — `dexter gateway --setup` starts the server and opens the wizard in your default browser.
- **Masked API key input** — sensitive fields are rendered as password inputs.
- **Model picker** — choose your preferred OpenAI model during setup instead of getting a hardcoded default.
- **Security hardened** — setup mode is loopback-only, refuses to run on already-configured gateways without `--force`, and logs an audit warning.

## Install

Runtime: **Node >= 22**.

### Option 1: One-line install (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/Aidendev0x32-lang/Dexter-ai/main/install.sh | bash
```

This clones, builds, and links the CLI. Installs to `~/.dexter` by default.

### Option 2: npm

```bash
npm install -g dexter-ai@latest
# or
pnpm add -g dexter-ai@latest
```

### Option 3: From source

```bash
git clone https://github.com/Aidendev0x32-lang/Dexter-ai.git dexter
cd dexter

pnpm install
pnpm ui:build   # builds the Control UI + setup wizard
pnpm build
```

## Quick start

### Option A: Web setup wizard (recommended for first-time setup)

```bash
dexter gateway run --setup --port 18789
```

Your browser opens automatically. The wizard guides you through:
1. OpenAI API key (masked input)
2. Model selection
3. Channel configuration (Telegram, etc.)

Once complete, restart the gateway normally:

```bash
dexter gateway run --port 18789
```

### Option B: CLI setup (classic)

```bash
dexter onboard --install-daemon
dexter gateway --port 18789 --verbose
```

## How it works

```
WhatsApp / Telegram / Slack / Discord / Signal / iMessage / Teams / WebChat
               │
               ▼
┌───────────────────────────────┐
│         Dexter Gateway        │
│        (control plane)        │
│      ws://127.0.0.1:18789     │
└──────────────┬────────────────┘
               │
               ├─ Pi agent (RPC)
               ├─ CLI (dexter …)
               ├─ WebChat UI
               ├─ Control UI Dashboard
               ├─ macOS app
               └─ iOS / Android nodes
```

## Highlights

- **Local-first Gateway** — single control plane for sessions, channels, tools, and events.
- **Multi-channel inbox** — WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, BlueBubbles (iMessage), Microsoft Teams, Matrix, Zalo, WebChat.
- **Multi-agent routing** — route inbound channels/accounts/peers to isolated agents.
- **Voice Wake + Talk Mode** — always-on speech for macOS/iOS/Android with ElevenLabs.
- **Live Canvas** — agent-driven visual workspace with A2UI.
- **First-class tools** — browser, canvas, nodes, cron, sessions.
- **Skills platform** — bundled, managed, and workspace skills.
- **Web Setup Wizard** — browser-based onboarding, no terminal required.

## Models

Works with any OpenAI-compatible model. During web setup, you pick your preferred model. After setup, configure models via the Control UI or `~/.openclaw/openclaw.json`.

Recommended: **Anthropic Claude Opus 4.6** or **OpenAI GPT-5.1** for long-context strength.

- Models config: [Models docs](https://docs.openclaw.ai/concepts/models)
- Auth + fallbacks: [Model failover](https://docs.openclaw.ai/concepts/model-failover)

## Security defaults

Dexter connects to real messaging surfaces. Treat inbound DMs as **untrusted input**.

- **DM pairing** (default): unknown senders receive a pairing code; the bot does not process their message until approved.
- **Setup mode**: binds to loopback only, auth disabled on `127.0.0.1`, refuses to start on non-loopback interfaces.
- Run `dexter doctor` to surface risky/misconfigured DM policies.

## Chat commands

Send in WhatsApp/Telegram/Slack/WebChat:

| Command | Description |
|---------|-------------|
| `/status` | Session status (model + tokens) |
| `/new` or `/reset` | Reset the session |
| `/compact` | Compact session context |
| `/think <level>` | off\|minimal\|low\|medium\|high\|xhigh |
| `/verbose on\|off` | Toggle verbose mode |
| `/usage off\|tokens\|full` | Per-response usage footer |
| `/model <name>` | Switch model mid-session |
| `/mesh <goal>` | Auto-plan + run a multi-step workflow |
| `/restart` | Restart the gateway |

## Configuration

Config lives at `~/.openclaw/openclaw.json`:

```jsonc
{
  "models": {
    "default": "openai/gpt-5.1",
    "allowlist": ["openai/*"]
  },
  "gateway": {
    "port": 18789,
    "auth": { "mode": "token", "token": "your-token-here" }
  },
  "channels": {
    "telegram": { "enabled": true, "token": "BOT_TOKEN" }
  }
}
```

Full config reference: [Configuration](https://docs.openclaw.ai/gateway/configuration)

## Development

```bash
# Dev loop (auto-reload on TS changes)
pnpm gateway:watch

# Run tests
pnpm test

# Type-check
npx tsc --noEmit

# Build UI only
pnpm ui:build
```

## Apps (optional)

The Gateway alone delivers a great experience. All companion apps are optional:

- **macOS** — Menu bar control, Voice Wake, push-to-talk, WebChat.
- **iOS** — Canvas, Voice Wake, camera, screen recording via node pairing.
- **Android** — Canvas, Talk Mode, camera, screen recording via node pairing.

## Credits

Dexter is built on top of [OpenClaw](https://github.com/openclaw/openclaw), an MIT-licensed personal AI assistant platform. All original credit goes to the OpenClaw team.

## License

[MIT](LICENSE)
