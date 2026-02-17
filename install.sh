#!/usr/bin/env bash
# Dexter AI — install from source
# Usage: curl -fsSL https://raw.githubusercontent.com/Aidendev0x32-lang/Dexter-ai/main/install.sh | bash
set -euo pipefail

REPO="https://github.com/Aidendev0x32-lang/Dexter-ai.git"
INSTALL_DIR="${DEXTER_INSTALL_DIR:-$HOME/.dexter}"
BRANCH="${DEXTER_BRANCH:-main}"

# ── Colours ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { printf "${CYAN}▶${NC} %s\n" "$1"; }
ok()    { printf "${GREEN}✓${NC} %s\n" "$1"; }
warn()  { printf "${YELLOW}⚠${NC} %s\n" "$1"; }
fail()  { printf "${RED}✗${NC} %s\n" "$1"; exit 1; }

# ── Pre-flight checks ──
info "Checking prerequisites..."

# Node >= 22
if ! command -v node &>/dev/null; then
  fail "Node.js is required but not installed. Install Node >= 22 first: https://nodejs.org"
fi
NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 22 ]; then
  fail "Node >= 22 required, found v$(node -v). Please upgrade: https://nodejs.org"
fi
ok "Node $(node -v)"

# pnpm (preferred) or npm
if command -v pnpm &>/dev/null; then
  PKG_MGR="pnpm"
elif command -v npm &>/dev/null; then
  PKG_MGR="npm"
else
  fail "pnpm or npm is required. Install pnpm: https://pnpm.io/installation"
fi
ok "Package manager: $PKG_MGR"

# git
if ! command -v git &>/dev/null; then
  fail "git is required but not installed."
fi
ok "git $(git --version | awk '{print $3}')"

# ── Clone or update ──
if [ -d "$INSTALL_DIR" ]; then
  info "Updating existing installation at $INSTALL_DIR..."
  cd "$INSTALL_DIR"
  git fetch origin "$BRANCH" --quiet
  git checkout "$BRANCH" --quiet
  git pull origin "$BRANCH" --quiet
  ok "Updated to latest"
else
  info "Cloning Dexter to $INSTALL_DIR..."
  git clone --branch "$BRANCH" --depth 1 "$REPO" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
  ok "Cloned"
fi

# ── Install dependencies ──
info "Installing dependencies..."
if [ "$PKG_MGR" = "pnpm" ]; then
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
else
  npm ci 2>/dev/null || npm install
fi
ok "Dependencies installed"

# ── Build ──
# Project build (tsdown) must run before ui:build because tsdown
# cleans dist/ on each run, which would wipe dist/control-ui/.
info "Building project..."
$PKG_MGR run build
ok "Build complete"

info "Building UI..."
$PKG_MGR run ui:build
ok "UI built"

# ── Link binary ──
info "Linking openclaw CLI..."
if [ "$PKG_MGR" = "pnpm" ]; then
  pnpm link --global 2>/dev/null || true
else
  npm link 2>/dev/null || true
fi

# ── Verify ──
if command -v openclaw &>/dev/null; then
  ok "openclaw CLI is available globally"
else
  warn "Could not link globally. You can run directly:"
  warn "  cd $INSTALL_DIR && $PKG_MGR openclaw"
fi

echo ""
printf "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
printf "${GREEN}  Dexter installed successfully!${NC}\n"
printf "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo ""
info "Quick start (web wizard):"
echo "  cd $INSTALL_DIR"
echo "  openclaw gateway run --setup --port 18789"
echo ""
info "Quick start (CLI wizard):"
echo "  openclaw onboard --install-daemon"
echo ""
info "Installed at: $INSTALL_DIR"
