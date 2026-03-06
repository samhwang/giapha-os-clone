#!/usr/bin/env bash
set -euo pipefail

GARAGE_ADMIN_API="http://localhost:3903"
GARAGE_ADMIN_TOKEN=$(grep "^admin_token" .docker/garage/garage.toml | cut -d'=' -f2 | tr -d ' "')
BUCKET_NAME="${S3_BUCKET:-avatars}"
LAYOUT_CAPACITY="${GARAGE_LAYOUT_CAPACITY:-1073741824}"  # 1GB default
LAYOUT_TAG="${GARAGE_LAYOUT_TAG:-dev}"
KEY_NAME="${GARAGE_KEY_NAME:-giapha-app}"

echo "==> Waiting for Garage to be ready..."
until curl -sf "$GARAGE_ADMIN_API/health" > /dev/null 2>&1; do
  sleep 1
done
echo "==> Garage is ready."

STATUS_RESULT=$(curl -sf "$GARAGE_ADMIN_API/v1/status" \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN")
NODE_ID=$(echo "$STATUS_RESULT" | jq -r '.node')
if [ -z "$NODE_ID" ] || [ "$NODE_ID" = "null" ]; then
  echo "ERROR: Could not retrieve Garage node ID."
  exit 1
fi
echo "==> Node ID: $NODE_ID"

echo "==> Configuring node layout..."
curl -sf -X POST "$GARAGE_ADMIN_API/v1/layout" \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "[{\"id\": \"$NODE_ID\", \"zone\": \"dc1\", \"capacity\": $LAYOUT_CAPACITY, \"tags\": [\"$LAYOUT_TAG\"]}]" > /dev/null

LAYOUT_RESULT=$(curl -sf "$GARAGE_ADMIN_API/v1/layout" \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN")
LAYOUT_VERSION=$(echo "$LAYOUT_RESULT" | jq '.version + 1')
curl -sf -X POST "$GARAGE_ADMIN_API/v1/layout/apply" \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"version\": $LAYOUT_VERSION}" > /dev/null
echo "==> Layout applied."

echo "==> Creating bucket '$BUCKET_NAME'..."
BUCKET_RESULT=$(curl -sf -X POST "$GARAGE_ADMIN_API/v1/bucket" \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"globalAlias\": \"$BUCKET_NAME\"}")
BUCKET_ID=$(echo "$BUCKET_RESULT" | jq -r '.id')
echo "==> Bucket created: $BUCKET_ID"

echo "==> Setting bucket to allow public reads..."
curl -sf -X PUT "$GARAGE_ADMIN_API/v1/bucket?id=$BUCKET_ID" \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"websiteAccess":{"enabled":true,"indexDocument":"index.html"}}' > /dev/null

echo "==> Creating API key..."
KEY_RESULT=$(curl -sf -X POST "$GARAGE_ADMIN_API/v1/key" \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$KEY_NAME\"}")
ACCESS_KEY=$(echo "$KEY_RESULT" | jq -r '.accessKeyId')
SECRET_KEY=$(echo "$KEY_RESULT" | jq -r '.secretAccessKey')
KEY_ID=$(echo "$KEY_RESULT" | jq -r '.accessKeyId')

curl -sf -X POST "$GARAGE_ADMIN_API/v1/bucket/allow" \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
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
