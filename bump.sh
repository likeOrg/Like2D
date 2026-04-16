#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <package> <version>"
  echo "  package: like | scene"
  echo "  version: X.Y.Z (e.g., 2.8.0)"
  echo ""
  echo "Examples:"
  echo "  $0 like 2.13.1"
  echo "  $0 scene 0.2.0"
  exit 1
fi

PKG="$1"
VERSION="$2"

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be in format X.Y.Z (e.g., 2.8.0)"
  exit 1
fi

cd "$(dirname "$0")"

case "$PKG" in
  like)
    TAG="like-v$VERSION"
    DIR="like"
    jq --arg v "$VERSION" '.version = $v' like/package.json > like/package.json.tmp && mv like/package.json.tmp like/package.json
    jq --arg v "$VERSION" '.version = $v' like/jsr.json > like/jsr.json.tmp && mv like/jsr.json.tmp like/jsr.json
    git add like/package.json like/jsr.json
    ;;
  scene)
    TAG="scene-v$VERSION"
    DIR="like-scene"
    jq --arg v "$VERSION" '.version = $v' like-scene/package.json > like-scene/package.json.tmp && mv like-scene/package.json.tmp like-scene/package.json
    jq --arg v "$VERSION" '.version = $v' like-scene/jsr.json > like-scene/jsr.json.tmp && mv like-scene/jsr.json.tmp like-scene/jsr.json
    git add like-scene/package.json like-scene/jsr.json
    ;;
  *)
    echo "Error: Unknown package '$PKG'. Must be 'like' or 'scene'."
    exit 1
    ;;
esac

git commit -m "Bump $PKG to v$VERSION"
git tag "$TAG"

echo "✓ Committed and tagged $TAG"
echo "Run 'git push --follow-tags' to push"
