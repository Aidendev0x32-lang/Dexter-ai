---
summary: "CLI reference for `dexter devices` (device pairing + token rotation/revocation)"
read_when:
  - You are approving device pairing requests
  - You need to rotate or revoke device tokens
title: "devices"
---

# `dexter devices`

Manage device pairing requests and device-scoped tokens.

## Commands

### `dexter devices list`

List pending pairing requests and paired devices.

```
dexter devices list
dexter devices list --json
```

### `dexter devices approve <requestId>`

Approve a pending device pairing request.

```
dexter devices approve <requestId>
```

### `dexter devices reject <requestId>`

Reject a pending device pairing request.

```
dexter devices reject <requestId>
```

### `dexter devices rotate --device <id> --role <role> [--scope <scope...>]`

Rotate a device token for a specific role (optionally updating scopes).

```
dexter devices rotate --device <deviceId> --role operator --scope operator.read --scope operator.write
```

### `dexter devices revoke --device <id> --role <role>`

Revoke a device token for a specific role.

```
dexter devices revoke --device <deviceId> --role node
```

## Common options

- `--url <url>`: Gateway WebSocket URL (defaults to `gateway.remote.url` when configured).
- `--token <token>`: Gateway token (if required).
- `--password <password>`: Gateway password (password auth).
- `--timeout <ms>`: RPC timeout.
- `--json`: JSON output (recommended for scripting).

Note: when you set `--url`, the CLI does not fall back to config or environment credentials.
Pass `--token` or `--password` explicitly. Missing explicit credentials is an error.

## Notes

- Token rotation returns a new token (sensitive). Treat it like a secret.
- These commands require `operator.pairing` (or `operator.admin`) scope.
