# Android Setup Checker Script
Write-Host "`n=== Checking Android Setup ===`n" -ForegroundColor Green

# Check for Android SDK
$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    $androidHome = "$env:LOCALAPPDATA\Android\Sdk"
}

if (Test-Path $androidHome) {
    Write-Host "✅ Android SDK found at: $androidHome" -ForegroundColor Green
} else {
    Write-Host "❌ Android SDK not found" -ForegroundColor Red
    Write-Host "   Install Android Studio: https://developer.android.com/studio" -ForegroundColor Yellow
    exit 1
}

# Check for adb
$adbPath = Join-Path $androidHome "platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Write-Host "✅ ADB found" -ForegroundColor Green
} else {
    Write-Host "❌ ADB not found. Install Android SDK Platform-Tools" -ForegroundColor Red
}

# Check for running emulators
Write-Host "`nChecking for running emulators..." -ForegroundColor Cyan
$devices = & $adbPath devices 2>&1
if ($devices -match "emulator") {
    Write-Host "✅ Android emulator is running" -ForegroundColor Green
    Write-Host $devices
} else {
    Write-Host "⚠️  No emulator running" -ForegroundColor Yellow
    Write-Host "   Start an emulator from Android Studio Device Manager" -ForegroundColor Yellow
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Green
Write-Host "1. Make sure backend is running: cd ..\backend && npm run dev" -ForegroundColor Cyan
Write-Host "2. Start Expo: npm start" -ForegroundColor Cyan
Write-Host "3. Press 'a' to open in Android emulator" -ForegroundColor Cyan
Write-Host "`nAPI URL configured for emulator: http://10.0.2.2:3001/api" -ForegroundColor Yellow
Write-Host ""















