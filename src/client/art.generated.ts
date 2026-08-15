// Privacy-safe public placeholder art.
//
// These vectors are intentionally original, neutral, and generated in code.
// They contain no user assets, conversation history, screenshots, or artwork
// copied from the private development installation. Users can replace every
// character portrait and the scene background from the Galgame interface.

function svgData(markup: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markup)}`
}

function characterPlaceholder(label: string, accent: string, halo: string): string {
  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280" role="img" aria-label="${label} neutral placeholder">
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accent}" stop-opacity=".92"/>
      <stop offset="1" stop-color="#071725" stop-opacity=".98"/>
    </linearGradient>
    <radialGradient id="aura">
      <stop offset="0" stop-color="${halo}" stop-opacity=".34"/>
      <stop offset="1" stop-color="${halo}" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>
  <ellipse cx="360" cy="605" rx="330" ry="480" fill="url(#aura)"/>
  <circle cx="360" cy="248" r="112" fill="url(#body)" stroke="${halo}" stroke-width="5"/>
  <path d="M282 254c24-52 132-52 156 0M317 287c28 18 58 18 86 0" fill="none" stroke="#dff8ff" stroke-opacity=".72" stroke-width="8" stroke-linecap="round"/>
  <circle cx="325" cy="246" r="8" fill="#dff8ff"/><circle cx="395" cy="246" r="8" fill="#dff8ff"/>
  <path d="M274 358Q360 315 446 358L505 878Q454 1012 360 1128Q266 1012 215 878Z" fill="url(#body)" stroke="${halo}" stroke-width="5"/>
  <path d="M276 404L126 760M444 404L594 760" fill="none" stroke="${accent}" stroke-width="54" stroke-linecap="round"/>
  <path d="M298 1110L276 1240M422 1110L444 1240" fill="none" stroke="#0d2b40" stroke-width="54" stroke-linecap="round"/>
  <path d="M256 545H464M250 814H470" stroke="${halo}" stroke-opacity=".42" stroke-width="4" stroke-dasharray="12 14"/>
  <circle cx="360" cy="592" r="72" fill="none" stroke="${halo}" stroke-width="3" opacity=".54"/>
  <circle cx="360" cy="592" r="46" fill="none" stroke="${halo}" stroke-width="3" opacity=".38"/>
  <circle cx="360" cy="592" r="15" fill="${halo}" opacity=".8" filter="url(#glow)"/>
  <text x="360" y="700" fill="#e8fbff" fill-opacity=".88" font-family="ui-sans-serif,system-ui,sans-serif" font-size="31" letter-spacing="5" text-anchor="middle">${label}</text>
  <text x="360" y="742" fill="#9bcbd8" fill-opacity=".7" font-family="ui-sans-serif,system-ui,sans-serif" font-size="17" letter-spacing="3" text-anchor="middle">PUBLIC PLACEHOLDER</text>
</svg>`)
}

function whalePlaceholder(mood: string, accent: string, mouth: string): string {
  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280" role="img" aria-label="Whale companion ${mood} placeholder">
  <defs>
    <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent}"/><stop offset="1" stop-color="#081a2a"/></linearGradient>
    <radialGradient id="halo"><stop stop-color="${accent}" stop-opacity=".36"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="360" cy="640" rx="335" ry="520" fill="url(#halo)"/>
  <path d="M226 346Q360 228 494 346L540 882Q450 1092 360 1172Q270 1092 180 882Z" fill="url(#sea)" stroke="#bfefff" stroke-opacity=".55" stroke-width="5"/>
  <path d="M235 340Q270 190 360 180Q450 190 485 340Q430 300 360 300Q290 300 235 340Z" fill="#0d3450" stroke="${accent}" stroke-width="5"/>
  <path d="M210 425L92 790M510 425L628 790" fill="none" stroke="${accent}" stroke-width="48" stroke-linecap="round"/>
  <ellipse cx="360" cy="452" rx="118" ry="98" fill="#dff8ff" fill-opacity=".12" stroke="#dff8ff" stroke-opacity=".42" stroke-width="4"/>
  <circle cx="320" cy="438" r="10" fill="#eaffff"/><circle cx="400" cy="438" r="10" fill="#eaffff"/>
  <path d="${mouth}" fill="none" stroke="#eaffff" stroke-width="7" stroke-linecap="round"/>
  <path d="M300 610Q360 570 420 610L448 900Q400 1006 360 1055Q320 1006 272 900Z" fill="#071824" fill-opacity=".46" stroke="#bfefff" stroke-opacity=".34" stroke-width="4"/>
  <path d="M300 775Q360 725 420 775" fill="none" stroke="${accent}" stroke-opacity=".76" stroke-width="5"/>
  <text x="360" y="1120" fill="#e8fbff" font-family="ui-sans-serif,system-ui,sans-serif" font-size="25" letter-spacing="5" text-anchor="middle">${mood.toUpperCase()}</text>
