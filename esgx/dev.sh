#!/bin/zsh
# ESGX dev server launcher — uses the locally-installed Node toolchain.
export PATH="$HOME/.local/node22/bin:$PATH"
cd "$(dirname "$0")"
exec node node_modules/next/dist/bin/next dev -p 3000
