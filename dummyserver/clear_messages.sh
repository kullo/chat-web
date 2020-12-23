#!/bin/bash
set -o errexit -o nounset -o pipefail
which shellcheck > /dev/null && (shellcheck -x "$0" || shellcheck "$0")

rm blob_dir/*.bin || true
rm database_dir/messages_*.json || true

echo "{}" > database_dir/devices.json
echo "[]" > database_dir/users.json
echo "[]" > database_dir/conversations.json
echo "[]" > database_dir/conversation_permissions.json
