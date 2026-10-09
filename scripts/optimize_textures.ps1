Add-Type -AssemblyName System.Drawing

function Optimize-Image {
    param (
        [string]$Path,
        [int]$MaxWidth,
        [int]$Quality = 85
    )

    $tempFile = [System.IO.Path]::GetTempFileName()
    try {
        $bytes = [System.IO.File]::ReadAllBytes($Path)
        $ms = New-Object System.IO.MemoryStream(,$bytes)
        $original = [System.Drawing.Image]::FromStream($ms)

        $origW = $original.Width
        $origH = $original.Height

        if ($origW -gt $MaxWidth) {
            $newW = $MaxWidth
            $newH = [int]($origH * ($MaxWidth / $origW))

            $bitmap = New-Object System.Drawing.Bitmap($newW, $newH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

            $destRect = New-Object System.Drawing.Rectangle(0, 0, $newW, $newH)
            $graphics.DrawImage($original, $destRect, 0, 0, $origW, $origH, [System.Drawing.GraphicsUnit]::Pixel)
            $graphics.Dispose()
            $original.Dispose()
            $ms.Dispose()

            # Encoder parameters for quality
            $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)

            $bitmap.Save($tempFile, $jpegCodec, $encoderParams)
            $bitmap.Dispose()
            $encoderParams.Dispose()

            # Copy temp file back to original
            [System.IO.File]::Copy($tempFile, $Path, $true)
            [System.IO.File]::Delete($tempFile)

            $newSize = (Get-Item $Path).Length
            Write-Host "Optimized $($Path): ${origW}x${origH} -> ${newW}x${newH} ($([math]::Round($newSize/1024)) KB)"
        } else {
            $original.Dispose()
            $ms.Dispose()
            if (Test-Path $tempFile) { [System.IO.File]::Delete($tempFile) }
            Write-Host "Skipped (already <= $MaxWidth px): $($Path)"
        }
    } catch {
        Write-Warning "Failed to optimize $($Path): $_"
        if (Test-Path $tempFile) { [System.IO.File]::Delete($tempFile) }
    }
}

# 1. Exhibition images (30 hero works): optimize to 1280px at Q78 for instant mobile delivery
$exhibitionDir = "C:\Users\SARVESH\Desktop\Gopal Lahoti\public\assets\exhibition"
if (Test-Path $exhibitionDir) {
    Get-ChildItem -Path $exhibitionDir -Filter "*.jpg" | ForEach-Object {
        Optimize-Image -Path $_.FullName -MaxWidth 1280 -Quality 78
    }
}

# 2. Hallway murals (24 side murals): optimize to 1080px at Q76 for instant mobile delivery
$muralDir = "C:\Users\SARVESH\Desktop\Gopal Lahoti\public\assets\hallway_murals"
if (Test-Path $muralDir) {
    Get-ChildItem -Path $muralDir -Filter "*.jpg" | ForEach-Object {
        Optimize-Image -Path $_.FullName -MaxWidth 1080 -Quality 76
    }
}

Write-Host "All textures successfully optimized for ultra-fast mobile delivery!"
