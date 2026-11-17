#!/usr/bin/env sh
# Packages the extension into dist/udb-switcher.zip
set -e

cd "$(dirname "$0")"

FILES="manifest.json content.js"
OUT="dist/udb-switcher.zip"

mkdir -p dist
rm -f "$OUT"
zip -q "$OUT" $FILES

echo "Created $OUT (version $(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' manifest.json))"
