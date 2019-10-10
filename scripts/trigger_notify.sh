#!/usr/bin/env bash

set -e

echo "Matter token ${UI_BOT_TOKEN}"

VERSION_CURRENT_PACKAGE=$(npm info @ptsecurity/mosaic version)

echo "Version of package ${VERSION_CURRENT_PACKAGE}"

curl \
-i \
-X POST \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'payload={
  "channel": "town-square",
  "username": "Wall-e",
  "text": "#### :white_check_mark: Mosaic was published. :bell: :tada:\n
  Version | '"$VERSION_CURRENT_PACKAGE"'
  --- | ---
  :gear: Build | [#'"$CIRCLE_BUILD_NUM"']('"$CIRCLE_BUILD_URL"')
  :package: Package | [mosaic](https://www.npmjs.com/package/@ptsecurity/mosaic)
  :memo: Changelog | [view](https://github.com/positive-js/mosaic/blob/'"$CIRCLE_TAG"'/CHANGELOG.md)"
}' https://chat.ptsecurity.com/hooks/${UI_BOT_TOKEN}

