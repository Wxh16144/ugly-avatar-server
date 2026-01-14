# Source: https://github.com/Wxh16144/ugly-avatar-server

.SYNOPSIS
    Ugly Avatar CLI Helper

.DESCRIPTION
    Downloads an ugly avatar from the server.

.EXAMPLE
    ugly
    Downloads a random png avatar.

.EXAMPLE
    ugly -id "my-avatar"
    Downloads specific avatar.

function ugly {
    param(
        [string]$id,
        [int]$size = 512,
        [string]$format = "png",
        [string]$bg = $null
    )

    # Endpoint (env override)
    $endpoint = if ($env:UGLY_AVATAR_URL) { $env:UGLY_AVATAR_URL } else { "http://localhost:3000" }
    # Allow background color from env if not passed as parameter
    if (-not $bg -and $env:UGLY_AVATAR_BG) { $bg = $env:UGLY_AVATAR_BG }

    if (-not $id) {
        # Generate random hex string (8 chars)
        $id = -join ((48..57) + (97..102) | Get-Random -Count 8 | % {[char]$_})
    }

    $file = "$id.$format"
    $url = "$endpoint/$id.$format?s=$size"
    if ($bg) { $url += "&bg=$bg" }

    Write-Host "Downloading $url..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $file -UseBasicParsing
        Write-Host "Saved to $file" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to download avatar: $_"
    }
}
