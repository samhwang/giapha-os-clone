#Requires -Version 5.1

$ErrorActionPreference = 'Stop'

$GarageAdminApi = "http://localhost:3903"

$tomlContent = Get-Content ".docker\garage\garage.toml" -Raw
if ($tomlContent -match 'admin_token\s*=\s*"([^"]+)"') {
    $GarageAdminToken = $matches[1]
} else {
    Write-Error "Could not find admin_token in .docker\garage\garage.toml"
    exit 1
}

$BucketName = if ($env:S3_BUCKET) { $env:S3_BUCKET } else { "avatars" }
$LayoutCapacity = if ($env:GARAGE_LAYOUT_CAPACITY) { $env:GARAGE_LAYOUT_CAPACITY } else { 1073741824 }
$LayoutTag = if ($env:GARAGE_LAYOUT_TAG) { $env:GARAGE_LAYOUT_TAG } else { "dev" }
$KeyName = if ($env:GARAGE_KEY_NAME) { $env:GARAGE_KEY_NAME } else { "giapha-app" }

Write-Host "==> Waiting for Garage to be ready..."
$maxRetries = 30
$retryCount = 0
while ($true) {
    try {
        $null = Invoke-RestMethod -Uri "$GarageAdminApi/health" -Method Get -ErrorAction Stop
        break
    } catch {
        $retryCount++
        if ($retryCount -ge $maxRetries) {
            Write-Error "Garage did not become ready after $maxRetries seconds"
            exit 1
        }
        Start-Sleep -Seconds 1
    }
}
Write-Host "==> Garage is ready."

$headers = @{
    "Authorization" = "Bearer $GarageAdminToken"
}

Write-Host "==> Getting node status..."
$statusResponse = Invoke-RestMethod -Uri "$GarageAdminApi/v1/status" -Method Get -Headers $headers
$nodeId = $statusResponse.node
if (-not $nodeId) {
    Write-Error "Could not retrieve Garage node ID."
    exit 1
}
Write-Host "==> Node ID: $nodeId"

Write-Host "==> Configuring node layout..."
$layoutBody = @(
    @{
        id = $nodeId
        zone = "dc1"
        capacity = [int64]$LayoutCapacity
        tags = @($LayoutTag)
    }
) | ConvertTo-Json -Depth 3
$null = Invoke-RestMethod -Uri "$GarageAdminApi/v1/layout" -Method Post -Headers $headers -ContentType "application/json" -Body $layoutBody

$layoutResponse = Invoke-RestMethod -Uri "$GarageAdminApi/v1/layout" -Method Get -Headers $headers
$layoutVersion = $layoutResponse.version + 1
$applyBody = @{ version = $layoutVersion } | ConvertTo-Json
$null = Invoke-RestMethod -Uri "$GarageAdminApi/v1/layout/apply" -Method Post -Headers $headers -ContentType "application/json" -Body $applyBody
Write-Host "==> Layout applied."

Write-Host "==> Creating bucket '$BucketName'..."
$bucketBody = @{ globalAlias = $BucketName } | ConvertTo-Json
$bucketResponse = Invoke-RestMethod -Uri "$GarageAdminApi/v1/bucket" -Method Post -Headers $headers -ContentType "application/json" -Body $bucketBody
$bucketId = $bucketResponse.id
Write-Host "==> Bucket created: $bucketId"

Write-Host "==> Setting bucket to allow public reads..."
$websiteBody = @{
    websiteAccess = @{
        enabled = $true
        indexDocument = "index.html"
    }
} | ConvertTo-Json
$null = Invoke-RestMethod -Uri "$GarageAdminApi/v1/bucket?id=$bucketId" -Method Put -Headers $headers -ContentType "application/json" -Body $websiteBody

Write-Host "==> Creating API key..."
$keyBody = @{ name = $KeyName } | ConvertTo-Json
$keyResponse = Invoke-RestMethod -Uri "$GarageAdminApi/v1/key" -Method Post -Headers $headers -ContentType "application/json" -Body $keyBody
$accessKey = $keyResponse.accessKeyId
$secretKey = $keyResponse.secretAccessKey

$allowBody = @{
    bucketId = $bucketId
    accessKeyId = $accessKey
    permissions = @{
        read = $true
        write = $true
        owner = $true
    }
} | ConvertTo-Json -Depth 3
$null = Invoke-RestMethod -Uri "$GarageAdminApi/v1/bucket/allow" -Method Post -Headers $headers -ContentType "application/json" -Body $allowBody

Write-Host ""
Write-Host "========================================="
Write-Host "  Garage setup complete!"
Write-Host "========================================="
Write-Host ""
Write-Host "Add these to your .env file:"
Write-Host ""
Write-Host "  S3_ENDPOINT=http://localhost:3900"
Write-Host "  S3_ACCESS_KEY=$accessKey"
Write-Host "  S3_SECRET_KEY=$secretKey"
Write-Host "  S3_BUCKET=$BucketName"
Write-Host ""
