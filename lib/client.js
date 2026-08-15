window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-whale-galgame",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		let react_dom_client = require("react-dom/client");
		//#region src/client/art.generated.ts
		function svgData(markup) {
			return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markup)}`;
		}
		function characterPlaceholder(label, accent, halo) {
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
</svg>`);
		}
		function whalePlaceholder(mood, accent, mouth) {
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
</svg>`);
		}
		function nightBackground() {
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
</svg>`);
		}
		function petSpriteSheet() {
			const frames = [];
			for (let row = 0; row < 11; row += 1) for (let col = 0; col < 8; col += 1) {
				const x = col * 192;
				const y = row * 208;
				const bob = col % 3 * 2;
				frames.push(`<g transform="translate(${x} ${y + bob})">
        <ellipse cx="96" cy="118" rx="72" ry="54" fill="#0e4666" stroke="#9be7f2" stroke-width="4"/>
        <path d="M45 105Q16 79 12 121Q25 137 49 126M147 105Q176 79 180 121Q167 137 143 126" fill="#176487" stroke="#9be7f2" stroke-width="4"/>
        <path d="M76 79Q96 62 116 79" fill="none" stroke="#dffbff" stroke-width="4" stroke-linecap="round"/>
        <circle cx="76" cy="110" r="5" fill="#eaffff"/><circle cx="116" cy="110" r="5" fill="#eaffff"/>
        <path d="M86 128Q96 ${134 + col % 2 * 4} 106 128" fill="none" stroke="#eaffff" stroke-width="4" stroke-linecap="round"/>
        <path d="M96 63V38M96 38Q82 25 73 40M96 38Q110 25 119 40" fill="none" stroke="#78ddec" stroke-width="4" stroke-linecap="round"/>
      </g>`);
			}
			return svgData(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 2288" role="img" aria-label="Neutral whale desktop pet sprite sheet">${frames.join("")}</svg>`);
		}
		const WHALE_ART = {
			"pet-spritesheet": petSpriteSheet(),
			"maid-left": characterPlaceholder("WHALE", "#247da3", "#8fe8f3"),
			"whale-cheerful": whalePlaceholder("cheerful", "#2c9bb6", "M320 478Q360 516 400 478"),
			"whale-shy": whalePlaceholder("shy", "#8f6eaa", "M332 486Q360 500 388 486"),
			"whale-serious": whalePlaceholder("serious", "#407a9e", "M330 488H390"),
			"whale-confused": whalePlaceholder("confused", "#537aa8", "M330 492Q360 468 390 492"),
			"whale-angry": whalePlaceholder("angry", "#9d4f58", "M330 500Q360 470 390 500"),
			"whale-frightened": whalePlaceholder("frightened", "#675f9f", "M345 486Q360 466 375 486Q360 508 345 486"),
			"whale-exasperated": whalePlaceholder("exasperated", "#667887", "M330 490Q360 496 390 490"),
			"whale-starry": whalePlaceholder("starry", "#487fc5", "M320 478Q360 516 400 478"),
			"palace-night": nightBackground(),
			"claude-amber-manuscript-mediator-v5": characterPlaceholder("CLAUDE", "#a87446", "#f3c984"),
			"gemini-dual-prism-translator-v4": characterPlaceholder("GEMINI", "#4d7fc2", "#9ad8ff"),
			"gpt-recursive-weaver-v7": characterPlaceholder("GPT", "#308b76", "#98efcf"),
			"grok-cosmic-signal-ranger-v5": characterPlaceholder("GROK", "#745b9c", "#cbb2ff"),
			"kimi-lunar-scroll-navigator-v5": characterPlaceholder("KIMI", "#65738b", "#c9d7f2")
		};
		//#endregion
		//#region src/client/index.ts
		/**
		* dsh-whale-galgame — browser client half.
		* Q版桌宠 is the default form on the main UI; clicking it opens the
		* fullscreen one-line-per-screen visual novel. The heroine follows the
		* main UI's current model; three dialogue options are generated after
		* every reply; level-up CG rewards pop as modals and may be saved inside
		* the galgame scene without changing the workspace background.
		*/
		const CSS = [
			".whg-pet{--whg-scale:1.15;--whg-y:0px;position:fixed;right:18px;bottom:124px;width:calc(192px * var(--whg-scale));height:calc(208px * var(--whg-scale));padding:0;border:0;border-radius:18px;background:transparent;cursor:zoom-in;filter:drop-shadow(0 10px 16px rgb(0 0 0 / 36%));transition:width 180ms ease,height 180ms ease,filter 180ms ease;z-index:9999}",
			".whg-pet[data-mode=\"running\"]{--whg-y:-1456px}",
			".whg-pet[data-mode=\"waiting\"]{--whg-y:-1248px}",
			".whg-pet-sprite{display:block;width:192px;height:208px;background-repeat:no-repeat;background-size:1536px 2288px;background-position:0 var(--whg-y);transform:scale(var(--whg-scale));transform-origin:left top;animation:whgPetFrames 1.7s step-end infinite}",
			".whg-pet[data-mode=\"running\"] .whg-pet-sprite{animation-duration:900ms}",
			".whg-pet[data-mode=\"waiting\"] .whg-pet-sprite{animation-duration:1.35s}",
			".whg-pet[data-looking=\"true\"] .whg-pet-sprite{animation:none;background-position:var(--whg-look-x) var(--whg-look-y)}",
			"@keyframes whgPetFrames{0%,16.66%{background-position:0 var(--whg-y)}16.67%,33.32%{background-position:-192px var(--whg-y)}33.33%,49.99%{background-position:-384px var(--whg-y)}50%,66.65%{background-position:-576px var(--whg-y)}66.66%,83.32%{background-position:-768px var(--whg-y)}83.33%,99.99%{background-position:-960px var(--whg-y)}100%{background-position:0 var(--whg-y)}}",
			".whg-pet-status{position:absolute;right:8px;bottom:-28px;max-width:184px;overflow:hidden;padding:5px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;color:var(--dsw-alias-text-secondary);background:color-mix(in srgb,var(--dsw-alias-bg-base) 88%,transparent);font:12px/1.2 system-ui,sans-serif;text-overflow:ellipsis;white-space:nowrap;opacity:0;transform:translateY(4px);transition:opacity 150ms ease,transform 150ms ease;pointer-events:none}",
			".whg-pet:hover .whg-pet-status,.whg-pet:focus-visible .whg-pet-status{opacity:1;transform:translateY(0)}",
			".whg-pet:focus-visible{outline:2px solid var(--dsw-alias-border-l3);outline-offset:4px}",
			"@media (max-width:760px){.whg-pet{--whg-scale:.9;right:8px;bottom:106px}}",
			"@media (prefers-reduced-motion:reduce){.whg-pet-sprite{animation:none}}",
			".whg-root{position:fixed;inset:0;z-index:8000;font-family:system-ui,\"Segoe UI\",\"Microsoft YaHei\",sans-serif;user-select:none;pointer-events:auto;overflow:hidden;background:#050b18;color:#eaf5ff}",
			".whg-root-tab{position:relative;min-height:calc(100vh - 170px);width:100%;z-index:auto;font-family:system-ui,\"Segoe UI\",\"Microsoft YaHei\",sans-serif;user-select:none;overflow:hidden;background:#050b18;color:#eaf5ff;border-radius:16px;border:1px solid rgba(140,200,255,.15)}",
			".whg-root-tab .whg-sprite-wrap{height:88vh;margin-bottom:0}",
			".whg-root-tab .whg-panel{min-height:20vh;max-height:30vh;bottom:0;border-radius:16px}",
			".whg-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.94)}",
			".whg-bg-fallback{background:linear-gradient(180deg,#0a1e3d,#06203f)}",
			".whg-vignette{position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,8,20,.4) 0%,rgba(3,8,20,0) 28%,rgba(3,8,20,0) 55%,rgba(3,8,20,.82) 100%);pointer-events:none}",
			".whg-top{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:10px;padding:14px 20px;z-index:5}",
			".whg-title{font-size:17px;font-weight:800;letter-spacing:1px;color:#dcecff;text-shadow:0 2px 12px rgba(0,20,60,.9)}",
			".whg-chip-wrap{position:relative;display:flex;min-width:0}",
			".whg-chip{display:flex;align-items:center;gap:6px;min-width:0;white-space:nowrap;font-size:11px;color:#bcd6f2;background:rgba(6,18,38,.55);border:1px solid rgba(140,200,255,.25);border-radius:999px;padding:4px 10px;font-family:inherit}",
			".whg-chip-button{appearance:none;cursor:pointer;text-align:left;transition:border-color .16s ease,background .16s ease}",
			".whg-chip-button:hover,.whg-chip-button[aria-expanded=\"true\"]{border-color:rgba(159,232,255,.58);background:rgba(16,49,72,.82)}",
			".whg-chip-button:focus-visible{outline:2px solid #9fe8ff;outline-offset:2px}",
			".whg-chip strong{max-width:170px;overflow:hidden;color:#eff9ff;font-weight:700;text-overflow:ellipsis}",
			".whg-chip-caret{color:#8bc8da;font-size:9px;transition:transform .16s ease}",
			".whg-chip-button[aria-expanded=\"true\"] .whg-chip-caret{transform:rotate(180deg)}",
			".whg-dot{width:7px;height:7px;border-radius:50%;background:#46d98a;box-shadow:0 0 8px #46d98a}",
			".whg-dot.off{background:#8aa0bd;box-shadow:none}",
			".whg-spacer{flex:1}",
			".whg-top-actions{display:flex;align-items:center;gap:8px}",
			".whg-btn{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:#cfe6ff;border-radius:10px;padding:6px 12px;font-size:13px;cursor:pointer;line-height:1.3;font-family:inherit}",
			".whg-btn:hover{background:rgba(255,255,255,.18)}",
			".whg-btn:focus-visible,.whg-choice:focus-visible,.whg-cg-btn:focus-visible{outline:2px solid #9fe8ff;outline-offset:2px}",
			".whg-btn[aria-pressed=\"true\"]{border-color:rgba(126,222,244,.62);background:rgba(68,164,198,.24);color:#effcff}",
			".whg-count{display:inline-grid;place-items:center;min-width:16px;height:16px;margin-left:5px;padding:0 4px;border-radius:999px;background:rgba(143,216,239,.18);color:#dff8ff;font:700 10px/1 Consolas,monospace}",
			".whg-btn:disabled{opacity:.45;cursor:default}",
			".whg-btn.back{background:linear-gradient(135deg,#2f7fd6,#7a5fd6);border:none;color:#fff;font-weight:700;padding:8px 16px;font-size:14px}",
			".whg-picker{position:absolute;top:calc(100% + 8px);left:0;z-index:18;width:min(330px,calc(100vw - 28px));max-height:min(430px,70vh);overflow:auto;padding:7px;border:1px solid rgba(215,182,108,.48);border-radius:14px;background:linear-gradient(180deg,rgba(7,30,45,.985),rgba(3,17,31,.995));box-shadow:0 20px 55px rgba(0,5,16,.72);scrollbar-color:rgba(143,216,239,.45) transparent}",
			".whg-picker.right{right:0;left:auto}",
			".whg-picker-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 9px 9px;color:#d7c48f;font:700 10px/1.3 Consolas,monospace;letter-spacing:1.4px}",
			".whg-picker-note{padding:7px 9px;color:#8fb1c5;font-size:11px;line-height:1.55}",
			".whg-picker-option{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;width:100%;padding:9px 10px;border:0;border-radius:9px;background:transparent;color:#dff3ff;cursor:pointer;text-align:left;font-family:inherit}",
			".whg-picker-option:hover,.whg-picker-option:focus-visible{background:rgba(143,216,239,.12);outline:none}",
			".whg-picker-option[aria-selected=\"true\"]{background:linear-gradient(90deg,rgba(47,127,214,.28),rgba(215,182,108,.12));color:#fff}",
			".whg-picker-option-main{display:block;overflow:hidden;font-size:12px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}",
			".whg-picker-option-sub{display:block;overflow:hidden;margin-top:2px;color:#83a9bd;font:10px/1.35 Consolas,monospace;text-overflow:ellipsis;white-space:nowrap}",
			".whg-picker-check{color:#f0d99d;font-size:12px}",
			".whg-bg-picker{width:min(360px,calc(100vw - 28px));padding:12px}",
			".whg-bg-preview{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;margin:2px 0 10px;border:1px solid rgba(143,216,239,.28);border-radius:10px;background:#020a14}",
			".whg-bg-empty{display:grid;place-items:center;width:100%;aspect-ratio:16/9;margin:2px 0 10px;border:1px dashed rgba(143,216,239,.28);border-radius:10px;color:#7f9cae;font-size:11px;background:rgba(1,10,20,.25)}",
			".whg-bg-actions{display:flex;flex-wrap:wrap;gap:7px}",
			".whg-bg-file{display:none}",
			".whg-bg-error{margin:8px 1px 0;color:#ffb5bd;font-size:11px;line-height:1.5}",
			".whg-sprite-picker{width:min(340px,calc(100vw - 28px));padding:12px}",
			".whg-sprite-preview-shell{position:relative;display:grid;place-items:end center;width:100%;height:min(48vh,360px);overflow:hidden;margin:2px 0 10px;border:1px solid rgba(143,216,239,.28);border-radius:12px;background-color:#061725;background-image:linear-gradient(45deg,rgba(143,216,239,.055) 25%,transparent 25%),linear-gradient(-45deg,rgba(143,216,239,.055) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,rgba(143,216,239,.055) 75%),linear-gradient(-45deg,transparent 75%,rgba(143,216,239,.055) 75%);background-position:0 0,0 8px,8px -8px,-8px 0;background-size:16px 16px;box-shadow:inset 0 -45px 70px rgba(0,8,18,.34)}",
			".whg-sprite-preview{display:block;width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 12px 24px rgba(0,8,24,.5))}",
			".whg-sprite-custom{max-width:min(70vw,100%);object-fit:contain;object-position:center bottom}",
			".whg-stage{position:absolute;inset:0;z-index:2;pointer-events:none;display:flex;align-items:flex-end;justify-content:center}",
			".whg-tint{position:absolute;inset:0}",
			".whg-sprite-wrap{position:relative;margin-right:0;margin-bottom:0;height:96vh;display:flex;align-items:flex-end;transform:translateY(clamp(56px,12vh,96px)) scale(1.1);transform-origin:center top}",
			".whg-sprite{height:100%;width:auto;display:block;filter:drop-shadow(0 18px 40px rgba(0,10,30,.65));transition:filter .5s ease}",
			".whg-sprite-portrait{height:34vh;width:auto;border-radius:22px;box-shadow:0 10px 50px rgba(0,10,30,.7);background:rgba(6,18,38,.35)}",
			".whg-mood-happy .whg-sprite{filter:drop-shadow(0 18px 40px rgba(0,10,30,.65)) brightness(1.1) saturate(1.2)}",
			".whg-mood-shy .whg-sprite{filter:drop-shadow(0 18px 40px rgba(0,10,30,.65)) brightness(1.04) saturate(1.25) hue-rotate(-12deg)}",
			".whg-mood-angry .whg-sprite{filter:drop-shadow(0 18px 40px rgba(0,10,30,.65)) saturate(1.15) contrast(1.06) hue-rotate(-26deg)}",
			".whg-blush{position:absolute;left:14%;top:16%;width:72%;height:28%;background:radial-gradient(ellipse at center,rgba(255,120,160,.9),transparent 70%);border-radius:50%;mix-blend-mode:screen;transition:opacity .5s ease}",
			".whg-sprite-fallback{height:100%;display:flex;align-items:center;font-size:20vh;filter:drop-shadow(0 18px 40px rgba(0,10,30,.6))}",
			".whg-panel{position:absolute;left:5vw;right:5vw;bottom:2.6vh;min-height:26vh;max-height:38vh;background:linear-gradient(180deg,rgba(8,20,42,.9),rgba(4,12,28,.94));border:1px solid rgba(140,200,255,.22);border-radius:22px;backdrop-filter:blur(12px);padding:26px 30px 18px;z-index:4;box-shadow:0 24px 60px rgba(0,8,24,.6);display:flex;flex-direction:column}",
			".whg-plate{position:absolute;top:-17px;left:26px;padding:6px 20px;border-radius:999px;font-weight:800;font-size:15px;color:#04121f;letter-spacing:2px;box-shadow:0 4px 16px rgba(0,10,30,.4)}",
			".whg-plate.user{background:#ff9cc8}",
			".whg-plate.narrator{background:#8fb4dd}",
			".whg-level{position:absolute;top:14px;right:24px;display:flex;align-items:center;gap:8px;font-size:12px;color:#a9c6e8}",
			".whg-level-track{width:140px;height:6px;border-radius:3px;background:rgba(255,255,255,.14);overflow:hidden}",
			".whg-level-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#4aa8ff,#ff7ab8);transition:width .6s ease}",
			".whg-line-now{font-size:clamp(16px,1.7vw,22px);line-height:1.8;animation:whgIn .45s ease;padding-top:6px}",
			".whg-line-now.narrator{color:#8fb4dd;font-style:italic;font-size:clamp(14px,1.4vw,18px)}",
			".whg-line-now.user{color:#ffd9ec}",
			"@keyframes whgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}",
			".whg-fallback-note{font-size:11px;color:#e8b04b;margin-top:6px}",
			".whg-choices{display:flex;flex-direction:column;gap:8px;margin-top:10px}",
			".whg-choice{background:rgba(140,200,255,.1);border:1px solid rgba(140,200,255,.35);color:#dcebff;border-radius:14px;padding:9px 16px;font-size:clamp(13px,1.3vw,16px);cursor:pointer;text-align:left;line-height:1.5;font-family:inherit}",
			".whg-choice:hover{background:rgba(140,200,255,.22);border-color:rgba(160,215,255,.65)}",
			".whg-choice:disabled{opacity:.5;cursor:default}",
			".whg-input-row{display:flex;gap:8px;margin-top:10px}",
			".whg-input{flex:1;background:rgba(255,255,255,.09);border:1px solid rgba(140,200,255,.32);color:#eaf5ff;border-radius:14px;padding:10px 14px;font-size:clamp(13px,1.3vw,16px);outline:none;font-family:inherit;min-width:0}",
			".whg-input:focus{border-color:rgba(160,215,255,.75)}",
			".whg-send{background:linear-gradient(135deg,#2f7fd6,#7a5fd6);border:none;color:#fff;border-radius:14px;padding:0 20px;font-size:14px;cursor:pointer;font-weight:700;font-family:inherit}",
			".whg-send:disabled{opacity:.5;cursor:default}",
			".whg-cg-backdrop{position:fixed;inset:0;z-index:9500;background:rgba(2,6,18,.85);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;backdrop-filter:blur(6px)}",
			".whg-cg-img{max-width:80vw;max-height:72vh;border-radius:18px;box-shadow:0 24px 80px rgba(0,0,0,.7);border:2px solid rgba(140,200,255,.35)}",
			".whg-cg-title{font-size:18px;font-weight:800;color:#dcecff;letter-spacing:1px}",
			".whg-cg-btns{display:flex;gap:12px}",
			".whg-cg-btn{background:linear-gradient(135deg,#2f7fd6,#7a5fd6);border:none;color:#fff;border-radius:12px;padding:9px 18px;font-size:14px;cursor:pointer;font-weight:700;font-family:inherit}",
			".whg-cg-btn.alt{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#dcebff}",
			".whg-toast{position:fixed;right:24px;bottom:24px;z-index:9600;background:rgba(6,18,38,.9);border:1px solid rgba(140,200,255,.3);color:#dcebff;border-radius:14px;padding:12px 18px;font-size:13px;font-family:system-ui,\"Segoe UI\",\"Microsoft YaHei\",sans-serif;box-shadow:0 12px 40px rgba(0,8,24,.6);max-width:340px}",
			".whg-archive-scrim{position:absolute;inset:0;z-index:20;background:linear-gradient(90deg,rgba(1,7,16,.26),rgba(1,7,16,.72));display:flex;justify-content:flex-end;animation:whgArchiveFade .18s ease}",
			".whg-archive{--whg-brass:#d7b66c;position:relative;box-sizing:border-box;width:min(470px,calc(100% - 42px));height:100%;overflow:visible;color:#eaf7ff;background:linear-gradient(180deg,rgba(7,30,45,.985),rgba(3,17,31,.995));border-left:1px solid rgba(215,182,108,.58);box-shadow:-24px 0 70px rgba(0,5,16,.68),inset 8px 0 24px rgba(27,111,137,.08);display:flex;flex-direction:column;animation:whgArchiveSlide .28s cubic-bezier(.2,.8,.2,1)}",
			".whg-archive:before{content:\"\";position:absolute;inset:0;pointer-events:none;opacity:.2;background:repeating-linear-gradient(180deg,transparent 0,transparent 46px,rgba(130,216,239,.13) 47px,transparent 48px)}",
			".whg-archive-spine{position:absolute;left:-33px;top:92px;width:32px;padding:14px 0;border:1px solid rgba(215,182,108,.5);border-right:0;border-radius:9px 0 0 9px;background:#09283a;color:#d7c48f;writing-mode:vertical-rl;text-orientation:mixed;font:700 10px/1 Consolas,monospace;letter-spacing:3px;text-align:center;box-shadow:-8px 8px 22px rgba(0,5,16,.35)}",
			".whg-archive-head{position:relative;z-index:1;display:flex;align-items:flex-start;gap:14px;padding:24px 24px 18px;border-bottom:1px solid rgba(215,182,108,.32)}",
			".whg-archive-heading{min-width:0;flex:1}",
			".whg-archive-kicker{margin-bottom:5px;color:#8fd8e9;font:700 10px/1.4 Consolas,\"SFMono-Regular\",monospace;letter-spacing:2.3px;text-transform:uppercase}",
			".whg-archive-title{margin:0;color:#f3fbff;font-family:\"STSong\",\"Songti SC\",Georgia,serif;font-size:24px;font-weight:700;letter-spacing:1px}",
			".whg-archive-close{display:grid;place-items:center;flex:none;width:32px;height:32px;border:1px solid rgba(215,182,108,.36);border-radius:50%;background:rgba(3,14,25,.5);color:#dcefff;cursor:pointer;font-size:18px}",
			".whg-archive-close:hover{background:rgba(130,216,239,.13)}",
			".whg-archive-close:focus-visible,.whg-gallery-card:focus-visible,.whg-archive-back:focus-visible{outline:2px solid #9fe8ff;outline-offset:2px}",
			".whg-archive-body{position:relative;z-index:1;min-height:0;flex:1;overflow-y:auto;padding:18px 22px 28px;scrollbar-color:rgba(143,216,239,.45) transparent}",
			".whg-archive-empty{display:grid;place-items:center;min-height:220px;padding:24px;color:#8fb1c5;text-align:center;font-size:13px;line-height:1.8;border:1px dashed rgba(143,216,239,.22);border-radius:14px;background:rgba(1,10,20,.18)}",
			".whg-archive-error{padding:14px;border:1px solid rgba(255,154,154,.3);border-radius:12px;background:rgba(102,25,35,.2);color:#ffc1c1;font-size:13px;line-height:1.6}",
			".whg-archive-error .whg-btn{display:block;margin-top:10px}",
			".whg-history{display:flex;flex-direction:column;gap:12px;user-select:text}",
			".whg-history-row{display:grid;grid-template-columns:48px minmax(0,1fr);gap:10px;align-items:start}",
			".whg-history-who{padding-top:8px;color:#85bbca;font:700 10px/1.3 Consolas,monospace;letter-spacing:1px;text-align:right}",
			".whg-history-text{margin:0;padding:9px 12px;border-left:2px solid rgba(127,208,255,.4);background:rgba(4,22,36,.56);color:#dff3ff;font-size:13px;line-height:1.7;white-space:pre-wrap;word-break:break-word}",
			".whg-history-row.user .whg-history-text{border-left-color:#ff9cc8;color:#ffe4f1}",
			".whg-history-row.narrator .whg-history-text{border-left-color:#748ea8;color:#9eb6ca;font-style:italic}",
			".whg-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}",
			".whg-gallery-card{position:relative;min-width:0;overflow:hidden;padding:0;border:1px solid rgba(143,216,239,.24);border-radius:12px;background:#061725;color:#eaf7ff;cursor:pointer;text-align:left}",
			".whg-gallery-card:hover{border-color:rgba(215,182,108,.65);transform:translateY(-1px)}",
			".whg-gallery-thumb{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;background:#03101f}",
			".whg-gallery-placeholder{display:grid;place-items:center;color:#6f91a5;font:700 12px/1 Consolas,monospace}",
			".whg-gallery-meta{display:flex;align-items:center;gap:8px;padding:9px 10px}",
			".whg-gallery-level{color:#f0d99d;font:700 11px/1 Consolas,monospace}",
			".whg-gallery-date{min-width:0;overflow:hidden;color:#8fb1c5;font-size:10px;text-overflow:ellipsis;white-space:nowrap}",
			".whg-gallery-bg{position:absolute;top:8px;right:8px;padding:3px 7px;border:1px solid rgba(215,182,108,.5);border-radius:999px;background:rgba(3,14,25,.82);color:#f0d99d;font:700 9px/1.3 Consolas,monospace}",
			".whg-gallery-detail{display:flex;min-height:100%;flex-direction:column;gap:14px}",
			".whg-archive-back{align-self:flex-start;padding:6px 10px;border:0;border-radius:8px;background:rgba(143,216,239,.1);color:#cfefff;cursor:pointer;font-family:inherit}",
			".whg-gallery-full{display:block;width:100%;max-height:54vh;object-fit:contain;border:1px solid rgba(215,182,108,.35);border-radius:12px;background:#020a14}",
			".whg-gallery-caption{display:flex;align-items:center;gap:10px;color:#9bb9ca;font-size:12px}",
			".whg-gallery-caption strong{color:#f0d99d;font:700 12px/1 Consolas,monospace}",
			".whg-gallery-prompt{margin:0;padding:12px 14px;border-left:2px solid rgba(215,182,108,.55);background:rgba(2,12,22,.42);color:#9fbccb;font-size:11px;line-height:1.65;white-space:pre-wrap;word-break:break-word;user-select:text}",
			".whg-disabled{position:absolute;inset:0;z-index:6;display:grid;place-items:center;padding:24px;background:linear-gradient(180deg,#071629,#03101f)}",
			".whg-disabled-card{width:min(480px,100%);padding:28px;border:1px solid rgba(215,182,108,.4);border-radius:18px;background:rgba(5,25,39,.86);box-shadow:0 22px 60px rgba(0,4,14,.46);text-align:center}",
			".whg-disabled-card h2{margin:0 0 8px;color:#eefaff;font-family:\"STSong\",\"Songti SC\",Georgia,serif;font-size:23px}",
			".whg-disabled-card p{margin:0;color:#8fb1c5;font-size:13px;line-height:1.7}",
			".whg-settings-card{list-style:none;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);overflow:hidden}",
			".whg-settings-card[data-open=\"true\"]{border-color:color-mix(in srgb,var(--dsw-alias-label-dimmed) 70%,#d7b66c);background:var(--dsw-alias-bg-layer-2)}",
			".whg-settings-head{appearance:none;width:100%;display:flex;align-items:center;gap:12px;padding:14px 16px;border:0;background:transparent;color:inherit;cursor:pointer;text-align:left;font-family:inherit}",
			".whg-settings-head:focus-visible,.whg-settings-toggle:focus-visible,.whg-settings-select:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#2f7fd6);outline-offset:-2px}",
			".whg-settings-heading{display:flex;min-width:0;flex:1;flex-direction:column;gap:4px}",
			".whg-settings-name{font-size:15px;font-weight:650;line-height:1.4}",
			".whg-settings-desc{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}",
			".whg-settings-status{flex:none;padding:2px 8px;border-radius:999px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);font-size:11px}",
			".whg-settings-chevron{color:var(--dsw-alias-label-tertiary);font-size:12px;transition:transform .16s ease}",
			".whg-settings-card[data-open=\"true\"] .whg-settings-chevron{transform:rotate(180deg)}",
			".whg-settings-body{display:flex;flex-direction:column;gap:14px;margin:0 16px;padding:16px 0;border-top:1px solid var(--dsw-alias-border-l2)}",
			".whg-settings-row{display:grid;grid-template-columns:minmax(150px,.8fr) minmax(210px,1.2fr);align-items:center;gap:18px}",
			".whg-settings-copy strong{display:block;font-size:13px;font-weight:600}",
			".whg-settings-copy small{display:block;margin-top:3px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.45}",
			".whg-settings-toggle{justify-self:end;min-width:74px;padding:6px 13px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;line-height:1.35}",
			".whg-settings-toggle[aria-checked=\"true\"]{border-color:#3da87a;background:color-mix(in srgb,#3da87a 18%,transparent);color:var(--dsw-alias-label-primary)}",
			".whg-settings-select{box-sizing:border-box;width:100%;min-width:0;padding:7px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;line-height:1.4}",
			".whg-settings-message{min-height:18px;margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5}",
			".whg-settings-message.error{color:var(--dsw-alias-label-error,#c33)}",
			"@keyframes whgArchiveFade{from{opacity:0}to{opacity:1}}",
			"@keyframes whgArchiveSlide{from{transform:translateX(36px);opacity:.6}to{transform:none;opacity:1}}",
			"body[data-whale-galgame-active] [data-slot=\"conversation.composer\"],body[data-whale-galgame-active] [data-slot=\"conversation.composer.dock\"]{display:none !important}",
			"body[data-whale-galgame-active] .whg-pet{display:none !important}",
			"body[data-dsh-maid-atelier]:not([data-whale-galgame-active]) [data-skin-owner=\"maid-atelier\"]{display:none !important}",
			"body[data-dsh-maid-atelier]:not([data-whale-galgame-active]){background-image:none !important}",
			"@media (max-width:900px){.whg-top{gap:6px;padding:10px 12px;flex-wrap:wrap}.whg-title{font-size:14px}.whg-chip{padding:3px 8px}.whg-spacer{display:none}.whg-top-actions{width:100%;justify-content:flex-end}.whg-btn{padding:5px 9px;font-size:12px}.whg-archive{width:min(470px,calc(100% - 12px))}.whg-archive-spine{display:none}}",
			"@media (max-width:560px){.whg-chip-wrap{max-width:calc(50% - 4px)}.whg-chip{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.whg-picker{position:fixed;top:92px;right:10px;left:10px;width:auto;max-height:55vh}.whg-top-actions{gap:5px;overflow-x:auto;padding-bottom:2px}.whg-archive{width:100%;border-left:0}.whg-archive-head{padding:18px 16px 14px}.whg-archive-body{padding:14px 14px 24px}.whg-gallery{grid-template-columns:1fr}.whg-history-row{grid-template-columns:38px minmax(0,1fr);gap:8px}.whg-archive-title{font-size:21px}.whg-settings-row{grid-template-columns:1fr;gap:8px}.whg-settings-toggle{justify-self:start}.whg-settings-head{padding:13px}.whg-settings-body{margin:0 13px}}",
			"@media (prefers-reduced-motion:reduce){.whg-archive-scrim,.whg-archive{animation:none}.whg-gallery-card:hover{transform:none}}"
		].join("\n");
		function art(key) {
			if (!key) return void 0;
			return WHALE_ART[String(key)];
		}
		function activateGalgameTab() {
			const target = Array.from(document.querySelectorAll("button[role=\"tab\"]")).find((tab) => tab.offsetParent !== null && (tab.textContent || "").trim() === "galgame");
			if (!target || target.disabled) return false;
			target.click();
			try {
				target.focus({ preventScroll: true });
			} catch (err) {
				target.focus();
			}
			return true;
		}
		function formatCgDate(value) {
			const n = typeof value === "number" ? value : Number(value);
			if (!Number.isFinite(n) || n <= 0) return "时间未记录";
			try {
				return new Date(n).toLocaleString("zh-CN", {
					month: "2-digit",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit"
				});
			} catch (err) {
				return "时间未记录";
			}
		}
		async function api(action, args) {
			const res = await fetch("/whale-galgame-api", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					action,
					args: args || {}
				})
			});
			if (!res.ok) throw new Error("galgame api " + res.status);
			return res.json();
		}
		function selectMode(state) {
			const current = state && state.current !== void 0 && state.byId ? state.byId[state.current] : void 0;
			if (current && current.pendingInteraction !== void 0) return "waiting";
			if (current && current.running === true) return "running";
			return "idle";
		}
		let skinBgCaptured = null;
		function ensureSkin(active) {
			const owned = document.querySelectorAll("[data-skin-owner=\"maid-atelier\"]");
			if (active) {
				document.body.setAttribute("data-dsh-maid-atelier", "");
				if (skinBgCaptured !== null) {
					document.body.style.backgroundImage = skinBgCaptured;
					document.body.style.backgroundSize = "cover";
					document.body.style.backgroundPosition = "center top";
					document.body.style.backgroundAttachment = "fixed";
					document.body.style.backgroundRepeat = "no-repeat";
				}
				owned.forEach((node) => {
					node.style.display = "";
				});
			} else {
				if (document.body.hasAttribute("data-dsh-maid-atelier")) {
					if (skinBgCaptured === null) skinBgCaptured = document.body.style.backgroundImage || "";
					document.body.removeAttribute("data-dsh-maid-atelier");
					document.body.style.backgroundImage = "";
				}
				owned.forEach((node) => {
					node.style.display = "none";
				});
			}
		}
		const composerHiddenEls = /* @__PURE__ */ new Map();
		function setComposerHidden(hidden) {
			document.querySelectorAll("[data-slot='conversation.composer'], [data-slot*='composer']").forEach((node) => {
				const el = node;
				if (hidden) {
					if (!composerHiddenEls.has(el)) {
						composerHiddenEls.set(el, el.style.display);
						el.style.display = "none";
					}
				} else if (composerHiddenEls.has(el)) {
					el.style.display = composerHiddenEls.get(el) || "";
					composerHiddenEls.delete(el);
				}
			});
		}
		function syncTabLayout(visible) {
			const rootEl = document.getElementById("whg-tab-root");
			if (!rootEl) return;
			if (visible && rootEl.offsetParent !== null) {
				const r = rootEl.getBoundingClientRect();
				const fill = Math.max(420, Math.min(2e3, window.innerHeight - r.top - 8));
				rootEl.style.minHeight = fill + "px";
			} else rootEl.style.minHeight = "";
		}
		function Pet(props) {
			const mode = props.useSessions ? props.useSessions(selectMode) : "idle";
			const [lookIndex, setLookIndex] = (0, react.useState)(null);
			const buttonRef = (0, react.useRef)(null);
			const sheet = art("pet-spritesheet");
			const spriteStyle = sheet ? { backgroundImage: "url(" + sheet + ")" } : {
				background: "linear-gradient(160deg,#0e2b52,#123a63)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: 40
			};
			(0, react.useEffect)(() => {
				if (mode !== "idle") {
					setLookIndex(null);
					return;
				}
				let idleTimer;
				const handlePointerMove = (event) => {
					const rect = buttonRef.current && buttonRef.current.getBoundingClientRect ? buttonRef.current.getBoundingClientRect() : null;
					if (!rect) return;
					const dx = event.clientX - (rect.left + rect.width / 2);
					const dy = event.clientY - (rect.top + rect.height / 2);
					const clockwiseFromUp = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
					setLookIndex(Math.round(clockwiseFromUp / 22.5) % 16);
					if (idleTimer) clearTimeout(idleTimer);
					idleTimer = setTimeout(() => setLookIndex(null), 1100);
				};
				window.addEventListener("pointermove", handlePointerMove, { passive: true });
				return () => {
					window.removeEventListener("pointermove", handlePointerMove);
					if (idleTimer) clearTimeout(idleTimer);
				};
			}, [mode]);
			const lookRow = lookIndex === null ? 0 : lookIndex < 8 ? 9 : 10;
			const lookColumn = lookIndex === null ? 0 : lookIndex % 8;
			const label = mode === "running" ? "deepseek娘正在工作" : mode === "waiting" ? "deepseek娘正在等待你" : "deepseek娘正在待机";
			return react.default.createElement("button", {
				"aria-label": label + "，点击开始galgame",
				className: "whg-pet",
				"data-looking": String(lookIndex !== null),
				"data-mode": mode,
				onClick: props.onOpen,
				ref: buttonRef,
				style: {
					"--whg-look-x": -lookColumn * 192 + "px",
					"--whg-look-y": -lookRow * 208 + "px"
				},
				title: label + "，点击开始galgame",
				type: "button"
			}, react.default.createElement("span", {
				"aria-hidden": "true",
				className: "whg-pet-sprite",
				style: spriteStyle
			}, sheet ? void 0 : "🐋"), react.default.createElement("span", { className: "whg-pet-status" }, label));
		}
		function optionText(option, fallback = "未命名") {
			if (!option) return fallback;
			return String(option.label || option.name || option.model || option.id || fallback);
		}
		function selectionKey(selection) {
			if (!selection) return "";
			return encodeURIComponent(String(selection.provider || "")) + "|" + encodeURIComponent(String(selection.model || selection.id || ""));
		}
		function parseSelectionKey(value) {
			const split = value.indexOf("|");
			if (split < 0) return null;
			try {
				const provider = decodeURIComponent(value.slice(0, split));
				const model = decodeURIComponent(value.slice(split + 1));
				return model ? {
					provider,
					model
				} : null;
			} catch (err) {
				return null;
			}
		}
		function mainModelText(options) {
			const main = options && options.mainSelection;
			if (!main) return "当前工作区模型";
			return optionText(main, String(main.model || "当前工作区模型"));
		}
		function settingsFromResult(result) {
			if (!result || typeof result !== "object") return null;
			if (result.settings && typeof result.settings === "object") return result.settings;
			if ("enabled" in result && ("characterMode" in result || "chatMode" in result)) return result;
			return null;
		}
		function viewFromResult(result) {
			if (!result || typeof result !== "object") return null;
			if (result.view && typeof result.view === "object") return result.view;
			if ("current" in result && ("name" in result || "history" in result)) return result;
			return null;
		}
		function assertApiResult(result, fallback) {
			if (!result || result.ok !== false) return;
			const errors = Array.isArray(result.errors) ? result.errors.join("；") : result.error;
			throw new Error(errors || fallback);
		}
		function PluginSettingsCard() {
			const [open, setOpen] = (0, react.useState)(false);
			const [loading, setLoading] = (0, react.useState)(true);
			const [saving, setSaving] = (0, react.useState)(false);
			const [settings, setSettings] = (0, react.useState)(null);
			const [options, setOptions] = (0, react.useState)({
				characters: [],
				models: []
			});
			const [message, setMessage] = (0, react.useState)("");
			const [error, setError] = (0, react.useState)("");
			(0, react.useEffect)(() => {
				let alive = true;
				Promise.all([api("settings-get"), api("model-options")]).then(([nextSettings, nextOptions]) => {
					if (!alive) return;
					setSettings(settingsFromResult(nextSettings) || nextSettings);
					setOptions(nextOptions && typeof nextOptions === "object" ? nextOptions : {
						characters: [],
						models: []
					});
					setError("");
				}).catch((err) => {
					if (alive) setError("插件设置读取失败：" + String(err && err.message ? err.message : err));
				}).then(() => {
					if (alive) setLoading(false);
				});
				return () => {
					alive = false;
				};
			}, []);
			(0, react.useEffect)(() => {
				const onSettingsChanged = (event) => {
					const detail = event.detail;
					if (detail && detail.settings) setSettings(detail.settings);
					api("model-options").then((nextOptions) => {
						if (nextOptions && typeof nextOptions === "object") setOptions(nextOptions);
					}).catch(() => {});
				};
				window.addEventListener("whg:settings-changed", onSettingsChanged);
				return () => window.removeEventListener("whg:settings-changed", onSettingsChanged);
			}, []);
			(0, react.useEffect)(() => {
				if (!open) return void 0;
				let alive = true;
				Promise.all([api("settings-get"), api("model-options")]).then(([nextSettings, nextOptions]) => {
					if (!alive) return;
					setSettings(settingsFromResult(nextSettings) || nextSettings);
					if (nextOptions && typeof nextOptions === "object") setOptions(nextOptions);
				}).catch(() => {});
				return () => {
					alive = false;
				};
			}, [open]);
			function save(patch) {
				if (saving) return;
				setSaving(true);
				setMessage("正在保存…");
				setError("");
				api("settings-set", patch).then(async (result) => {
					assertApiResult(result, "设置未被接受");
					let nextSettings = settingsFromResult(result);
					if (!nextSettings) {
						const refreshed = await api("settings-get");
						nextSettings = settingsFromResult(refreshed) || refreshed;
					}
					setSettings(nextSettings);
					setMessage("已保存");
					window.dispatchEvent(new CustomEvent("whg:settings-changed", { detail: {
						settings: nextSettings,
						view: viewFromResult(result)
					} }));
				}).catch((err) => {
					setMessage("");
					setError("保存失败：" + String(err && err.message ? err.message : err));
				}).then(() => setSaving(false));
			}
			const characters = Array.isArray(options && options.characters) ? options.characters : [];
			const models = Array.isArray(options && options.models) ? options.models : [];
			const characterValue = settings && settings.characterMode === "manual" && settings.characterId ? "character:" + String(settings.characterId) : "follow";
			const chatValue = settings && settings.chatMode === "manual" && settings.chatSelection ? "model:" + selectionKey(settings.chatSelection) : settings && settings.chatMode === "main" ? "main" : "configured";
			const enabled = !settings || settings.enabled !== false;
			const configuredModel = optionText(options && options.configuredSelection || settings && settings.configuredSelection, "插件配置模型");
			return react.default.createElement("li", {
				className: "whg-settings-card",
				"data-open": String(open)
			}, react.default.createElement("button", {
				"aria-expanded": open,
				"aria-label": (open ? "收起" : "展开") + "鲸鱼娘 Galgame 设置",
				className: "whg-settings-head",
				onClick: () => setOpen(!open),
				type: "button"
			}, react.default.createElement("span", { className: "whg-settings-heading" }, react.default.createElement("span", { className: "whg-settings-name" }, "鲸鱼娘 Galgame"), react.default.createElement("span", { className: "whg-settings-desc" }, "控制插件启用状态，以及出场角色与台词模型。")), react.default.createElement("span", { className: "whg-settings-status" }, loading ? "读取中" : error ? "不可用" : enabled ? "已启用" : "已关闭"), react.default.createElement("span", {
				className: "whg-settings-chevron",
				"aria-hidden": "true"
			}, "▼")), open ? react.default.createElement("div", { className: "whg-settings-body" }, react.default.createElement("div", { className: "whg-settings-row" }, react.default.createElement("span", { className: "whg-settings-copy" }, react.default.createElement("strong", null, "启用插件"), react.default.createElement("small", null, "关闭后隐藏桌宠，并暂停 galgame 对话入口内容。")), react.default.createElement("button", {
				"aria-checked": enabled,
				className: "whg-settings-toggle",
				disabled: loading || saving || !settings,
				onClick: () => save({ enabled: !enabled }),
				role: "switch",
				type: "button"
			}, enabled ? "已开启" : "已关闭")), react.default.createElement("label", { className: "whg-settings-row" }, react.default.createElement("span", { className: "whg-settings-copy" }, react.default.createElement("strong", null, "角色来源"), react.default.createElement("small", null, "默认跟随工作区模型，也可固定为某位模型娘。")), react.default.createElement("select", {
				className: "whg-settings-select",
				disabled: loading || saving || !settings,
				onChange: (event) => {
					const value = String(event.target.value);
					if (value === "follow") save({
						characterMode: "follow",
						characterId: null
					});
					else if (value.startsWith("character:")) save({
						characterMode: "manual",
						characterId: value.slice(10)
					});
				},
				value: characterValue
			}, react.default.createElement("option", { value: "follow" }, "跟随工作区 · " + mainModelText(options)), characters.map((character, index) => react.default.createElement("option", {
				key: String(character.id || index),
				value: "character:" + String(character.id || "")
			}, optionText(character, "角色 " + (index + 1)))))), react.default.createElement("label", { className: "whg-settings-row" }, react.default.createElement("span", { className: "whg-settings-copy" }, react.default.createElement("strong", null, "对话模型"), react.default.createElement("small", null, "可继续使用插件默认模型、跟随工作区，或单独指定。")), react.default.createElement("select", {
				className: "whg-settings-select",
				disabled: loading || saving || !settings,
				onChange: (event) => {
					const value = String(event.target.value);
					if (value === "configured") save({
						chatMode: "configured",
						chatSelection: null
					});
					else if (value === "main") save({
						chatMode: "main",
						chatSelection: null
					});
					else if (value.startsWith("model:")) {
						const selection = parseSelectionKey(value.slice(6));
						if (selection) save({
							chatMode: "manual",
							chatSelection: selection
						});
					}
				},
				value: chatValue
			}, react.default.createElement("option", { value: "configured" }, "使用插件默认 · " + configuredModel), react.default.createElement("option", { value: "main" }, "跟随工作区 · " + mainModelText(options)), models.map((model, index) => react.default.createElement("option", {
				key: selectionKey(model) || String(index),
				value: "model:" + selectionKey(model)
			}, optionText(model, "模型 " + (index + 1)))))), react.default.createElement("p", {
				className: "whg-settings-message" + (error ? " error" : ""),
				role: error ? "alert" : "status"
			}, error || message || "设置会保存到当前工作区，顶部标签也可以随时快捷切换。")) : null);
		}
		function App(props) {
			const [s, setS] = (0, react.useState)(null);
			const [open, setOpen] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [text, setText] = (0, react.useState)("");
			const [armReset, setArmReset] = (0, react.useState)(false);
			const [imgFail, setImgFail] = (0, react.useState)(false);
			const [apiError, setApiError] = (0, react.useState)(null);
			const [settled, setSettled] = (0, react.useState)(false);
			const [archivePanel, setArchivePanel] = (0, react.useState)(null);
			const [galleryItems, setGalleryItems] = (0, react.useState)([]);
			const [galleryLoading, setGalleryLoading] = (0, react.useState)(false);
			const [galleryError, setGalleryError] = (0, react.useState)(null);
			const [gallerySelected, setGallerySelected] = (0, react.useState)(null);
			const [pickerPanel, setPickerPanel] = (0, react.useState)(null);
			const [modelOptions, setModelOptions] = (0, react.useState)(null);
			const [pluginSettings, setPluginSettings] = (0, react.useState)(null);
			const [pickerLoading, setPickerLoading] = (0, react.useState)(false);
			const [pickerError, setPickerError] = (0, react.useState)("");
			const [backgroundPreview, setBackgroundPreview] = (0, react.useState)(null);
			const [backgroundFileName, setBackgroundFileName] = (0, react.useState)("");
			const [spritePreview, setSpritePreview] = (0, react.useState)(null);
			const [spriteFileName, setSpriteFileName] = (0, react.useState)("");
			const [customSprite, setCustomSprite] = (0, react.useState)(null);
			const bgCache = (0, react.useRef)(null);
			const spriteCache = (0, react.useRef)({});
			const spriteRevisionCache = (0, react.useRef)({});
			const archiveRef = (0, react.useRef)(null);
			const archiveCloseRef = (0, react.useRef)(null);
			const archiveReturnFocus = (0, react.useRef)(null);
			const historyScrollRef = (0, react.useRef)(null);
			const pickerRef = (0, react.useRef)(null);
			const pickerReturnFocus = (0, react.useRef)(null);
			const bgFileRef = (0, react.useRef)(null);
			const spriteFileRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				let alive = true;
				api("view").then((v) => {
					if (alive) {
						setS(v);
						setApiError(null);
					}
				}).catch((e) => {
					if (alive) setApiError("galgame 服务未就绪：" + String(e && e.message ? e.message : e));
				});
				return () => {
					alive = false;
				};
			}, []);
			(0, react.useEffect)(() => {
				const t = setTimeout(() => setSettled(true), 4e3);
				return () => clearTimeout(t);
			}, []);
			(0, react.useEffect)(() => {
				if (props.variant !== "tab") return;
				const sync = () => {
					const el = document.getElementById("whg-tab-root");
					if (!!el && el.offsetParent !== null) {
						document.body.dataset.whaleGalgameActive = "";
						ensureSkin(true);
						setComposerHidden(true);
						syncTabLayout(true);
					} else {
						delete document.body.dataset.whaleGalgameActive;
						ensureSkin(false);
						setComposerHidden(false);
						syncTabLayout(false);
					}
				};
				sync();
				const id = setInterval(sync, 1200);
				return () => {
					clearInterval(id);
					delete document.body.dataset.whaleGalgameActive;
					ensureSkin(false);
					setComposerHidden(false);
					syncTabLayout(false);
				};
			}, [props.variant]);
			(0, react.useEffect)(() => {
				if (s && s.enabled === false) return void 0;
				const id = setInterval(() => {
					api("view").then((v) => {
						if (v && typeof v === "object") setS(v);
					}).catch(() => {});
				}, 6e3);
				return () => clearInterval(id);
			}, [s && s.enabled]);
			(0, react.useEffect)(() => {
				if (!s) return;
				if (s.bg === "cg" || s.bg === "custom") {
					if (!bgCache.current) api("bg-data").then((r) => {
						if (r && typeof r.dataUrl === "string" && r.dataUrl) {
							bgCache.current = r.dataUrl;
							setS((prev) => prev ? { ...prev } : prev);
						}
					}).catch(() => {});
				} else bgCache.current = null;
			}, [s && s.bg]);
			(0, react.useEffect)(() => {
				if (!s || s.enabled === false) {
					setCustomSprite(null);
					return;
				}
				const characterId = String(s.current || "");
				const revision = Number(s.spriteRevision);
				if (!characterId) {
					setCustomSprite(null);
					return;
				}
				if (Object.prototype.hasOwnProperty.call(spriteCache.current, characterId) && (!Number.isFinite(revision) || spriteRevisionCache.current[characterId] === revision)) {
					setCustomSprite(spriteCache.current[characterId]);
					return;
				}
				let alive = true;
				api("sprite-data", { characterId }).then((result) => {
					assertApiResult(result, "角色立绘读取失败");
					if (!alive) return;
					const returnedId = String(result && (result.characterId || result.charId) ? result.characterId || result.charId : characterId);
					const dataUrl = result && typeof result.dataUrl === "string" && result.dataUrl ? result.dataUrl : null;
					spriteCache.current[returnedId] = dataUrl;
					const returnedRevision = Number(result && result.revision);
					if (Number.isFinite(returnedRevision)) spriteRevisionCache.current[returnedId] = returnedRevision;
					if (returnedId === characterId) {
						setCustomSprite(dataUrl);
						setImgFail(false);
					}
				}).catch(() => {
					if (alive) setCustomSprite(null);
				});
				return () => {
					alive = false;
				};
			}, [
				s && s.current,
				s && s.enabled,
				s && s.spriteRevision
			]);
			(0, react.useEffect)(() => {
				const onSettingsChanged = (event) => {
					const detail = event.detail;
					if (detail && detail.settings) setPluginSettings(detail.settings);
					if (detail && detail.view) setS(detail.view);
					else api("view").then((view) => {
						if (view && typeof view === "object") setS(view);
					}).catch(() => {});
				};
				window.addEventListener("whg:settings-changed", onSettingsChanged);
				return () => window.removeEventListener("whg:settings-changed", onSettingsChanged);
			}, []);
			(0, react.useEffect)(() => {
				const onBackgroundChanged = (event) => {
					const detail = event.detail;
					if (!detail || typeof detail !== "object") return;
					bgCache.current = typeof detail.dataUrl === "string" && detail.dataUrl ? detail.dataUrl : null;
					if (detail.view && typeof detail.view === "object") setS(detail.view);
					else api("view").then((nextView) => {
						if (nextView && typeof nextView === "object") setS(nextView);
					}).catch(() => {});
				};
				window.addEventListener("whg:bg-changed", onBackgroundChanged);
				return () => window.removeEventListener("whg:bg-changed", onBackgroundChanged);
			}, []);
			(0, react.useEffect)(() => {
				const currentId = String(s && s.current ? s.current : "");
				const onSpriteChanged = (event) => {
					const detail = event.detail;
					if (!detail || typeof detail !== "object") return;
					const characterId = String(detail.characterId || detail.charId || detail.view && detail.view.current || currentId);
					const dataUrl = typeof detail.dataUrl === "string" && detail.dataUrl ? detail.dataUrl : null;
					if (characterId) spriteCache.current[characterId] = dataUrl;
					const revision = Number(detail.revision !== void 0 ? detail.revision : detail.view && detail.view.spriteRevision);
					if (characterId && Number.isFinite(revision)) spriteRevisionCache.current[characterId] = revision;
					if (!characterId || characterId === currentId) {
						setCustomSprite(dataUrl);
						setImgFail(false);
					}
					if (detail.view && typeof detail.view === "object") setS(detail.view);
				};
				window.addEventListener("whg:sprite-changed", onSpriteChanged);
				return () => window.removeEventListener("whg:sprite-changed", onSpriteChanged);
			}, [s && s.current]);
			(0, react.useEffect)(() => {
				setImgFail(false);
			}, [
				s && s.current,
				s && s.sprite,
				customSprite
			]);
			(0, react.useEffect)(() => {
				const onPetSetting = (event) => {
					const enabled = event.detail;
					if (typeof enabled === "boolean") setS((prev) => prev ? {
						...prev,
						petEnabled: enabled
					} : prev);
				};
				window.addEventListener("whg:pet-setting", onPetSetting);
				return () => window.removeEventListener("whg:pet-setting", onPetSetting);
			}, []);
			(0, react.useEffect)(() => {
				if (!archivePanel) return void 0;
				const frame = requestAnimationFrame(() => {
					if (!archiveRef.current || archiveRef.current.contains(document.activeElement)) return;
					archiveCloseRef.current?.focus();
				});
				const onKeyDown = (event) => {
					if (event.key === "Escape") {
						event.preventDefault();
						if (gallerySelected) setGallerySelected(null);
						else closeArchive();
						return;
					}
					if (event.key !== "Tab" || !archiveRef.current) return;
					const focusable = Array.from(archiveRef.current.querySelectorAll("button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex=\"-1\"])")).filter((node) => node.offsetParent !== null);
					if (focusable.length === 0) {
						event.preventDefault();
						archiveCloseRef.current?.focus();
						return;
					}
					const first = focusable[0];
					const last = focusable[focusable.length - 1];
					if (event.shiftKey && document.activeElement === first) {
						event.preventDefault();
						last.focus();
					} else if (!event.shiftKey && document.activeElement === last) {
						event.preventDefault();
						first.focus();
					} else if (!archiveRef.current.contains(document.activeElement)) {
						event.preventDefault();
						first.focus();
					}
				};
				document.addEventListener("keydown", onKeyDown, true);
				return () => {
					cancelAnimationFrame(frame);
					document.removeEventListener("keydown", onKeyDown, true);
				};
			}, [archivePanel, gallerySelected]);
			(0, react.useEffect)(() => {
				if (!pickerPanel) return void 0;
				const focusFrame = requestAnimationFrame(() => {
					(pickerRef.current?.querySelector("[role=\"option\"][aria-selected=\"true\"]") || pickerRef.current?.querySelector("button:not(:disabled),input:not(:disabled),select:not(:disabled)"))?.focus();
				});
				const onPointerDown = (event) => {
					const target = event.target;
					if (target && (pickerRef.current?.contains(target) || pickerReturnFocus.current?.contains(target))) return;
					setPickerPanel(null);
					setBackgroundPreview(null);
					setSpritePreview(null);
					setPickerError("");
				};
				const onKeyDown = (event) => {
					if (event.key === "Escape") {
						event.preventDefault();
						const target = pickerReturnFocus.current;
						setPickerPanel(null);
						setBackgroundPreview(null);
						setSpritePreview(null);
						setPickerError("");
						requestAnimationFrame(() => target?.focus());
						return;
					}
					if (![
						"ArrowDown",
						"ArrowUp",
						"Home",
						"End"
					].includes(event.key) || !pickerRef.current) return;
					const items = Array.from(pickerRef.current.querySelectorAll("button:not(:disabled),select:not(:disabled),input:not(:disabled)")).filter((node) => node.offsetParent !== null);
					if (!items.length) return;
					const current = items.indexOf(document.activeElement);
					const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : current < 0 ? event.key === "ArrowDown" ? 0 : items.length - 1 : event.key === "ArrowDown" ? (current + 1) % items.length : (current - 1 + items.length) % items.length;
					event.preventDefault();
					items[next].focus();
				};
				document.addEventListener("mousedown", onPointerDown, true);
				document.addEventListener("keydown", onKeyDown, true);
				return () => {
					cancelAnimationFrame(focusFrame);
					document.removeEventListener("mousedown", onPointerDown, true);
					document.removeEventListener("keydown", onKeyDown, true);
				};
			}, [pickerPanel]);
			(0, react.useEffect)(() => {
				if (s && s.enabled === false) {
					setPickerPanel(null);
					setArchivePanel(null);
				}
			}, [s && s.enabled]);
			(0, react.useEffect)(() => {
				if (archivePanel !== "history") return;
				const frame = requestAnimationFrame(() => {
					const node = historyScrollRef.current;
					if (node) node.scrollTop = node.scrollHeight;
				});
				return () => cancelAnimationFrame(frame);
			}, [archivePanel, s && s.history && s.history.length]);
			function act(action, args) {
				if (busy) return;
				setBusy(true);
				api(action, args).then((v) => {
					if (v && typeof v === "object") {
						setS(v);
						setApiError(null);
						if (action === "pet-set" && typeof v.petEnabled === "boolean") window.dispatchEvent(new CustomEvent("whg:pet-setting", { detail: v.petEnabled }));
						if (action === "cg-save-bg") window.dispatchEvent(new CustomEvent("whg:bg-changed", { detail: {
							dataUrl: bgCache.current,
							view: v
						} }));
						else if (action === "cg-clear-bg") window.dispatchEvent(new CustomEvent("whg:bg-changed", { detail: {
							dataUrl: null,
							view: v
						} }));
					}
				}).catch((e) => {
					setApiError(String(e && e.message ? e.message : e));
				}).then(() => {
					setBusy(false);
				});
			}
			function closePicker(restoreFocus = true) {
				const target = pickerReturnFocus.current;
				pickerReturnFocus.current = null;
				setPickerPanel(null);
				setPickerError("");
				setBackgroundPreview(null);
				setBackgroundFileName("");
				setSpritePreview(null);
				setSpriteFileName("");
				if (restoreFocus && target && target.isConnected) requestAnimationFrame(() => target.focus());
			}
			function loadPickerData() {
				setPickerLoading(true);
				setPickerError("");
				Promise.all([api("model-options"), api("settings-get")]).then(([options, settingsResult]) => {
					setModelOptions(options && typeof options === "object" ? options : {
						characters: [],
						models: []
					});
					setPluginSettings(settingsFromResult(settingsResult) || settingsResult);
				}).catch((err) => {
					setPickerError("模型列表读取失败：" + String(err && err.message ? err.message : err));
				}).then(() => setPickerLoading(false));
			}
			function openPicker(kind, trigger) {
				if (pickerPanel === kind) {
					closePicker(false);
					return;
				}
				pickerReturnFocus.current = trigger;
				setPickerPanel(kind);
				setPickerError("");
				setBackgroundPreview(null);
				setBackgroundFileName("");
				setSpritePreview(null);
				setSpriteFileName("");
				if (kind === "character" || kind === "chat") loadPickerData();
			}
			function updateRuntimeSettings(patch) {
				if (pickerLoading) return;
				setPickerLoading(true);
				setPickerError("");
				api("settings-set", patch).then(async (result) => {
					assertApiResult(result, "切换未被接受");
					let nextSettings = settingsFromResult(result);
					if (!nextSettings) {
						const refreshed = await api("settings-get");
						nextSettings = settingsFromResult(refreshed) || refreshed;
					}
					let nextView = viewFromResult(result);
					if (!nextView) nextView = await api("view");
					if (nextSettings) setPluginSettings(nextSettings);
					if (nextView && typeof nextView === "object") setS(nextView);
					window.dispatchEvent(new CustomEvent("whg:settings-changed", { detail: {
						settings: nextSettings,
						view: nextView
					} }));
					closePicker();
				}).catch((err) => {
					setPickerError("切换失败：" + String(err && err.message ? err.message : err));
				}).then(() => setPickerLoading(false));
			}
			function chooseBackgroundFile(event) {
				const file = event && event.target && event.target.files ? event.target.files[0] : void 0;
				if (event && event.target) event.target.value = "";
				if (!file) return;
				if (!(/* @__PURE__ */ new Set([
					"image/png",
					"image/jpeg",
					"image/jpg",
					"image/webp",
					"image/avif"
				])).has(String(file.type || "").toLowerCase())) {
					setPickerError("请选择 PNG、JPG、WebP 或 AVIF 图片。");
					return;
				}
				if (file.size > 12582912) {
					setPickerError("图片不能超过 12 MB，请压缩后重试。");
					return;
				}
				setPickerError("");
				const reader = new FileReader();
				reader.onload = () => {
					if (typeof reader.result !== "string") {
						setPickerError("图片预览失败，请换一张图片。");
						return;
					}
					setBackgroundPreview(reader.result);
					setBackgroundFileName(file.name);
				};
				reader.onerror = () => setPickerError("图片读取失败，请重新选择。");
				reader.readAsDataURL(file);
			}
			function applyBackgroundUpload() {
				if (!backgroundPreview || pickerLoading) return;
				setPickerLoading(true);
				setPickerError("");
				api("bg-upload", {
					dataUrl: backgroundPreview,
					fileName: backgroundFileName
				}).then(async (result) => {
					assertApiResult(result, "背景未保存");
					bgCache.current = backgroundPreview;
					let nextView = viewFromResult(result);
					if (!nextView) nextView = await api("view");
					if (nextView && typeof nextView === "object") setS(nextView);
					window.dispatchEvent(new CustomEvent("whg:bg-changed", { detail: {
						dataUrl: backgroundPreview,
						view: nextView
					} }));
					closePicker();
				}).catch((err) => {
					setPickerError("背景保存失败：" + String(err && err.message ? err.message : err));
				}).then(() => setPickerLoading(false));
			}
			function restoreDefaultBackground() {
				if (pickerLoading) return;
				setPickerLoading(true);
				setPickerError("");
				api(s && s.bg === "cg" ? "cg-clear-bg" : "bg-clear-custom").then(async (result) => {
					assertApiResult(result, "背景未恢复");
					bgCache.current = null;
					let nextView = viewFromResult(result);
					if (!nextView) nextView = await api("view");
					if (nextView && typeof nextView === "object") setS(nextView);
					window.dispatchEvent(new CustomEvent("whg:bg-changed", { detail: {
						dataUrl: null,
						view: nextView
					} }));
					closePicker();
				}).catch((err) => {
					setPickerError("恢复默认背景失败：" + String(err && err.message ? err.message : err));
				}).then(() => setPickerLoading(false));
			}
			function chooseSpriteFile(event) {
				const file = event && event.target && event.target.files ? event.target.files[0] : void 0;
				if (event && event.target) event.target.value = "";
				if (!file) return;
				if (!(/* @__PURE__ */ new Set([
					"image/png",
					"image/jpeg",
					"image/jpg",
					"image/webp",
					"image/avif"
				])).has(String(file.type || "").toLowerCase())) {
					setPickerError("请选择 PNG、JPG、WebP 或 AVIF 图片。");
					return;
				}
				if (file.size > 12582912) {
					setPickerError("图片不能超过 12 MB，请压缩后重试。");
					return;
				}
				setPickerError("");
				const reader = new FileReader();
				reader.onload = () => {
					if (typeof reader.result !== "string") {
						setPickerError("立绘预览失败，请换一张图片。");
						return;
					}
					setSpritePreview(reader.result);
					setSpriteFileName(file.name);
				};
				reader.onerror = () => setPickerError("图片读取失败，请重新选择。");
				reader.readAsDataURL(file);
			}
			function applySpriteUpload() {
				const dataUrl = spritePreview;
				const characterId = String(s && s.current ? s.current : "");
				if (!dataUrl || !characterId || pickerLoading) return;
				setPickerLoading(true);
				setPickerError("");
				api("sprite-upload", {
					characterId,
					dataUrl,
					fileName: spriteFileName
				}).then(async (result) => {
					assertApiResult(result, "角色立绘未保存");
					const savedCharacterId = String(result && (result.characterId || result.charId) ? result.characterId || result.charId : characterId);
					const revision = Number(result && result.revision);
					spriteCache.current[savedCharacterId] = dataUrl;
					if (Number.isFinite(revision)) spriteRevisionCache.current[savedCharacterId] = revision;
					let nextView = viewFromResult(result);
					if (!nextView) nextView = await api("view");
					if (nextView && typeof nextView === "object") setS(nextView);
					window.dispatchEvent(new CustomEvent("whg:sprite-changed", { detail: {
						characterId: savedCharacterId,
						dataUrl,
						revision,
						view: nextView
					} }));
					closePicker();
				}).catch((err) => {
					setPickerError("立绘保存失败：" + String(err && err.message ? err.message : err));
				}).then(() => setPickerLoading(false));
			}
			function restoreDefaultSprite() {
				const characterId = String(s && s.current ? s.current : "");
				if (!characterId || pickerLoading) return;
				setPickerLoading(true);
				setPickerError("");
				api("sprite-clear", { characterId }).then(async (result) => {
					assertApiResult(result, "默认立绘未恢复");
					const savedCharacterId = String(result && (result.characterId || result.charId) ? result.characterId || result.charId : characterId);
					const revision = Number(result && result.revision);
					spriteCache.current[savedCharacterId] = null;
					if (Number.isFinite(revision)) spriteRevisionCache.current[savedCharacterId] = revision;
					let nextView = viewFromResult(result);
					if (!nextView) nextView = await api("view");
					if (nextView && typeof nextView === "object") setS(nextView);
					window.dispatchEvent(new CustomEvent("whg:sprite-changed", { detail: {
						characterId: savedCharacterId,
						dataUrl: null,
						revision,
						view: nextView
					} }));
					closePicker();
				}).catch((err) => {
					setPickerError("恢复默认立绘失败：" + String(err && err.message ? err.message : err));
				}).then(() => setPickerLoading(false));
			}
			function send() {
				const t = text;
				if (!t.trim()) return;
				setText("");
				act("chat", { text: t });
			}
			const EMOTION_ART = {
				cheerful: "whale-cheerful",
				shy: "whale-shy",
				serious: "whale-serious",
				confused: "whale-confused",
				angry: "whale-angry",
				frightened: "whale-frightened",
				exasperated: "whale-exasperated",
				starry: "whale-starry"
			};
			function emotionOf() {
				const lines = s && s.history || [];
				let lastLine = null;
				for (let i = lines.length - 1; i >= 0; i--) if (lines[i].who === "user") {
					lastLine = lines[i];
					break;
				}
				if (!lastLine) return "normal";
				if (lastLine.emotion && EMOTION_ART[lastLine.emotion]) return lastLine.emotion;
				const last = lastLine.text || "";
				if (!last) return "normal";
				if (/生气|讨厌|哼|烦|滚|过分|笨蛋|气死|可恶/.test(last)) return "angry";
				if (/害怕|吓|恐怖|鬼|啊啊|惊|别吓我/.test(last)) return "frightened";
				if (/无奈|累死|唉|好吧|算了|服了|无语|头疼/.test(last)) return "exasperated";
				if (/星星|好美|浪漫|月亮|梦想|憧憬|心动|闪闪|漂亮/.test(last)) return "starry";
				if (/害羞|呜|脸红|别这样|不好意思|才不/.test(last)) return "shy";
				if (/？|\?|什么|不懂|困惑|为啥|咦|不明白|没听懂/.test(last)) return "confused";
				if (/认真|工作|学习|讨论|问题|严肃|报告|项目|方案/.test(last)) return "serious";
				if (/开心|高兴|哈哈|太好了|棒|喜欢|爱|♪|≧▽≦|耶|抱抱|亲亲/.test(last)) return "cheerful";
				return "normal";
			}
			function moodOf() {
				const lines = s && s.history || [];
				let last = null;
				for (let i = lines.length - 1; i >= 0; i--) if (lines[i].who === "heroine") {
					last = lines[i].text;
					break;
				}
				if (!last) return "normal";
				if (/生气|讨厌|哼|笨蛋|不理|走开|过分|烦/.test(last)) return "angry";
				if (/喜欢|♪|开心|太棒|幸福|≧▽≦|哈哈|啦～/.test(last)) return "happy";
				if (/害羞|才不|呜|脸红|别这样|……/.test(last)) return "shy";
				return "normal";
			}
			function lastLine() {
				const lines = s && s.history || [];
				return lines.length > 0 ? lines[lines.length - 1] : null;
			}
			function closeArchive() {
				setArchivePanel(null);
				setGallerySelected(null);
				const target = archiveReturnFocus.current;
				archiveReturnFocus.current = null;
				if (target && target.isConnected) requestAnimationFrame(() => target.focus());
			}
			function loadGallery() {
				setGalleryLoading(true);
				setGalleryError(null);
				api("cg-gallery").then((result) => {
					const items = result && Array.isArray(result.items) ? result.items : [];
					setGalleryItems(items);
				}).catch((error) => {
					setGalleryError(String(error && error.message ? error.message : error));
				}).then(() => {
					setGalleryLoading(false);
				});
			}
			function openArchive(kind, trigger) {
				setPickerPanel(null);
				if (!archivePanel) archiveReturnFocus.current = trigger;
				setGallerySelected(null);
				setArchivePanel(kind);
				if (kind === "gallery") loadGallery();
			}
			function saveGalleryBackground(item) {
				if (!item || !item.id) return;
				if (typeof item.dataUrl === "string" && item.dataUrl) bgCache.current = item.dataUrl;
				const selected = {
					...item,
					savedAsBg: true
				};
				setGallerySelected(selected);
				setGalleryItems((items) => items.map((entry) => ({
					...entry,
					savedAsBg: entry.id === item.id
				})));
				act("cg-save-bg", { id: item.id });
			}
			function pickerOption(props) {
				return react.default.createElement("button", {
					"aria-selected": props.selected,
					className: "whg-picker-option",
					disabled: pickerLoading,
					key: props.key,
					onClick: props.onChoose,
					role: "option",
					type: "button"
				}, react.default.createElement("span", null, react.default.createElement("span", { className: "whg-picker-option-main" }, props.title), props.subtitle ? react.default.createElement("span", { className: "whg-picker-option-sub" }, props.subtitle) : null), react.default.createElement("span", {
					className: "whg-picker-check",
					"aria-hidden": "true"
				}, props.selected ? "●" : ""));
			}
			function characterPicker() {
				if (pickerPanel !== "character") return null;
				const characters = Array.isArray(modelOptions && modelOptions.characters) ? modelOptions.characters : [];
				const mode = pluginSettings && pluginSettings.characterMode || s.characterMode || "follow";
				const selectedId = pluginSettings && pluginSettings.characterId || s.characterId || s.current;
				return react.default.createElement("div", {
					"aria-label": "选择出场角色",
					className: "whg-picker",
					id: "whg-character-picker",
					ref: pickerRef,
					role: "listbox"
				}, react.default.createElement("div", { className: "whg-picker-head" }, react.default.createElement("span", null, "CHARACTER SOURCE"), react.default.createElement("span", null, pickerLoading ? "读取中…" : String(characters.length + 1).padStart(2, "0"))), pickerOption({
					selected: mode !== "manual",
					title: "跟随工作区",
					subtitle: mainModelText(modelOptions),
					onChoose: () => updateRuntimeSettings({
						characterMode: "follow",
						characterId: null
					})
				}), characters.map((character, index) => pickerOption({
					key: String(character.id || index),
					selected: mode === "manual" && String(selectedId) === String(character.id),
					title: optionText(character, "角色 " + (index + 1)),
					subtitle: character.model ? String(character.model) : character.description ? String(character.description) : void 0,
					onChoose: () => updateRuntimeSettings({
						characterMode: "manual",
						characterId: String(character.id)
					})
				})), pickerError ? react.default.createElement("div", {
					className: "whg-bg-error",
					role: "alert"
				}, pickerError) : null);
			}
			function chatPicker() {
				if (pickerPanel !== "chat") return null;
				const models = Array.isArray(modelOptions && modelOptions.models) ? modelOptions.models : [];
				const mode = pluginSettings && pluginSettings.chatMode || s.chatMode || "configured";
				const selectedKey = selectionKey(pluginSettings && pluginSettings.chatSelection || s.chatSelection);
				const configuredLabel = optionText(modelOptions && modelOptions.configuredSelection, s.configuredChatModelLabel || s.defaultChatModelLabel || s.chatModelLabel || s.lastModel || "插件配置模型");
				return react.default.createElement("div", {
					"aria-label": "选择对话模型",
					className: "whg-picker",
					id: "whg-chat-picker",
					ref: pickerRef,
					role: "listbox"
				}, react.default.createElement("div", { className: "whg-picker-head" }, react.default.createElement("span", null, "DIALOGUE MODEL"), react.default.createElement("span", null, pickerLoading ? "读取中…" : String(models.length + 2).padStart(2, "0"))), pickerOption({
					selected: mode === "configured" || !pluginSettings && !s.chatMode,
					title: "使用插件默认模型",
					subtitle: configuredLabel,
					onChoose: () => updateRuntimeSettings({
						chatMode: "configured",
						chatSelection: null
					})
				}), pickerOption({
					selected: mode === "main",
					title: "跟随工作区",
					subtitle: mainModelText(modelOptions),
					onChoose: () => updateRuntimeSettings({
						chatMode: "main",
						chatSelection: null
					})
				}), models.map((model, index) => {
					const key = selectionKey(model);
					return pickerOption({
						key: key || String(index),
						selected: mode === "manual" && key === selectedKey,
						title: optionText(model, "模型 " + (index + 1)),
						subtitle: [model.provider, model.model].filter(Boolean).join(" · "),
						onChoose: () => updateRuntimeSettings({
							chatMode: "manual",
							chatSelection: {
								provider: String(model.provider || ""),
								model: String(model.model || model.id || "")
							}
						})
					});
				}), pickerError ? react.default.createElement("div", {
					className: "whg-bg-error",
					role: "alert"
				}, pickerError) : null);
			}
			function backgroundPicker() {
				if (pickerPanel !== "background") return null;
				const visiblePreview = backgroundPreview || bgCache.current;
				const hasSavedBackground = !!s && (s.bg === "custom" || s.bg === "cg");
				return react.default.createElement("div", {
					"aria-label": "修改 galgame 背景图",
					className: "whg-picker right whg-bg-picker",
					id: "whg-background-picker",
					ref: pickerRef,
					role: "dialog"
				}, react.default.createElement("div", { className: "whg-picker-head" }, react.default.createElement("span", null, "BACKGROUND FILE"), react.default.createElement("span", null, backgroundPreview ? "预览" : hasSavedBackground ? "使用中" : "默认")), visiblePreview ? react.default.createElement("img", {
					className: "whg-bg-preview",
					src: visiblePreview,
					alt: backgroundPreview ? "待应用背景预览" : "当前 galgame 背景"
				}) : react.default.createElement("div", { className: "whg-bg-empty" }, "选择一张本地图片后在这里预览"), react.default.createElement("div", { className: "whg-picker-note" }, "图片只会保存在本工作区，并只用于 galgame 界面。建议使用横向 16:9 图片。"), react.default.createElement("input", {
					accept: "image/png,image/jpeg,image/webp,image/avif",
					className: "whg-bg-file",
					onChange: chooseBackgroundFile,
					ref: bgFileRef,
					type: "file"
				}), react.default.createElement("div", { className: "whg-bg-actions" }, react.default.createElement("button", {
					className: "whg-btn",
					disabled: pickerLoading,
					onClick: () => bgFileRef.current?.click(),
					type: "button"
				}, backgroundPreview ? "重新选择" : "上传图片"), backgroundPreview ? react.default.createElement("button", {
					className: "whg-cg-btn",
					disabled: pickerLoading,
					onClick: applyBackgroundUpload,
					type: "button"
				}, pickerLoading ? "保存中…" : "应用这张背景") : null, backgroundPreview ? react.default.createElement("button", {
					className: "whg-btn",
					disabled: pickerLoading,
					onClick: () => {
						setBackgroundPreview(null);
						setBackgroundFileName("");
						setPickerError("");
					},
					type: "button"
				}, "取消预览") : null, hasSavedBackground ? react.default.createElement("button", {
					className: "whg-btn",
					disabled: pickerLoading,
					onClick: restoreDefaultBackground,
					type: "button"
				}, "恢复默认") : null), pickerError ? react.default.createElement("div", {
					className: "whg-bg-error",
					role: "alert"
				}, pickerError) : null);
			}
			function spritePicker() {
				if (pickerPanel !== "sprite") return null;
				const defaultSprite = art(s && s.sprite);
				const visiblePreview = spritePreview || customSprite || defaultSprite;
				const hasSavedSprite = !!customSprite || !!(s && (s.hasCustomSprite === true || s.customSprite === true || s.spriteMode === "custom"));
				return react.default.createElement("div", {
					"aria-label": "修改" + (s && s.name ? s.name : "当前角色") + "的角色立绘",
					className: "whg-picker right whg-sprite-picker",
					id: "whg-sprite-picker",
					ref: pickerRef,
					role: "dialog"
				}, react.default.createElement("div", { className: "whg-picker-head" }, react.default.createElement("span", null, "CHARACTER PORTRAIT"), react.default.createElement("span", null, spritePreview ? "预览" : hasSavedSprite ? "使用中" : "默认")), visiblePreview ? react.default.createElement("div", { className: "whg-sprite-preview-shell" }, react.default.createElement("img", {
					alt: spritePreview ? "待应用立绘预览" : (s && s.name ? s.name : "当前角色") + "的当前立绘",
					className: "whg-sprite-preview",
					src: visiblePreview
				})) : react.default.createElement("div", { className: "whg-bg-empty" }, "选择一张本地图片后在这里预览"), react.default.createElement("div", { className: "whg-picker-note" }, "当前角色 · " + (s && s.name ? s.name : "未识别") + "。立绘按角色分别保存，只用于本工作区；建议使用透明背景的竖向图片。"), react.default.createElement("input", {
					accept: "image/png,image/jpeg,image/webp,image/avif",
					className: "whg-bg-file",
					onChange: chooseSpriteFile,
					ref: spriteFileRef,
					type: "file"
				}), react.default.createElement("div", { className: "whg-bg-actions" }, react.default.createElement("button", {
					className: "whg-btn",
					disabled: pickerLoading,
					onClick: () => spriteFileRef.current?.click(),
					type: "button"
				}, spritePreview ? "重新选择" : "上传图片"), spritePreview ? react.default.createElement("button", {
					className: "whg-cg-btn",
					disabled: pickerLoading,
					onClick: applySpriteUpload,
					type: "button"
				}, pickerLoading ? "保存中…" : "应用这张立绘") : null, react.default.createElement("button", {
					className: "whg-btn",
					disabled: pickerLoading,
					onClick: () => closePicker(),
					type: "button"
				}, "取消"), hasSavedSprite ? react.default.createElement("button", {
					className: "whg-btn",
					disabled: pickerLoading,
					onClick: restoreDefaultSprite,
					type: "button"
				}, "恢复默认") : null), pickerError ? react.default.createElement("div", {
					className: "whg-bg-error",
					role: "alert"
				}, pickerError) : null);
			}
			function archiveDrawer() {
				if (!archivePanel || !s) return null;
				const history = Array.isArray(s.history) ? s.history : [];
				const galleryCount = typeof s.galleryCount === "number" ? s.galleryCount : galleryItems.length;
				const isHistory = archivePanel === "history";
				const recordCount = isHistory ? history.length : galleryCount;
				const kicker = "DEEP-SEA ARCHIVE · " + (isHistory ? "LOG " : "CG ") + String(recordCount).padStart(3, "0");
				let body;
				if (isHistory) body = history.length === 0 ? react.default.createElement("div", { className: "whg-archive-empty" }, "还没有对话记录。和" + s.name + "说句话，第一份深海档案就会在这里归档。") : react.default.createElement("div", { className: "whg-history" }, history.map((line, index) => {
					const who = line && line.who === "heroine" ? s.name : line && line.who === "user" ? "主人" : "旁白";
					const kind = line && line.who ? String(line.who) : "narrator";
					return react.default.createElement("div", {
						className: "whg-history-row " + kind,
						key: index + "-" + kind
					}, react.default.createElement("div", { className: "whg-history-who" }, who), react.default.createElement("p", { className: "whg-history-text" }, line && typeof line.text === "string" ? line.text : ""));
				}));
				else if (gallerySelected) body = react.default.createElement("div", { className: "whg-gallery-detail" }, react.default.createElement("button", {
					className: "whg-archive-back",
					onClick: () => setGallerySelected(null),
					type: "button"
				}, "← 返回图鉴"), gallerySelected.dataUrl ? react.default.createElement("img", {
					className: "whg-gallery-full",
					src: gallerySelected.dataUrl,
					alt: (gallerySelected.name || s.name) + "的特殊CG"
				}) : react.default.createElement("div", { className: "whg-archive-empty" }, "这张 CG 暂时无法读取。"), react.default.createElement("div", { className: "whg-gallery-caption" }, react.default.createElement("strong", null, "Lv." + (gallerySelected.level || "?")), react.default.createElement("span", null, (gallerySelected.name || s.name) + " · " + formatCgDate(gallerySelected.at))), gallerySelected.prompt ? react.default.createElement("p", { className: "whg-gallery-prompt" }, gallerySelected.prompt) : null, react.default.createElement("button", {
					className: "whg-cg-btn",
					disabled: busy || gallerySelected.savedAsBg === true,
					onClick: () => saveGalleryBackground(gallerySelected),
					type: "button"
				}, gallerySelected.savedAsBg ? "当前galgame背景" : "设为galgame背景"));
				else if (galleryLoading) body = react.default.createElement("div", {
					className: "whg-archive-empty",
					role: "status"
				}, "正在打开深海图鉴柜……");
				else if (galleryError) body = react.default.createElement("div", {
					className: "whg-archive-error",
					role: "alert"
				}, "CG 图鉴读取失败：" + galleryError, react.default.createElement("button", {
					className: "whg-btn",
					onClick: loadGallery,
					type: "button"
				}, "重新读取"));
				else if (galleryItems.length === 0) body = react.default.createElement("div", { className: "whg-archive-empty" }, "图鉴柜还是空的。提升等级后，收到的特殊 CG 会依角色分别收藏在这里。");
				else body = react.default.createElement("div", { className: "whg-gallery" }, galleryItems.map((item, index) => react.default.createElement("button", {
					"aria-label": "查看" + (item.name || s.name) + " Lv." + (item.level || "?") + " 特殊CG",
					className: "whg-gallery-card",
					key: item.id || index,
					onClick: () => setGallerySelected(item),
					type: "button"
				}, item.dataUrl ? react.default.createElement("img", {
					className: "whg-gallery-thumb",
					src: item.dataUrl,
					alt: "",
					loading: "lazy"
				}) : react.default.createElement("div", { className: "whg-gallery-thumb whg-gallery-placeholder" }, "CG"), item.savedAsBg ? react.default.createElement("span", { className: "whg-gallery-bg" }, "背景中") : null, react.default.createElement("span", { className: "whg-gallery-meta" }, react.default.createElement("span", { className: "whg-gallery-level" }, "Lv." + (item.level || "?")), react.default.createElement("span", { className: "whg-gallery-date" }, (item.name || s.name) + " · " + formatCgDate(item.at))))));
				return react.default.createElement("div", {
					className: "whg-archive-scrim",
					onMouseDown: (event) => {
						if (event.target === event.currentTarget) closeArchive();
					}
				}, react.default.createElement("aside", {
					"aria-labelledby": "whg-archive-title",
					"aria-modal": "true",
					className: "whg-archive",
					ref: archiveRef,
					role: "dialog"
				}, react.default.createElement("div", {
					className: "whg-archive-spine",
					"aria-hidden": "true"
				}, "DEEP-SEA ARCHIVE"), react.default.createElement("header", { className: "whg-archive-head" }, react.default.createElement("div", { className: "whg-archive-heading" }, react.default.createElement("div", { className: "whg-archive-kicker" }, kicker), react.default.createElement("h2", {
					className: "whg-archive-title",
					id: "whg-archive-title"
				}, isHistory ? "对话历史" : "CG图鉴")), react.default.createElement("button", {
					"aria-label": "关闭" + (isHistory ? "对话历史" : "CG图鉴"),
					className: "whg-archive-close",
					onClick: closeArchive,
					ref: archiveCloseRef,
					type: "button"
				}, "×")), react.default.createElement("div", {
					className: "whg-archive-body",
					ref: isHistory ? historyScrollRef : void 0
				}, body)));
			}
			function topbar(showBack) {
				const characterModel = s.characterModelLabel || s.modelLabel || "";
				const chatModel = s.chatModelLabel || s.lastModel || "";
				const petEnabled = s.petEnabled !== false;
				const galleryCount = typeof s.galleryCount === "number" ? s.galleryCount : 0;
				const characterMode = pluginSettings && pluginSettings.characterMode || s.characterMode || "follow";
				const chatMode = pluginSettings && pluginSettings.chatMode || s.chatMode || "configured";
				return react.default.createElement("div", { className: "whg-top" }, react.default.createElement("span", { className: "whg-title" }, "与" + s.name + "的galgame"), react.default.createElement("div", { className: "whg-chip-wrap" }, react.default.createElement("button", {
					"aria-controls": "whg-character-picker",
					"aria-expanded": pickerPanel === "character",
					"aria-haspopup": "listbox",
					className: "whg-chip whg-chip-button",
					onClick: (event) => openPicker("character", event.currentTarget),
					title: "点击切换出场角色。当前" + (characterMode === "manual" ? "已固定" : "跟随工作区") + "：" + (characterModel || "未识别"),
					type: "button"
				}, react.default.createElement("span", { className: "whg-dot" + (s.modelOnline ? "" : " off") }), react.default.createElement("span", null, "角色来源 · "), react.default.createElement("strong", null, characterModel || "未识别"), react.default.createElement("span", {
					className: "whg-chip-caret",
					"aria-hidden": "true"
				}, "▼")), characterPicker()), react.default.createElement("div", { className: "whg-chip-wrap" }, react.default.createElement("button", {
					"aria-controls": "whg-chat-picker",
					"aria-expanded": pickerPanel === "chat",
					"aria-haspopup": "listbox",
					className: "whg-chip whg-chip-button",
					onClick: (event) => openPicker("chat", event.currentTarget),
					title: "点击切换 galgame 对话模型。当前模式：" + (chatMode === "manual" ? "单独指定" : chatMode === "main" ? "跟随工作区" : "插件默认") + "；实际使用：" + (chatModel || "离线"),
					type: "button"
				}, react.default.createElement("span", { className: "whg-dot" + (chatModel && !s.fallbackUsed ? "" : " off") }), react.default.createElement("span", null, "实际对话 · "), react.default.createElement("strong", null, chatModel || "离线"), react.default.createElement("span", {
					className: "whg-chip-caret",
					"aria-hidden": "true"
				}, "▼")), chatPicker()), react.default.createElement("div", { className: "whg-spacer" }), react.default.createElement("div", { className: "whg-top-actions" }, react.default.createElement("div", { className: "whg-chip-wrap" }, react.default.createElement("button", {
					"aria-controls": "whg-background-picker",
					"aria-expanded": pickerPanel === "background",
					"aria-haspopup": "dialog",
					className: "whg-btn",
					onClick: (event) => openPicker("background", event.currentTarget),
					type: "button"
				}, "背景图"), backgroundPicker()), react.default.createElement("div", { className: "whg-chip-wrap" }, react.default.createElement("button", {
					"aria-controls": "whg-sprite-picker",
					"aria-expanded": pickerPanel === "sprite",
					"aria-haspopup": "dialog",
					className: "whg-btn",
					onClick: (event) => openPicker("sprite", event.currentTarget),
					title: "为" + (s.name || "当前角色") + "上传本地角色立绘",
					type: "button"
				}, "角色立绘"), spritePicker()), react.default.createElement("button", {
					"aria-expanded": archivePanel === "history",
					className: "whg-btn",
					onClick: (event) => openArchive("history", event.currentTarget),
					type: "button"
				}, "对话历史"), react.default.createElement("button", {
					"aria-expanded": archivePanel === "gallery",
					className: "whg-btn",
					onClick: (event) => openArchive("gallery", event.currentTarget),
					type: "button"
				}, "CG图鉴", galleryCount > 0 ? react.default.createElement("span", { className: "whg-count" }, galleryCount) : null), react.default.createElement("button", {
					"aria-pressed": petEnabled,
					className: "whg-btn",
					disabled: busy,
					onClick: () => act("pet-set", { enabled: !petEnabled }),
					title: petEnabled ? "关闭桌宠，避免与其他悬浮插件冲突" : "开启可跳转 galgame 的桌宠",
					type: "button"
				}, "桌宠 · " + (petEnabled ? "开" : "关")), react.default.createElement("button", {
					className: "whg-btn",
					title: "重新开始（清零等级与好感度）",
					onClick: (e) => {
						e.stopPropagation();
						if (armReset) {
							setArmReset(false);
							act("reset");
						} else setArmReset(true);
					},
					type: "button"
				}, armReset ? "确认?" : "↺"), showBack ? react.default.createElement("button", {
					className: "whg-btn back",
					title: "回到办公区（角色会继续在桌宠状态陪你）",
					onClick: (e) => {
						e.stopPropagation();
						setOpen(false);
					},
					type: "button"
				}, "返回办公区") : null));
			}
			function stage() {
				const emotion = emotionOf();
				const mood = moodOf();
				let src;
				let useFilter = !s.moodSprites;
				let emoKey = "";
				if (customSprite) {
					src = customSprite;
					useFilter = true;
				} else if (s.current === "deepseek") {
					emoKey = emotion === "normal" ? "" : EMOTION_ART[emotion];
					src = emoKey ? art(emoKey) : art(s.sprite);
					useFilter = !emoKey;
				} else if (s.moods) {
					src = art(s.moods[mood]) || art(s.moods.normal);
					if (!src) src = art(s.sprite);
				} else src = art(s.sprite);
				const wrap = !src || imgFail ? react.default.createElement("div", { className: "whg-sprite-fallback" }, "🐋") : react.default.createElement("img", {
					className: "whg-sprite" + (s.portrait ? " whg-sprite-portrait" : "") + (customSprite ? " whg-sprite-custom" : ""),
					src,
					alt: s.name,
					draggable: false,
					onError: () => {
						setImgFail(true);
					}
				});
				const blushOpacity = emoKey ? 0 : mood === "shy" ? .55 : mood === "happy" ? .3 : 0;
				return react.default.createElement("div", { className: "whg-stage" }, react.default.createElement("div", {
					className: "whg-tint",
					style: { background: "radial-gradient(closest-side, " + s.color + "2e, transparent)" }
				}), react.default.createElement("div", { className: "whg-sprite-wrap" + (s.portrait ? " whg-portrait" : "") + (useFilter ? " whg-mood-" + mood : "") }, wrap, react.default.createElement("div", {
					className: "whg-blush",
					style: { opacity: blushOpacity }
				})));
			}
			function dialogue() {
				const last = lastLine();
				const plateLabel = last ? last.who === "heroine" ? s.name : last.who === "user" ? "主人" : "旁白" : s.name;
				const plateClass = last ? last.who === "heroine" ? "" : " " + last.who : "";
				const plateColor = last ? last.who === "heroine" ? s.color : last.who === "user" ? "#ff9cc8" : "#8fb4dd" : s.color;
				const choices = last && last.who === "heroine" && s.choices && s.choices.length > 0 ? react.default.createElement("div", { className: "whg-choices" }, s.choices.map((c, i) => {
					const choiceText = typeof c === "string" ? c : c && typeof c.text === "string" ? c.text : "";
					const choiceId = typeof c === "object" && c && c.id !== void 0 ? String(c.id) : void 0;
					return react.default.createElement("button", {
						key: choiceId || i,
						className: "whg-choice",
						disabled: busy || !choiceText,
						onClick: () => {
							act("chat", choiceId ? {
								choiceId,
								text: choiceText
							} : { text: choiceText });
						},
						type: "button"
					}, choiceText);
				})) : null;
				const input = react.default.createElement("div", { className: "whg-input-row" }, react.default.createElement("input", {
					className: "whg-input",
					value: text,
					placeholder: "回复 " + s.name + " …",
					disabled: busy,
					onChange: (e) => {
						setText(e.target.value);
					},
					onKeyDown: (e) => {
						if (e.key === "Enter") send();
					}
				}), react.default.createElement("button", {
					className: "whg-send",
					disabled: busy || !text.trim(),
					onClick: send
				}, "回复"));
				const fallbackNote = s.fallbackUsed ? react.default.createElement("div", { className: "whg-fallback-note" }, "（模型调用失败，" + s.name + " 用了备用台词。原因：" + (s.fallbackReason || "未知") + " · 目标模型：" + (s.lastModel || s.modelLabel || "未知") + "）") : null;
				const now = last ? react.default.createElement("div", {
					key: "now-" + (s.history || []).length,
					className: "whg-line-now " + last.who
				}, last.text) : react.default.createElement("div", { className: "whg-line-now narrator" }, "（点击输入框，开始和" + s.name + "对话吧）");
				return react.default.createElement("div", {
					id: "whg-panel",
					className: "whg-panel"
				}, react.default.createElement("div", {
					className: "whg-plate" + plateClass,
					style: { background: plateColor }
				}, plateLabel), react.default.createElement("div", { className: "whg-level" }, react.default.createElement("span", null, "Lv." + s.level + " · 好感度 " + s.affection + "/" + s.cap), react.default.createElement("div", { className: "whg-level-track" }, react.default.createElement("div", {
					className: "whg-level-fill",
					style: { width: Math.min(100, Math.round(s.affection / Math.max(1, s.cap) * 100)) + "%" }
				}))), now, fallbackNote, choices, input);
			}
			function cgModal() {
				if (!settled || !s || !s.cg) return null;
				if (s.cg.status === "generating") return react.default.createElement("div", { className: "whg-toast" }, "🎨 正在绘制 Lv 纪念 CG……（约半分钟）");
				if (s.cg.status === "failed" && !s.cg.seen) return react.default.createElement("div", {
					className: "whg-toast",
					onClick: () => {
						act("cg-ack");
					}
				}, "⚠️ CG 生成失败：" + (s.cg.error || "未知错误") + "（点击关闭）");
				if (s.cg.status === "ready" && !s.cg.seen && s.cg.dataUrl) return react.default.createElement("div", {
					"aria-modal": "true",
					className: "whg-cg-backdrop",
					role: "dialog"
				}, react.default.createElement("div", { className: "whg-cg-title" }, "🎁 升级啦 · " + (s.cg.name || s.name) + "送给你的特殊CG"), react.default.createElement("img", {
					className: "whg-cg-img",
					src: s.cg.dataUrl,
					alt: (s.cg.name || s.name) + "送给你的特殊CG"
				}), react.default.createElement("div", { className: "whg-cg-btns" }, s.cg.savedAsBg ? react.default.createElement("button", {
					className: "whg-cg-btn alt",
					onClick: () => {
						bgCache.current = null;
						act("cg-clear-bg");
					},
					type: "button"
				}, "恢复默认背景") : react.default.createElement("button", {
					className: "whg-cg-btn",
					onClick: () => {
						if (s.cg && s.cg.dataUrl) bgCache.current = s.cg.dataUrl;
						act("cg-save-bg");
					},
					type: "button"
				}, "保存为galgame界面背景"), react.default.createElement("button", {
					className: "whg-cg-btn alt",
					onClick: () => {
						act("cg-ack");
					},
					type: "button"
				}, "收下并关闭")));
				return null;
			}
			if (props.variant === "tab") {
				if (s === null) return react.default.createElement("div", {
					id: "whg-tab-root",
					className: "whg-root-tab"
				}, react.default.createElement("div", { className: "whg-bg whg-bg-fallback" }), react.default.createElement("div", { className: "whg-toast" }, apiError ? "⚠️ " + apiError : "连接 galgame 服务中…"));
				if (s.enabled === false) return react.default.createElement("div", {
					id: "whg-tab-root",
					className: "whg-root-tab"
				}, react.default.createElement("div", { className: "whg-disabled" }, react.default.createElement("div", { className: "whg-disabled-card" }, react.default.createElement("h2", null, "鲸鱼娘 Galgame 已关闭"), react.default.createElement("p", null, "在左侧“设置 → 插件 → 插件配置”中展开鲸鱼娘 Galgame，即可重新开启。"))));
				const bgSrc = s.bg === "cg" || s.bg === "custom" ? bgCache.current : art(s.bg);
				const bgEl = bgSrc ? react.default.createElement("img", {
					className: "whg-bg",
					src: bgSrc,
					alt: "",
					draggable: false
				}) : react.default.createElement("div", { className: "whg-bg whg-bg-fallback" });
				return react.default.createElement("div", {
					id: "whg-tab-root",
					className: "whg-root-tab"
				}, bgEl, react.default.createElement("div", { className: "whg-vignette" }), topbar(false), stage(), dialogue(), archiveDrawer(), cgModal());
			}
			if (!open) {
				const petEnabled = !!s && s.enabled !== false && s.petEnabled !== false;
				return react.default.createElement(react.default.Fragment, null, petEnabled ? react.default.createElement(Pet, {
					useSessions: props.useSessions,
					onOpen: () => {
						if (s !== null && !activateGalgameTab()) setOpen(true);
					}
				}) : null, s === null ? react.default.createElement("div", { className: "whg-toast" }, apiError ? "⚠️ " + apiError : "连接 galgame 服务中…") : apiError ? react.default.createElement("div", { className: "whg-toast" }, "⚠️ " + apiError) : null);
			}
			if (s.enabled === false) return react.default.createElement(react.default.Fragment, null);
			const bgSrc = s.bg === "cg" || s.bg === "custom" ? bgCache.current : art(s.bg);
			const bgEl = bgSrc ? react.default.createElement("img", {
				className: "whg-bg",
				src: bgSrc,
				alt: "",
				draggable: false
			}) : react.default.createElement("div", { className: "whg-bg whg-bg-fallback" });
			return react.default.createElement("div", { className: "whg-root" }, bgEl, react.default.createElement("div", { className: "whg-vignette" }), topbar(true), stage(), dialogue(), archiveDrawer(), cgModal());
		}
		const name = "whale-galgame";
		const inject = ["slots"];
		function apply(ctx) {
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-whale-galgame";
			style.textContent = CSS;
			document.head.appendChild(style);
			const slots = ctx.slots || ctx.get("slots");
			if (slots === void 0 || typeof slots.inject !== "function") {
				const hostRoot = document.createElement("div");
				document.body.appendChild(hostRoot);
				const root = (0, react_dom_client.createRoot)(hostRoot);
				root.render(react.default.createElement(App, { useSessions: null }));
				ctx.effect(() => () => {
					root.unmount();
					hostRoot.remove();
					style.remove();
				}, "dsh-whale-galgame: direct-mount overlay");
				return;
			}
			slots.inject("shell.overlay", () => {
				return slots.register({
					name: "shell.overlay",
					id: "whale-galgame",
					order: 900
				}, (slotProps) => {
					return react.default.createElement(App, { useSessions: slotProps && slotProps.useSessions });
				});
			});
			slots.inject("conversation.view", () => slots.register({
				name: "conversation.view",
				id: "galgame",
				order: 100,
				label: "galgame"
			}, () => react.default.createElement(App, {
				useSessions: null,
				variant: "tab"
			})));
			slots.inject("settings.plugin.item", () => slots.register({
				name: "settings.plugin.item",
				id: "whale-galgame",
				order: 30
			}, () => react.default.createElement(PluginSettingsCard)));
			ctx.effect(() => () => {
				style.remove();
			}, "dsh-whale-galgame: pet + galgame overlay");
			const enforcer = setInterval(() => {
				ensureSkin(document.body.hasAttribute("data-whale-galgame-active"));
			}, 1500);
			if (!document.body.hasAttribute("data-whale-galgame-active")) ensureSkin(false);
			const skinAttrObserver = new MutationObserver(() => {
				if (!document.body.hasAttribute("data-whale-galgame-active")) ensureSkin(false);
			});
			skinAttrObserver.observe(document.body, {
				attributes: true,
				attributeFilter: ["data-dsh-maid-atelier"]
			});
			const skinNodeObserver = new MutationObserver((records) => {
				if (document.body.hasAttribute("data-whale-galgame-active")) return;
				for (const r of records) for (const n of Array.from(r.addedNodes)) {
					const el = n;
					if (el && el.nodeType === 1 && typeof el.getAttribute === "function" && el.getAttribute("data-skin-owner") === "maid-atelier") el.style.display = "none";
				}
			});
			skinNodeObserver.observe(document.body, {
				childList: true,
				subtree: true
			});
			ctx.effect(() => () => {
				clearInterval(enforcer);
				skinAttrObserver.disconnect();
				skinNodeObserver.disconnect();
				ensureSkin(false);
				setComposerHidden(false);
			}, "dsh-whale-galgame: skin enforcer");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map