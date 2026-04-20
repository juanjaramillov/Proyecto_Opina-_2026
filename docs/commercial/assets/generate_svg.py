import os
import base64

svg_path = "/Users/juanignaciojaramillo/Desktop/Opina+/Antigravity - Proyecto/Opina+ V15/docs/commercial/assets/Social_Visual_Fragilidad_v2.svg"
png_path = "/Users/juanignaciojaramillo/Desktop/Opina+/Antigravity - Proyecto/Opina+ V15/figma_assets/logos/opina_logo.png"

with open(png_path, "rb") as f:
    b64_logo = base64.b64encode(f.read()).decode("utf-8")

svg_template = f"""<svg width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;800&amp;display=swap');
    text {{
      font-family: 'Inter', -apple-system, sans-serif;
    }}
  </style>

  <defs>
    <!-- Light Mode Background Noise -->
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
    </filter>

    <!-- Structural Emerald Glow -->
    <filter id="emeraldGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Clean Minimal Background -->
  <rect width="1080" height="1350" fill="#F8FAFC" />
  <rect width="1080" height="1350" filter="url(#noiseFilter)" opacity="0.03" />

  <!-- Technical Floor Grid (Metrics illusion) -->
  <g transform="translate(540, 680) scale(1, 0.5) rotate(45)">
    <rect x="-400" y="-400" width="800" height="800" fill="none" stroke="#E2E8F0" stroke-width="2" />
    <g fill="none" stroke="#F1F5F9" stroke-width="1.5">
      <!-- Grid lines -->
      <line x1="-300" y1="-400" x2="-300" y2="400" />
      <line x1="-200" y1="-400" x2="-200" y2="400" />
      <line x1="-100" y1="-400" x2="-100" y2="400" />
      <line x1="0" y1="-400" x2="0" y2="400" />
      <line x1="100" y1="-400" x2="100" y2="400" />
      <line x1="200" y1="-400" x2="200" y2="400" />
      <line x1="300" y1="-400" x2="300" y2="400" />
      <line y1="-300" x1="-400" y2="-300" x2="400" />
      <line y1="-200" x1="-400" y2="-200" x2="400" />
      <line y1="-100" x1="-400" y2="-100" x2="400" />
      <line y1="0" x1="-400" y2="0" x2="400" />
      <line y1="100" x1="-400" y2="100" x2="400" />
      <line y1="200" x1="-400" y2="200" x2="400" />
      <line y1="300" x1="-400" y2="300" x2="400" />
    </g>
  </g>

  <!-- Untouched Logo (Top Left) -->
  <image x="100" y="80" width="80" height="80" href="data:image/png;base64,{b64_logo}" />

  <!-- Illustration Group (Center) -->
  <g transform="translate(140, 160)">

    <!-- Bar 1 (Left Minor) -->
    <polygon points="240,570 200,550 200,470 240,490" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.5" />
    <polygon points="240,570 280,550 280,470 240,490" fill="#94A3B8" stroke="#64748B" stroke-width="1.5" />
    <polygon points="240,490 200,470 240,450 280,470" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" />

    <!-- Bar 3 (Right Minor) -->
    <polygon points="560,570 520,550 520,430 560,450" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.5" />
    <polygon points="560,570 600,550 600,430 560,450" fill="#94A3B8" stroke="#64748B" stroke-width="1.5" />
    <polygon points="560,450 520,430 560,410 600,430" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" />


    <!-- Bar 2 (Center - High Preference) The Broken Giant -->
    <!-- Bottom Stump -->
    <polygon points="400,650 330,615 330,455 400,490" fill="#2563EB" stroke="#1E40AF" stroke-width="1.5"/>
    <polygon points="400,650 470,615 470,455 400,490" fill="#1E40AF" stroke="#1E3A8A" stroke-width="1.5"/>
    <polygon points="400,490 330,455 400,420 470,455" fill="#3B82F6" stroke="#2563EB" stroke-width="1.5"/>

    <!-- Glowing Core (Internal Fragility) -->
    <line x1="400" y1="490" x2="415" y2="465" stroke="#10B981" stroke-width="12" filter="url(#emeraldGlow)"/>
    <line x1="400" y1="490" x2="415" y2="465" stroke="#34D399" stroke-width="4"/>

    <!-- Snapping tension wires from core -->
    <path d="M 400 480 Q 380 460 370 470" fill="none" stroke="#10B981" stroke-width="3" filter="url(#emeraldGlow)"/>
    <circle cx="370" cy="470" r="3" fill="#10B981" filter="url(#emeraldGlow)"/>
    <path d="M 405 470 Q 420 480 435 465" fill="none" stroke="#2563EB" stroke-width="2" filter="url(#emeraldGlow)"/>
    <circle cx="435" cy="465" r="2" fill="#2563EB" filter="url(#emeraldGlow)"/>
    
    <!-- Data dust from crack -->
    <circle cx="415" cy="450" r="2.5" fill="#10B981" filter="url(#emeraldGlow)"/>
    <circle cx="390" cy="465" r="1.5" fill="#34D399" filter="url(#emeraldGlow)"/>
    <rect x="420" y="480" width="3" height="3" fill="#2563EB" transform="rotate(15 420 480)" filter="url(#emeraldGlow)"/>

    <!-- Middle Fragment (Slipped out) -->
    <g transform="translate(-40, 20)">
      <polygon points="400,490 330,455 330,415 400,450" fill="#2563EB" stroke="#1E40AF" stroke-width="1.5"/>
      <polygon points="400,490 470,455 470,415 400,450" fill="#1E40AF" stroke="#1E3A8A" stroke-width="1.5"/>
      <polygon points="400,450 330,415 400,380 470,415" fill="#3B82F6" stroke="#2563EB" stroke-width="1.5"/>
    </g>

    <!-- Top Mass (Towering and Toppling) -->
    <!-- Leaning by rotating around its base point (430, 475) -->
    <g transform="rotate(7, 430, 475) translate(30, -15)">
      <polygon points="400,490 330,455 330,205 400,240" fill="#2563EB" stroke="#1E40AF" stroke-width="1.5"/>
      <polygon points="400,490 470,455 470,205 400,240" fill="#1E40AF" stroke="#1E3A8A" stroke-width="1.5"/>
      <polygon points="400,240 330,205 400,170 470,205" fill="#3B82F6" stroke="#2563EB" stroke-width="1.5"/>
      <!-- Grid accent lines on the toppling tower -->
      <line x1="365" y1="472.5" x2="365" y2="222.5" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
      <line x1="435" y1="472.5" x2="435" y2="222.5" stroke="rgba(255,255,255,0.05)" stroke-width="1.5"/>
    </g>

  </g>

  <!-- HEADLINE TEXT -->
  <text x="100" y="960" font-size="64" font-weight="800" fill="#0F172A" letter-spacing="-1.5">UNA PREFERENCIA ALTA</text>
  <text x="100" y="1030" font-size="64" font-weight="800" fill="#0F172A" letter-spacing="-1.5">NO SIEMPRE ES</text>
  <text x="100" y="1100" font-size="64" font-weight="800" fill="#10B981" letter-spacing="-1.5">DEFENDIBLE.</text>

  <!-- SUPPORTING TEXT -->
  <text x="100" y="1170" font-size="30" font-weight="400" fill="#64748B" letter-spacing="-0.3">Las métricas tradicionales pueden mostrar liderazgo,</text>
  <text x="100" y="1215" font-size="30" font-weight="400" fill="#64748B" letter-spacing="-0.3">pero no revelan su <tspan fill="#10B981" font-weight="500">fragilidad</tspan>.</text>

  <!-- FOOTER -->
  <line x1="100" y1="1260" x2="980" y2="1260" stroke="#E2E8F0" stroke-width="2" />
  <text x="100" y="1300" font-size="24" font-weight="500" fill="#94A3B8">Tu opinión es una señal.</text>
  <text x="980" y="1300" font-size="24" font-weight="500" fill="#94A3B8" text-anchor="end">www.opinamas.app</text>

</svg>"""

with open(svg_path, "w") as f:
    f.write(svg_template)
