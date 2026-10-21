#!/usr/bin/env bash
# Generate Android launcher icons + splash screens from a single 1024x1024 source image.
# Usage: tools/make-android-assets.sh <source-png> <android-res-dir>
set -euo pipefail

SRC="${1:?source png required}"
RES="${2:?res dir required}"
BG="#0D1627"        # adaptive icon background (sampled from source corner)
SPLASH_BG="#0D1627" # splash background (identical to the icon background = seamless)

echo "==> Generating launcher icons"
# density:legacy_size:foreground_size
while IFS=: read -r density legacy fg; do
  [ -z "$density" ] && continue
  dir="$RES/mipmap-$density"
  mkdir -p "$dir"

  # Legacy square icon with rounded corners
  convert "$SRC" -resize "${legacy}x${legacy}" \
    \( -size "${legacy}x${legacy}" xc:none -draw "roundrectangle 0,0,$((legacy-1)),$((legacy-1)),$((legacy/5)),$((legacy/5))" \) \
    -alpha set -compose DstIn -composite "$dir/ic_launcher.png"

  # Legacy round icon
  convert "$SRC" -resize "${legacy}x${legacy}" \
    \( -size "${legacy}x${legacy}" xc:none -draw "circle $((legacy/2)),$((legacy/2)) $((legacy/2)),0" \) \
    -alpha set -compose DstIn -composite "$dir/ic_launcher_round.png"

  # Adaptive icon foreground (full bleed; logo stays inside the 66% safe zone)
  convert "$SRC" -resize "${fg}x${fg}" "$dir/ic_launcher_foreground.png"

  echo "    mipmap-$density  legacy=${legacy}px  foreground=${fg}px"
done <<'EOF'
mdpi:48:108
hdpi:72:162
xhdpi:96:216
xxhdpi:144:324
xxxhdpi:192:432
EOF

echo "==> Generating splash screens"
make_splash() {
  local out="$1" w="$2" h="$3"
  local logo
  logo=$(( h < w ? h / 3 : w / 3 ))
  local title
  title=$(( w / 22 ))
  convert -size "${w}x${h}" "xc:${SPLASH_BG}" \
    \( "$SRC" -resize "${logo}x${logo}" \) -gravity center -geometry "+0-$(($logo/4))" -composite \
    -gravity center -fill "#F59E0B" -font DejaVu-Sans-Bold -pointsize "$title" \
    -annotate "+0+$(($logo*3/4))" "GAME ARCADE HUB" \
    "$out"
}

while IFS=: read -r dir w h; do
  [ -z "$dir" ] && continue
  mkdir -p "$RES/$dir"
  make_splash "$RES/$dir/splash.png" "$w" "$h"
  echo "    $dir/splash.png  ${w}x${h}"
done <<'EOF'
drawable-port-mdpi:320:480
drawable-port-hdpi:480:800
drawable-port-xhdpi:720:1280
drawable-port-xxhdpi:960:1600
drawable-port-xxxhdpi:1280:1920
drawable-land-mdpi:480:320
drawable-land-hdpi:800:480
drawable-land-xhdpi:1280:720
drawable-land-xxhdpi:1600:960
drawable-land-xxxhdpi:1920:1280
EOF

mkdir -p "$RES/drawable"
make_splash "$RES/drawable/splash.png" 800 480
echo "    drawable/splash.png  800x480"

echo "==> Done"
