@echo off
setlocal enabledelayedexpansion

set GARAGE_ADMIN_API=http://localhost:3903

for /f "tokens=2 delims==" %%a in ('findstr /i "^admin_token" .docker\garage\garage.toml') do set GARAGE_ADMIN_TOKEN=%%a
set GARAGE_ADMIN_TOKEN=%GARAGE_ADMIN_TOKEN: =%
set GARAGE_ADMIN_TOKEN=%GARAGE_ADMIN_TOKEN:"=%

set BUCKET_NAME=%S3_BUCKET%
if "%BUCKET_NAME%"=="" set BUCKET_NAME=avatars

set LAYOUT_CAPACITY=%GARAGE_LAYOUT_CAPACITY%
if "%LAYOUT_CAPACITY%"=="" set LAYOUT_CAPACITY=1073741824

set LAYOUT_TAG=%GARAGE_LAYOUT_TAG%
if "%LAYOUT_TAG%"=="" set LAYOUT_TAG=dev

set KEY_NAME=%GARAGE_KEY_NAME%
if "%KEY_NAME%"=="" set KEY_NAME=giapha-app

echo ==> Waiting for Garage to be ready...
:wait_loop
curl -sf "%GARAGE_ADMIN_API%/health" >nul 2>&1
if errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto wait_loop
)
echo ==> Garage is ready.

echo ==> Getting node status...
for /f "delims=" %%r in ('curl -sf "%GARAGE_ADMIN_API%/v1/status" -H "Authorization: Bearer %GARAGE_ADMIN_TOKEN%"') do set STATUS_JSON=%%r

for /f "tokens=*" %%n in ('echo !STATUS_JSON! ^| jq -r ".node"') do set NODE_ID=%%n
if "%NODE_ID%"=="" (
    echo ERROR: Could not retrieve Garage node ID.
    exit /b 1
)
echo ==> Node ID: %NODE_ID%

echo ==> Configuring node layout...
curl -sf -X POST "%GARAGE_ADMIN_API%/v1/layout" -H "Authorization: Bearer %GARAGE_ADMIN_TOKEN%" -H "Content-Type: application/json" -d "[{\"id\": \"%NODE_ID%\", \"zone\": \"dc1\", \"capacity\": %LAYOUT_CAPACITY%, \"tags\": [\"%LAYOUT_TAG%\"]}]" >nul

for /f "delims=" %%r in ('curl -sf "%GARAGE_ADMIN_API%/v1/layout" -H "Authorization: Bearer %GARAGE_ADMIN_TOKEN%"') do set LAYOUT_JSON=%%r

for /f "tokens=*" %%v in ('echo !LAYOUT_JSON! ^| jq ".version + 1"') do set LAYOUT_VERSION=%%v
curl -sf -X POST "%GARAGE_ADMIN_API%/v1/layout/apply" -H "Authorization: Bearer %GARAGE_ADMIN_TOKEN%" -H "Content-Type: application/json" -d "{\"version\": %LAYOUT_VERSION%}" >nul
echo ==> Layout applied.

echo ==> Creating bucket '%BUCKET_NAME%'...
for /f "delims=" %%r in ('curl -sf -X POST "%GARAGE_ADMIN_API%/v1/bucket" -H "Authorization: Bearer %GARAGE_ADMIN_TOKEN%" -H "Content-Type: application/json" -d "{\"globalAlias\": \"%BUCKET_NAME%\"}"') do set BUCKET_JSON=%%r

for /f "tokens=*" %%b in ('echo !BUCKET_JSON! ^| jq -r ".id"') do set BUCKET_ID=%%b
echo ==> Bucket created: %BUCKET_ID%

echo ==> Setting bucket to allow public reads...
curl -sf -X PUT "%GARAGE_ADMIN_API%/v1/bucket?id=%BUCKET_ID%" -H "Authorization: Bearer %GARAGE_ADMIN_TOKEN%" -H "Content-Type: application/json" -d "{\"websiteAccess\":{\"enabled\":true,\"indexDocument\":\"index.html\"}}" >nul

echo ==> Creating API key...
for /f "delims=" %%r in ('curl -sf -X POST "%GARAGE_ADMIN_API%/v1/key" -H "Authorization: Bearer %GARAGE_ADMIN_TOKEN%" -H "Content-Type: application/json" -d "{\"name\": \"%KEY_NAME%\"}"') do set KEY_JSON=%%r

for /f "tokens=*" %%k in ('echo !KEY_JSON! ^| jq -r ".accessKeyId"') do set ACCESS_KEY=%%k
for /f "tokens=*" %%s in ('echo !KEY_JSON! ^| jq -r ".secretAccessKey"') do set SECRET_KEY=%%s

curl -sf -X POST "%GARAGE_ADMIN_API%/v1/bucket/allow" -H "Authorization: Bearer %GARAGE_ADMIN_TOKEN%" -H "Content-Type: application/json" -d "{\"bucketId\": \"%BUCKET_ID%\", \"accessKeyId\": \"%ACCESS_KEY%\", \"permissions\": {\"read\": true, \"write\": true, \"owner\": true}}" >nul

echo.
echo =========================================
echo   Garage setup complete!
echo =========================================
echo.
echo Add these to your .env file:
echo.
echo   S3_ENDPOINT=http://localhost:3900
echo   S3_ACCESS_KEY=%ACCESS_KEY%
echo   S3_SECRET_KEY=%SECRET_KEY%
echo   S3_BUCKET=%BUCKET_NAME%
echo.
