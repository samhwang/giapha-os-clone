#!/usr/bin/env bash
set -euo pipefail

GARAGE_ADMIN_API="http://localhost:3903"
BUCKET_NAME="avatars"

echo "==> Waiting for Garage to be ready..."
until curl -sf "$GARAGE_ADMIN_API/health" > /dev/null 2>&1; do
  sleep 1
done
echo "==> Garage is ready."

# Get the node ID
NODE_ID=$(curl -sf "$GARAGE_ADMIN_API/v1/status" | python3 -c "import sys,json; print(json.load(sys.stdin)['node'])" 2>/dev/null)
if [ -z "$NODE_ID" ]; then
  echo "ERROR: Could not retrieve Garage node ID."
  exit 1
fi
echo "==> Node ID: $NODE_ID"

# Assign the node to a zone with full capacity
echo "==> Configuring node layout..."
curl -sf -X POST "$GARAGE_ADMIN_API/v1/layout" \
  -H "Content-Type: application/json" \
  -d "[{\"id\": \"$NODE_ID\", \"zone\": \"dc1\", \"capacity\": 1, \"tags\": [\"dev\"]}]" > /dev/null

# Apply the layout
LAYOUT_VERSION=$(curl -sf "$GARAGE_ADMIN_API/v1/layout" | python3 -c "import sys,json; print(json.load(sys.stdin)['version'] + 1)")
curl -sf -X POST "$GARAGE_ADMIN_API/v1/layout/apply" \
  -H "Content-Type: application/json" \
  -d "{\"version\": $LAYOUT_VERSION}" > /dev/null
echo "==> Layout applied."

# Create the bucket
echo "==> Creating bucket '$BUCKET_NAME'..."
BUCKET_RESULT=$(curl -sf -X POST "$GARAGE_ADMIN_API/v1/bucket" \
  -H "Content-Type: application/json" \
  -d "{\"globalAlias\": \"$BUCKET_NAME\"}")
BUCKET_ID=$(echo "$BUCKET_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "==> Bucket created: $BUCKET_ID"

# Allow public read access
echo "==> Setting bucket to allow public reads..."
curl -sf -X PUT "$GARAGE_ADMIN_API/v1/bucket?id=$BUCKET_ID" \
  -H "Content-Type: application/json" \
  -d '{"websiteAccess":{"enabled":true,"indexDocument":"index.html"}}' > /dev/null

# Create an API key
echo "==> Creating API key..."
KEY_RESULT=$(curl -sf -X POST "$GARAGE_ADMIN_API/v1/key" \
  -H "Content-Type: application/json" \
  -d '{"name": "giapha-app"}')
ACCESS_KEY=$(echo "$KEY_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessKeyId'])")
SECRET_KEY=$(echo "$KEY_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['secretAccessKey'])")
KEY_ID=$(echo "$KEY_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

# Grant the key access to the bucket
curl -sf -X POST "$GARAGE_ADMIN_API/v1/bucket/allow" \
  -H "Content-Type: application/json" \
  -d "{\"bucketId\": \"$BUCKET_ID\", \"accessKeyId\": \"$KEY_ID\", \"permissions\": {\"read\": true, \"write\": true, \"owner\": true}}" > /dev/null

echo ""
echo "========================================="
echo "  Garage setup complete!"
echo "========================================="
echo ""
echo "Add these to your .env file:"
echo ""
echo "  S3_ENDPOINT=http://localhost:3900"
echo "  S3_ACCESS_KEY=$ACCESS_KEY"
echo "  S3_SECRET_KEY=$SECRET_KEY"
echo "  S3_BUCKET=$BUCKET_NAME"
echo ""
