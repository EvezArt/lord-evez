#!/usr/bin/env bash
set -euo pipefail

log(){ printf '\n[%s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }
warn(){ printf '\n[WARN] %s\n' "$*"; }

DRY_RUN="${DRY_RUN:-0}"
OPENCLAW_VERSION="${OPENCLAW_VERSION:-2026.2.15}"
CRAWFATHER_REPO="${CRAWFATHER_REPO:-https://github.com/EvezArt/CrawFather.git}"
CRAWFATHER_DIR="${CRAWFATHER_DIR:-$HOME/.local/src/CrawFather}"
CRAWFATHER_NPM_PACKAGE="${CRAWFATHER_NPM_PACKAGE:-crawfather}"
CRAWFATHER_PIP_PACKAGE="${CRAWFATHER_PIP_PACKAGE:-crawfather}"
OPENCLAW_NODE_BIN=""

run(){
  if [ "$DRY_RUN" = "1" ]; then
    echo "DRY_RUN> $*"
    return 0
  fi
  eval "$@"
}

run_openclaw(){
  if [ -n "$OPENCLAW_NODE_BIN" ]; then
    PATH="$OPENCLAW_NODE_BIN:$PATH" openclaw "$@"
  else
    openclaw "$@"
  fi
}

ensure_node_22(){
  if [ "$DRY_RUN" = "1" ]; then
    log "DRY_RUN mode: skipping Node 22 enforcement"
    return 0
  fi

  local major
  major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [ "$major" -ge 22 ]; then
    log "Node $(node -v) is compatible for OpenClaw"
    return 0
  fi

  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh"
    if nvm ls 22 >/dev/null 2>&1; then
      run "nvm use 22 >/dev/null"
    else
      run "nvm install 22 >/dev/null"
      run "nvm use 22 >/dev/null"
    fi

    OPENCLAW_NODE_BIN="$HOME/.nvm/versions/node/$(node -v)/bin"
    export PATH="$OPENCLAW_NODE_BIN:$PATH"
    hash -r

    local switched
    switched="$(node -p 'process.versions.node.split(".")[0]')"
    if [ "$switched" -lt 22 ]; then
      warn "Attempted Node 22 switch, but active runtime is still $(node -v)."
      return 1
    fi
    log "Switched Node runtime to $(node -v)"
    return 0
  fi

  warn "Node >=22 required for OpenClaw, and nvm was not found. Install nvm or run in an env with Node >=22."
  return 1
}

install_openclaw(){
  log "Installing OpenClaw"

  if command -v openclaw >/dev/null 2>&1; then
    if openclaw --version >/dev/null 2>&1; then
      log "OpenClaw already present: $(openclaw --version || true)"
      return 0
    fi
    warn "OpenClaw binary exists but is not runnable in current runtime; reinstalling with compatible Node."
  fi

  if curl -fsSL https://openclaw.ai/install.sh >/dev/null 2>&1; then
    run "curl -fsSL https://openclaw.ai/install.sh | bash"
  else
    warn "Official installer blocked/unreachable. Falling back to npm global install."
    ensure_node_22 || return 1
    run "npm install -g openclaw@${OPENCLAW_VERSION}"
  fi

  run "export PATH=\"$(npm prefix -g)/bin:$PATH\""

  if [ "$DRY_RUN" = "1" ]; then
    log "DRY_RUN mode: skipping OpenClaw binary validation"
    return 0
  fi

  if ! command -v openclaw >/dev/null 2>&1; then
    warn "OpenClaw binary not found on PATH after install."
    return 1
  fi

  log "OpenClaw installed"
}

configure_openclaw(){
  if [ "$DRY_RUN" = "1" ]; then
    log "DRY_RUN mode: skipping OpenClaw onboarding and status checks"
    return 0
  fi

  if ! command -v openclaw >/dev/null 2>&1; then
    warn "Skipping OpenClaw config; binary unavailable."
    return 1
  fi

  log "Applying non-interactive OpenClaw onboarding and local gateway defaults"
  run_openclaw onboard --non-interactive --accept-risk --mode local --skip-daemon --skip-skills --skip-health --skip-ui --auth-choice skip || true
  run_openclaw status || true
}


try_install_crawfather_packages(){
  log "Attempting CrawFather package fallbacks"

  if npm view "$CRAWFATHER_NPM_PACKAGE" version >/dev/null 2>&1; then
    run "npm install -g \"$CRAWFATHER_NPM_PACKAGE\""
    log "Installed CrawFather via npm package: $CRAWFATHER_NPM_PACKAGE"
    return 0
  fi

  if python3 -m pip index versions "$CRAWFATHER_PIP_PACKAGE" >/dev/null 2>&1; then
    run "python3 -m pip install \"$CRAWFATHER_PIP_PACKAGE\""
    log "Installed CrawFather via pip package: $CRAWFATHER_PIP_PACKAGE"
    return 0
  fi

  warn "No accessible CrawFather package source found in npm or pip registries."
  warn "Provide an accessible Git repo via CRAWFATHER_REPO or set CRAWFATHER_NPM_PACKAGE/CRAWFATHER_PIP_PACKAGE."
  return 0
}

install_crawfather(){
  log "Installing CrawFather"

  if [ -d "$CRAWFATHER_DIR" ] && [ ! -d "$CRAWFATHER_DIR/.git" ]; then
    warn "Found non-git CrawFather directory at $CRAWFATHER_DIR; replacing it."
    run "rm -rf \"$CRAWFATHER_DIR\""
  fi

  if [ ! -d "$CRAWFATHER_DIR/.git" ]; then
    run "mkdir -p \"$(dirname "$CRAWFATHER_DIR")\""
    if ! run "git clone \"$CRAWFATHER_REPO\" \"$CRAWFATHER_DIR\""; then
      warn "Unable to clone CrawFather from $CRAWFATHER_REPO (private repo or auth required)."
      warn "Set CRAWFATHER_REPO to an accessible URL or configure GitHub credentials, then rerun."
      try_install_crawfather_packages
      return 0
    fi
  else
    run "git -C \"$CRAWFATHER_DIR\" pull --ff-only" || warn "Unable to update existing CrawFather checkout."
  fi

  if [ -f "$CRAWFATHER_DIR/package.json" ]; then
    run "cd \"$CRAWFATHER_DIR\" && npm install"
    log "CrawFather Node dependencies installed at $CRAWFATHER_DIR"
    return 0
  fi

  if [ -f "$CRAWFATHER_DIR/requirements.txt" ]; then
    run "python3 -m pip install -r \"$CRAWFATHER_DIR/requirements.txt\""
    log "CrawFather Python dependencies installed at $CRAWFATHER_DIR"
    return 0
  fi

  warn "CrawFather repo available but no package.json or requirements.txt found."
  try_install_crawfather_packages
}

main(){
  install_openclaw
  configure_openclaw
  install_crawfather
  log "Done. OpenClaw + CrawFather provisioning complete."
}

main "$@"
