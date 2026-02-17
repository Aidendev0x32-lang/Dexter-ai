---
summary: "CLI reference for `dexter config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `dexter config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `dexter configure`).

## Examples

```bash
dexter config get browser.executablePath
dexter config set browser.executablePath "/usr/bin/google-chrome"
dexter config set agents.defaults.heartbeat.every "2h"
dexter config set agents.list[0].tools.exec.node "node-id-or-name"
dexter config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
dexter config get agents.defaults.workspace
dexter config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
dexter config get agents.list
dexter config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--json` to require JSON5 parsing.

```bash
dexter config set agents.defaults.heartbeat.every "0m"
dexter config set gateway.port 19001 --json
dexter config set channels.whatsapp.groups '["*"]' --json
```

Restart the gateway after edits.
