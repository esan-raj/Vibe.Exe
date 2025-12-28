# USB Tethering Setup Helper
Write-Host "`n=== USB Tethering Setup ===`n" -ForegroundColor Green

Write-Host "Step 1: Enable USB Tethering on your phone" -ForegroundColor Cyan
Write-Host "  Android: Settings → Network → Hotspot & Tethering → USB Tethering" -ForegroundColor Yellow
Write-Host "  iPhone: Settings → Personal Hotspot → Enable" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Have you enabled USB tethering? (y/n)"
if ($response -ne "y" -and $response -ne "Y") {
    Write-Host "Please enable USB tethering first, then run this script again." -ForegroundColor Red
    exit
}

Write-Host "`nChecking network adapters..." -ForegroundColor Cyan
$adapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" 
} | Select-Object IPAddress, InterfaceAlias

if ($adapters) {
    Write-Host "`nFound IP addresses:" -ForegroundColor Green
    $i = 1
    $ipList = @()
    foreach ($adapter in $adapters) {
        Write-Host "  $i. $($adapter.IPAddress) - $($adapter.InterfaceAlias)" -ForegroundColor White
        $ipList += $adapter.IPAddress
        $i++
    }
    
    Write-Host "`nUSB Tethering IP is usually 192.168.x.x" -ForegroundColor Yellow
    $selectedIp = Read-Host "`nEnter the IP address to use (or press Enter for first one)"
    
    if ([string]::IsNullOrWhiteSpace($selectedIp)) {
        $selectedIp = $ipList[0]
    }
    
    $apiUrl = "http://$selectedIp:3001/api"
    Write-Host "`nAPI URL will be: $apiUrl" -ForegroundColor Green
    
    # Create or update .env file
    $envContent = @"
# USB Tethering Configuration
EXPO_PUBLIC_API_URL=$apiUrl

# Expo Project ID (for push notifications)
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding utf8 -Force
    Write-Host "`n✅ Updated .env file with API URL: $apiUrl" -ForegroundColor Green
    
    Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
    Write-Host "1. Make sure backend is running: cd ..\backend && npm run dev" -ForegroundColor White
    Write-Host "2. Start Expo: npm start" -ForegroundColor White
    Write-Host "3. Scan QR code with Expo Go app on your phone" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "No network adapters found. Make sure USB tethering is enabled." -ForegroundColor Red
}