</svg>`)
}

function nightBackground(): string {
  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" role="img" aria-label="Abstract night background placeholder">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#020b15"/><stop offset=".58" stop-color="#09273d"/><stop offset="1" stop-color="#06131e"/></linearGradient>
    <radialGradient id="signal"><stop stop-color="#78ddec" stop-opacity=".3"/><stop offset="1" stop-color="#78ddec" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="96" height="96" patternUnits="userSpaceOnUse"><path d="M96 0H0V96" fill="none" stroke="#8fd8ef" stroke-opacity=".08"/></pattern>
  </defs>
  <rect width="1920" height="1080" fill="url(#sky)"/><rect width="1920" height="1080" fill="url(#grid)"/>
  <ellipse cx="960" cy="660" rx="790" ry="530" fill="url(#signal)"/>
  <path d="M0 840Q290 760 540 850T1030 820T1470 842T1920 790V1080H0Z" fill="#041019"/>
  <path d="M0 872Q300 790 560 880T1050 852T1500 875T1920 826" fill="none" stroke="#78ddec" stroke-opacity=".24" stroke-width="3"/>
  <g fill="#d9fbff"><circle cx="252" cy="168" r="2"/><circle cx="438" cy="294" r="3"/><circle cx="762" cy="128" r="2"/><circle cx="1128" cy="238" r="2"/><circle cx="1394" cy="134" r="3"/><circle cx="1688" cy="316" r="2"/></g>
  <text x="960" y="535" fill="#dffaff" fill-opacity=".7" font-family="ui-sans-serif,system-ui,sans-serif" font-size="32" letter-spacing="14" text-anchor="middle">GALGAME SIGNAL SPACE</text>
  <text x="960" y="582" fill="#8fd8ef" fill-opacity=".48" font-family="ui-sans-serif,system-ui,sans-serif" font-size="17" letter-spacing="5" text-anchor="middle">UPLOAD YOUR OWN BACKGROUND</text>
</svg>`)
}

function petSpriteSheet(): string {
  const frames: string[] = []
  for (let row = 0; row < 11; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const x = col * 192
      const y = row * 208
      const bob = (col % 3) * 2
      frames.push(`<g transform="translate(${x} ${y + bob})">
        <ellipse cx="96" cy="118" rx="72" ry="54" fill="#0e4666" stroke="#9be7f2" stroke-width="4"/>
        <path d="M45 105Q16 79 12 121Q25 137 49 126M147 105Q176 79 180 121Q167 137 143 126" fill="#176487" stroke="#9be7f2" stroke-width="4"/>
        <path d="M76 79Q96 62 116 79" fill="none" stroke="#dffbff" stroke-width="4" stroke-linecap="round"/>
        <circle cx="76" cy="110" r="5" fill="#eaffff"/><circle cx="116" cy="110" r="5" fill="#eaffff"/>
        <path d="M86 128Q96 ${134 + (col % 2) * 4} 106 128" fill="none" stroke="#eaffff" stroke-width="4" stroke-linecap="round"/>
        <path d="M96 63V38M96 38Q82 25 73 40M96 38Q110 25 119 40" fill="none" stroke="#78ddec" stroke-width="4" stroke-linecap="round"/>
      </g>`)
    }
  }
  return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 2288" role="img" aria-label="Neutral whale desktop pet sprite sheet">${frames.join('')}</svg>`)
}

export const WHALE_ART: Record<string, string> = {
  'pet-spritesheet': petSpriteSheet(),
  'maid-left': characterPlaceholder('WHALE', '#247da3', '#8fe8f3'),
  'whale-cheerful': whalePlaceholder('cheerful', '#2c9bb6', 'M320 478Q360 516 400 478'),
  'whale-shy': whalePlaceholder('shy', '#8f6eaa', 'M332 486Q360 500 388 486'),
  'whale-serious': whalePlaceholder('serious', '#407a9e', 'M330 488H390'),
  'whale-confused': whalePlaceholder('confused', '#537aa8', 'M330 492Q360 468 390 492'),
  'whale-angry': whalePlaceholder('angry', '#9d4f58', 'M330 500Q360 470 390 500'),
  'whale-frightened': whalePlaceholder('frightened', '#675f9f', 'M345 486Q360 466 375 486Q360 508 345 486'),
  'whale-exasperated': whalePlaceholder('exasperated', '#667887', 'M330 490Q360 496 390 490'),
  'whale-starry': whalePlaceholder('starry', '#487fc5', 'M320 478Q360 516 400 478'),
  'palace-night': nightBackground(),
  'claude-amber-manuscript-mediator-v5': characterPlaceholder('CLAUDE', '#a87446', '#f3c984'),
  'gemini-dual-prism-translator-v4': characterPlaceholder('GEMINI', '#4d7fc2', '#9ad8ff'),
  'gpt-recursive-weaver-v7': characterPlaceholder('GPT', '#308b76', '#98efcf'),
  'grok-cosmic-signal-ranger-v5': characterPlaceholder('GROK', '#745b9c', '#cbb2ff'),
  'kimi-lunar-scroll-navigator-v5': characterPlaceholder('KIMI', '#65738b', '#c9d7f2'),
}
