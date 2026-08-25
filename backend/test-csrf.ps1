# test-csrf.ps1
# Script to test CSRF flow on the backend API using curl

Write-Host "1. Fetching CSRF Token..."
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/csrf-token" -SessionVariable session
$json = $response.Content | ConvertFrom-Json
$csrfToken = $json.csrfToken

Write-Host "CSRF Token Retrieved: $csrfToken"
Write-Host "Session Cookie Extracted."

Write-Host "`n2. Attempting to register without CSRF token (should fail)..."
try {
    $failResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method Post -Body '{"fullName":"Hacker","email":"hacker@test.com","password":"password123","role":"STUDENT"}' -ContentType "application/json" -WebSession $session
} catch {
    Write-Host "Failed as expected! Status: $($_.Exception.Response.StatusCode)"
}

Write-Host "`n3. Attempting to register WITH CSRF token (should succeed)..."
$headers = @{
    "X-CSRF-Token" = $csrfToken
}
$body = '{"fullName":"Demo Student","email":"demo3@test.com","password":"password123","role":"STUDENT"}'

try {
    $successResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method Post -Headers $headers -Body $body -ContentType "application/json" -WebSession $session
    Write-Host "Success! Response:"
    Write-Host $successResponse.Content
} catch {
    Write-Host "Unexpected failure! Status: $($_.Exception.Response.StatusCode)"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response Body: $responseBody"
}
