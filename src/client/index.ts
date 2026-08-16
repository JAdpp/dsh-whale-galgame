/**
 * dsh-whale-galgame — browser client half.
 * Q版桌宠 is the default form on the main UI; clicking it opens the
 * fullscreen one-line-per-screen visual novel. The heroine follows the
 * main UI's current model; three dialogue options are generated after
 * every reply; level-up CG rewards pop as modals and may be saved inside
 * the galgame scene without changing the workspace background.
 */
import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { WHALE_ART } from './art.generated'

const CSS = [
  // ── pet ────────────────────────────────────────────────────────────────
  '.whg-pet{--whg-scale:1.15;--whg-y:0px;position:fixed;right:18px;bottom:124px;width:calc(192px * var(--whg-scale));height:calc(208px * var(--whg-scale));padding:0;border:0;border-radius:18px;background:transparent;cursor:zoom-in;filter:drop-shadow(0 10px 16px rgb(0 0 0 / 36%));transition:width 180ms ease,height 180ms ease,filter 180ms ease;z-index:9999}',
  '.whg-pet[data-mode="running"]{--whg-y:-1456px}',
  '.whg-pet[data-mode="waiting"]{--whg-y:-1248px}',
  '.whg-pet-sprite{display:block;width:192px;height:208px;background-repeat:no-repeat;background-size:1536px 2288px;background-position:0 var(--whg-y);transform:scale(var(--whg-scale));transform-origin:left top;animation:whgPetFrames 1.7s step-end infinite}',
  '.whg-pet[data-mode="running"] .whg-pet-sprite{animation-duration:900ms}',
  '.whg-pet[data-mode="waiting"] .whg-pet-sprite{animation-duration:1.35s}',
  '.whg-pet[data-looking="true"] .whg-pet-sprite{animation:none;background-position:var(--whg-look-x) var(--whg-look-y)}',
  '@keyframes whgPetFrames{0%,16.66%{background-position:0 var(--whg-y)}16.67%,33.32%{background-position:-192px var(--whg-y)}33.33%,49.99%{background-position:-384px var(--whg-y)}50%,66.65%{background-position:-576px var(--whg-y)}66.66%,83.32%{background-position:-768px var(--whg-y)}83.33%,99.99%{background-position:-960px var(--whg-y)}100%{background-position:0 var(--whg-y)}}',
  '.whg-pet-status{position:absolute;right:8px;bottom:-28px;max-width:184px;overflow:hidden;padding:5px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;color:var(--dsw-alias-text-secondary);background:color-mix(in srgb,var(--dsw-alias-bg-base) 88%,transparent);font:12px/1.2 system-ui,sans-serif;text-overflow:ellipsis;white-space:nowrap;opacity:0;transform:translateY(4px);transition:opacity 150ms ease,transform 150ms ease;pointer-events:none}',
  '.whg-pet:hover .whg-pet-status,.whg-pet:focus-visible .whg-pet-status{opacity:1;transform:translateY(0)}',
  '.whg-pet:focus-visible{outline:2px solid var(--dsw-alias-border-l3);outline-offset:4px}',
  '@media (max-width:760px){.whg-pet{--whg-scale:.9;right:8px;bottom:106px}}',
  '@media (prefers-reduced-motion:reduce){.whg-pet-sprite{animation:none}}',
  // ── fullscreen VN ──────────────────────────────────────────────────────
  '.whg-root{position:fixed;inset:0;z-index:8000;font-family:system-ui,"Segoe UI","Microsoft YaHei",sans-serif;user-select:none;pointer-events:auto;overflow:hidden;background:#050b18;color:#eaf5ff}',
  '.whg-root-tab{position:relative;flex:1 1 0;width:100%;height:100%;min-height:0;box-sizing:border-box;z-index:auto;font-family:system-ui,"Segoe UI","Microsoft YaHei",sans-serif;user-select:none;overflow:hidden;background:#050b18;color:#eaf5ff;border:0;border-radius:0}',
  '.whg-root-tab .whg-sprite-wrap{height:88vh;margin-bottom:0}',
  '.whg-root-tab .whg-panel{min-height:20vh;max-height:30vh;bottom:0;border-radius:16px}',
  '.whg-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.94)}',
  '.whg-bg-fallback{background:linear-gradient(180deg,#0a1e3d,#06203f)}',
  '.whg-vignette{position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,8,20,.4) 0%,rgba(3,8,20,0) 28%,rgba(3,8,20,0) 55%,rgba(3,8,20,.82) 100%);pointer-events:none}',
  '.whg-top{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:10px;padding:14px 20px;z-index:5}',
  '.whg-title{font-size:17px;font-weight:800;letter-spacing:1px;color:#dcecff;text-shadow:0 2px 12px rgba(0,20,60,.9)}',
  '.whg-chip-wrap{position:relative;display:flex;min-width:0}',
  '.whg-chip{display:flex;align-items:center;gap:6px;min-width:0;white-space:nowrap;font-size:11px;color:#bcd6f2;background:rgba(6,18,38,.55);border:1px solid rgba(140,200,255,.25);border-radius:999px;padding:4px 10px;font-family:inherit}',
  '.whg-chip-button{appearance:none;cursor:pointer;text-align:left;transition:border-color .16s ease,background .16s ease}',
  '.whg-chip-button:hover,.whg-chip-button[aria-expanded="true"]{border-color:rgba(159,232,255,.58);background:rgba(16,49,72,.82)}',
  '.whg-chip-button:focus-visible{outline:2px solid #9fe8ff;outline-offset:2px}',
  '.whg-chip strong{max-width:170px;overflow:hidden;color:#eff9ff;font-weight:700;text-overflow:ellipsis}',
  '.whg-chip-caret{color:#8bc8da;font-size:9px;transition:transform .16s ease}',
  '.whg-chip-button[aria-expanded="true"] .whg-chip-caret{transform:rotate(180deg)}',
  '.whg-dot{width:7px;height:7px;border-radius:50%;background:#46d98a;box-shadow:0 0 8px #46d98a}',
  '.whg-dot.off{background:#8aa0bd;box-shadow:none}',
  '.whg-spacer{flex:1}',
  '.whg-top-actions{display:flex;align-items:center;gap:8px}',
  '.whg-btn{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:#cfe6ff;border-radius:10px;padding:6px 12px;font-size:13px;cursor:pointer;line-height:1.3;font-family:inherit}',
  '.whg-btn:hover{background:rgba(255,255,255,.18)}',
  '.whg-btn:focus-visible,.whg-choice:focus-visible,.whg-cg-btn:focus-visible{outline:2px solid #9fe8ff;outline-offset:2px}',
  '.whg-btn[aria-pressed="true"]{border-color:rgba(126,222,244,.62);background:rgba(68,164,198,.24);color:#effcff}',
  '.whg-count{display:inline-grid;place-items:center;min-width:16px;height:16px;margin-left:5px;padding:0 4px;border-radius:999px;background:rgba(143,216,239,.18);color:#dff8ff;font:700 10px/1 Consolas,monospace}',
  '.whg-btn:disabled{opacity:.45;cursor:default}',
  '.whg-btn.back{background:linear-gradient(135deg,#2f7fd6,#7a5fd6);border:none;color:#fff;font-weight:700;padding:8px 16px;font-size:14px}',
  '.whg-picker{position:absolute;top:calc(100% + 8px);left:0;z-index:18;width:min(330px,calc(100vw - 28px));max-height:min(430px,70vh);overflow:auto;padding:7px;border:1px solid rgba(215,182,108,.48);border-radius:14px;background:linear-gradient(180deg,rgba(7,30,45,.985),rgba(3,17,31,.995));box-shadow:0 20px 55px rgba(0,5,16,.72);scrollbar-color:rgba(143,216,239,.45) transparent}',
  '.whg-picker.right{right:0;left:auto}',
  '.whg-picker-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 9px 9px;color:#d7c48f;font:700 10px/1.3 Consolas,monospace;letter-spacing:1.4px}',
  '.whg-picker-note{padding:7px 9px;color:#8fb1c5;font-size:11px;line-height:1.55}',
  '.whg-picker-option{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;width:100%;padding:9px 10px;border:0;border-radius:9px;background:transparent;color:#dff3ff;cursor:pointer;text-align:left;font-family:inherit}',
  '.whg-picker-option:hover,.whg-picker-option:focus-visible{background:rgba(143,216,239,.12);outline:none}',
  '.whg-picker-option[aria-selected="true"]{background:linear-gradient(90deg,rgba(47,127,214,.28),rgba(215,182,108,.12));color:#fff}',
  '.whg-picker-option-main{display:block;overflow:hidden;font-size:12px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}',
  '.whg-picker-option-sub{display:block;overflow:hidden;margin-top:2px;color:#83a9bd;font:10px/1.35 Consolas,monospace;text-overflow:ellipsis;white-space:nowrap}',
  '.whg-picker-check{color:#f0d99d;font-size:12px}',
  '.whg-bg-picker{width:min(360px,calc(100vw - 28px));padding:12px}',
  '.whg-bg-preview{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;margin:2px 0 10px;border:1px solid rgba(143,216,239,.28);border-radius:10px;background:#020a14}',
  '.whg-bg-empty{display:grid;place-items:center;width:100%;aspect-ratio:16/9;margin:2px 0 10px;border:1px dashed rgba(143,216,239,.28);border-radius:10px;color:#7f9cae;font-size:11px;background:rgba(1,10,20,.25)}',
  '.whg-bg-builtins{margin:2px 0 12px;padding:10px;border:1px solid rgba(143,216,239,.18);border-radius:11px;background:rgba(1,10,20,.24)}',
  '.whg-bg-builtins-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;color:#dff3ff;font-size:11px;font-weight:700}',
  '.whg-bg-builtins-role{max-width:170px;overflow:hidden;color:#83a9bd;font:10px/1.3 Consolas,monospace;text-overflow:ellipsis;white-space:nowrap}',
  '.whg-bg-builtins-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
  '.whg-bg-builtin{position:relative;min-width:0;overflow:hidden;padding:0;border:1px solid rgba(143,216,239,.2);border-radius:9px;background:#041422;color:#dff3ff;cursor:pointer;text-align:left;font-family:inherit}',
  '.whg-bg-builtin:hover,.whg-bg-builtin:focus-visible{border-color:rgba(143,216,239,.58);outline:none}',
  '.whg-bg-builtin[aria-pressed="true"]{border-color:rgba(215,182,108,.72);box-shadow:0 0 0 1px rgba(215,182,108,.18)}',
  '.whg-bg-builtin:only-child{grid-column:1/-1}',
  '.whg-bg-builtin:disabled{opacity:.48;cursor:default}',
  '.whg-bg-builtin-img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:#020a14}',
  '.whg-bg-builtin-fallback{display:grid;place-items:center;color:#607f91;font:10px/1.3 Consolas,monospace}',
  '.whg-bg-builtin-meta{display:flex;align-items:center;gap:5px;min-width:0;padding:7px 8px}',
  '.whg-bg-builtin-name{min-width:0;flex:1;overflow:hidden;font-size:11px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}',
  '.whg-bg-builtin-tag{flex:none;color:#d7c48f;font:700 9px/1 Consolas,monospace}',
  '.whg-bg-override-note{margin:-3px 0 9px;padding:7px 9px;border-left:2px solid rgba(215,182,108,.52);background:rgba(215,182,108,.07);color:#b9a978;font-size:10px;line-height:1.5}',
  '.whg-bg-actions{display:flex;flex-wrap:wrap;gap:7px}',
  '.whg-bg-file{display:none}',
  '.whg-bg-error{margin:8px 1px 0;color:#ffb5bd;font-size:11px;line-height:1.5}',
  '.whg-sprite-picker{width:min(340px,calc(100vw - 28px));padding:12px}',
  '.whg-sprite-preview-shell{position:relative;display:grid;place-items:end center;width:100%;height:min(48vh,360px);overflow:hidden;margin:2px 0 10px;border:1px solid rgba(143,216,239,.28);border-radius:12px;background-color:#061725;background-image:linear-gradient(45deg,rgba(143,216,239,.055) 25%,transparent 25%),linear-gradient(-45deg,rgba(143,216,239,.055) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,rgba(143,216,239,.055) 75%),linear-gradient(-45deg,transparent 75%,rgba(143,216,239,.055) 75%);background-position:0 0,0 8px,8px -8px,-8px 0;background-size:16px 16px;box-shadow:inset 0 -45px 70px rgba(0,8,18,.34)}',
  '.whg-sprite-preview{display:block;width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 12px 24px rgba(0,8,24,.5))}',
  '.whg-sprite-custom{max-width:min(70vw,100%);object-fit:contain;object-position:center bottom}',
  '.whg-stage{position:absolute;inset:0;z-index:2;pointer-events:none;display:flex;align-items:flex-end;justify-content:center}',
  '.whg-tint{position:absolute;inset:0}',
  '.whg-sprite-wrap{position:relative;margin-right:0;margin-bottom:0;height:96vh;display:flex;align-items:flex-end;transform:translateY(clamp(56px,12vh,96px)) scale(1.1);transform-origin:center top}',
  '.whg-sprite{height:100%;width:auto;display:block;filter:drop-shadow(0 18px 40px rgba(0,10,30,.65));transition:filter .5s ease}',
  '.whg-sprite-portrait{height:34vh;width:auto;border-radius:22px;box-shadow:0 10px 50px rgba(0,10,30,.7);background:rgba(6,18,38,.35)}',
  '.whg-mood-happy .whg-sprite{filter:drop-shadow(0 18px 40px rgba(0,10,30,.65)) brightness(1.1) saturate(1.2)}',
  '.whg-mood-shy .whg-sprite{filter:drop-shadow(0 18px 40px rgba(0,10,30,.65)) brightness(1.04) saturate(1.25) hue-rotate(-12deg)}',
  '.whg-mood-angry .whg-sprite{filter:drop-shadow(0 18px 40px rgba(0,10,30,.65)) saturate(1.15) contrast(1.06) hue-rotate(-26deg)}',
  '.whg-blush{position:absolute;left:14%;top:16%;width:72%;height:28%;background:radial-gradient(ellipse at center,rgba(255,120,160,.9),transparent 70%);border-radius:50%;mix-blend-mode:screen;transition:opacity .5s ease}',
  '.whg-sprite-fallback{height:100%;display:flex;align-items:center;font-size:20vh;filter:drop-shadow(0 18px 40px rgba(0,10,30,.6))}',
  '.whg-panel{position:absolute;left:5vw;right:5vw;bottom:2.6vh;min-height:26vh;max-height:38vh;background:linear-gradient(180deg,rgba(8,20,42,.9),rgba(4,12,28,.94));border:1px solid rgba(140,200,255,.22);border-radius:22px;backdrop-filter:blur(12px);padding:26px 30px 18px;z-index:4;box-shadow:0 24px 60px rgba(0,8,24,.6);display:flex;flex-direction:column}',
  '.whg-plate{position:absolute;top:-17px;left:26px;padding:6px 20px;border-radius:999px;font-weight:800;font-size:15px;color:#04121f;letter-spacing:2px;box-shadow:0 4px 16px rgba(0,10,30,.4)}',
  '.whg-plate.user{background:#ff9cc8}',
  '.whg-plate.narrator{background:#8fb4dd}',
  '.whg-level{position:absolute;top:14px;right:24px;display:flex;align-items:center;gap:8px;font-size:12px;color:#a9c6e8}',
  '.whg-level-track{width:140px;height:6px;border-radius:3px;background:rgba(255,255,255,.14);overflow:hidden}',
  '.whg-level-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#4aa8ff,#ff7ab8);transition:width .6s ease}',
  '.whg-line-now{font-size:clamp(16px,1.7vw,22px);line-height:1.8;animation:whgIn .45s ease;padding-top:6px}',
  '.whg-line-now.narrator{color:#8fb4dd;font-style:italic;font-size:clamp(14px,1.4vw,18px)}',
  '.whg-line-now.user{color:#ffd9ec}',
  '@keyframes whgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
  '.whg-fallback-note{font-size:11px;color:#e8b04b;margin-top:6px}',
  '.whg-choices{display:flex;flex-direction:column;gap:8px;margin-top:10px}',
  '.whg-choice{background:rgba(140,200,255,.1);border:1px solid rgba(140,200,255,.35);color:#dcebff;border-radius:14px;padding:9px 16px;font-size:clamp(13px,1.3vw,16px);cursor:pointer;text-align:left;line-height:1.5;font-family:inherit}',
  '.whg-choice:hover{background:rgba(140,200,255,.22);border-color:rgba(160,215,255,.65)}',
  '.whg-choice:disabled{opacity:.5;cursor:default}',
  '.whg-input-row{display:flex;gap:8px;margin-top:10px}',
  '.whg-input{flex:1;background:rgba(255,255,255,.09);border:1px solid rgba(140,200,255,.32);color:#eaf5ff;border-radius:14px;padding:10px 14px;font-size:clamp(13px,1.3vw,16px);outline:none;font-family:inherit;min-width:0}',
  '.whg-input:focus{border-color:rgba(160,215,255,.75)}',
  '.whg-send{background:linear-gradient(135deg,#2f7fd6,#7a5fd6);border:none;color:#fff;border-radius:14px;padding:0 20px;font-size:14px;cursor:pointer;font-weight:700;font-family:inherit}',
  '.whg-send:disabled{opacity:.5;cursor:default}',
  // ── CG reward ──────────────────────────────────────────────────────────
  '.whg-cg-backdrop{position:fixed;inset:0;z-index:9500;background:rgba(2,6,18,.85);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;backdrop-filter:blur(6px)}',
  '.whg-cg-img{max-width:80vw;max-height:72vh;border-radius:18px;box-shadow:0 24px 80px rgba(0,0,0,.7);border:2px solid rgba(140,200,255,.35)}',
  '.whg-cg-title{font-size:18px;font-weight:800;color:#dcecff;letter-spacing:1px}',
  '.whg-cg-btns{display:flex;gap:12px}',
  '.whg-cg-btn{background:linear-gradient(135deg,#2f7fd6,#7a5fd6);border:none;color:#fff;border-radius:12px;padding:9px 18px;font-size:14px;cursor:pointer;font-weight:700;font-family:inherit}',
  '.whg-cg-btn.alt{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#dcebff}',
  '.whg-toast{position:fixed;right:24px;bottom:24px;z-index:9600;background:rgba(6,18,38,.9);border:1px solid rgba(140,200,255,.3);color:#dcebff;border-radius:14px;padding:12px 18px;font-size:13px;font-family:system-ui,"Segoe UI","Microsoft YaHei",sans-serif;box-shadow:0 12px 40px rgba(0,8,24,.6);max-width:340px}',
  // ── deep-sea archive cabinet ───────────────────────────────────────────
  '.whg-archive-scrim{position:absolute;inset:0;z-index:20;background:linear-gradient(90deg,rgba(1,7,16,.26),rgba(1,7,16,.72));display:flex;justify-content:flex-end;animation:whgArchiveFade .18s ease}',
  '.whg-archive{--whg-brass:#d7b66c;position:relative;box-sizing:border-box;width:min(470px,calc(100% - 42px));height:100%;overflow:visible;color:#eaf7ff;background:linear-gradient(180deg,rgba(7,30,45,.985),rgba(3,17,31,.995));border-left:1px solid rgba(215,182,108,.58);box-shadow:-24px 0 70px rgba(0,5,16,.68),inset 8px 0 24px rgba(27,111,137,.08);display:flex;flex-direction:column;animation:whgArchiveSlide .28s cubic-bezier(.2,.8,.2,1)}',
  '.whg-archive:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.2;background:repeating-linear-gradient(180deg,transparent 0,transparent 46px,rgba(130,216,239,.13) 47px,transparent 48px)}',
  '.whg-archive-spine{position:absolute;left:-33px;top:92px;width:32px;padding:14px 0;border:1px solid rgba(215,182,108,.5);border-right:0;border-radius:9px 0 0 9px;background:#09283a;color:#d7c48f;writing-mode:vertical-rl;text-orientation:mixed;font:700 10px/1 Consolas,monospace;letter-spacing:3px;text-align:center;box-shadow:-8px 8px 22px rgba(0,5,16,.35)}',
  '.whg-archive-head{position:relative;z-index:1;display:flex;align-items:flex-start;gap:14px;padding:24px 24px 18px;border-bottom:1px solid rgba(215,182,108,.32)}',
  '.whg-archive-heading{min-width:0;flex:1}',
  '.whg-archive-kicker{margin-bottom:5px;color:#8fd8e9;font:700 10px/1.4 Consolas,"SFMono-Regular",monospace;letter-spacing:2.3px;text-transform:uppercase}',
  '.whg-archive-title{margin:0;color:#f3fbff;font-family:"STSong","Songti SC",Georgia,serif;font-size:24px;font-weight:700;letter-spacing:1px}',
  '.whg-archive-close{display:grid;place-items:center;flex:none;width:32px;height:32px;border:1px solid rgba(215,182,108,.36);border-radius:50%;background:rgba(3,14,25,.5);color:#dcefff;cursor:pointer;font-size:18px}',
  '.whg-archive-close:hover{background:rgba(130,216,239,.13)}',
  '.whg-archive-close:focus-visible,.whg-gallery-card:focus-visible,.whg-archive-back:focus-visible{outline:2px solid #9fe8ff;outline-offset:2px}',
  '.whg-archive-body{position:relative;z-index:1;min-height:0;flex:1;overflow-y:auto;padding:18px 22px 28px;scrollbar-color:rgba(143,216,239,.45) transparent}',
  '.whg-archive-empty{display:grid;place-items:center;min-height:220px;padding:24px;color:#8fb1c5;text-align:center;font-size:13px;line-height:1.8;border:1px dashed rgba(143,216,239,.22);border-radius:14px;background:rgba(1,10,20,.18)}',
  '.whg-archive-error{padding:14px;border:1px solid rgba(255,154,154,.3);border-radius:12px;background:rgba(102,25,35,.2);color:#ffc1c1;font-size:13px;line-height:1.6}',
  '.whg-archive-error .whg-btn{display:block;margin-top:10px}',
  '.whg-history{display:flex;flex-direction:column;gap:12px;user-select:text}',
  '.whg-history-row{display:grid;grid-template-columns:48px minmax(0,1fr);gap:10px;align-items:start}',
  '.whg-history-who{padding-top:8px;color:#85bbca;font:700 10px/1.3 Consolas,monospace;letter-spacing:1px;text-align:right}',
  '.whg-history-text{margin:0;padding:9px 12px;border-left:2px solid rgba(127,208,255,.4);background:rgba(4,22,36,.56);color:#dff3ff;font-size:13px;line-height:1.7;white-space:pre-wrap;word-break:break-word}',
  '.whg-history-row.user .whg-history-text{border-left-color:#ff9cc8;color:#ffe4f1}',
  '.whg-history-row.narrator .whg-history-text{border-left-color:#748ea8;color:#9eb6ca;font-style:italic}',
  '.whg-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}',
  '.whg-gallery-card{position:relative;min-width:0;overflow:hidden;padding:0;border:1px solid rgba(143,216,239,.24);border-radius:12px;background:#061725;color:#eaf7ff;cursor:pointer;text-align:left}',
  '.whg-gallery-card:hover{border-color:rgba(215,182,108,.65);transform:translateY(-1px)}',
  '.whg-gallery-thumb{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;background:#03101f}',
  '.whg-gallery-placeholder{display:grid;place-items:center;color:#6f91a5;font:700 12px/1 Consolas,monospace}',
  '.whg-gallery-meta{display:flex;align-items:center;gap:8px;padding:9px 10px}',
  '.whg-gallery-level{color:#f0d99d;font:700 11px/1 Consolas,monospace}',
  '.whg-gallery-date{min-width:0;overflow:hidden;color:#8fb1c5;font-size:10px;text-overflow:ellipsis;white-space:nowrap}',
  '.whg-gallery-bg{position:absolute;top:8px;right:8px;padding:3px 7px;border:1px solid rgba(215,182,108,.5);border-radius:999px;background:rgba(3,14,25,.82);color:#f0d99d;font:700 9px/1.3 Consolas,monospace}',
  '.whg-gallery-detail{display:flex;min-height:100%;flex-direction:column;gap:14px}',
  '.whg-archive-back{align-self:flex-start;padding:6px 10px;border:0;border-radius:8px;background:rgba(143,216,239,.1);color:#cfefff;cursor:pointer;font-family:inherit}',
  '.whg-gallery-full{display:block;width:100%;max-height:54vh;object-fit:contain;border:1px solid rgba(215,182,108,.35);border-radius:12px;background:#020a14}',
  '.whg-gallery-caption{display:flex;align-items:center;gap:10px;color:#9bb9ca;font-size:12px}',
  '.whg-gallery-caption strong{color:#f0d99d;font:700 12px/1 Consolas,monospace}',
  '.whg-gallery-prompt{margin:0;padding:12px 14px;border-left:2px solid rgba(215,182,108,.55);background:rgba(2,12,22,.42);color:#9fbccb;font-size:11px;line-height:1.65;white-space:pre-wrap;word-break:break-word;user-select:text}',
  '.whg-profile-archive{width:min(560px,calc(100% - 42px))}',
  '.whg-profile-intro{margin-bottom:16px;padding:12px 14px;border:1px solid rgba(143,216,239,.2);border-left:3px solid rgba(215,182,108,.66);border-radius:0 11px 11px 0;background:rgba(2,16,28,.48);color:#aec8d6;font-size:12px;line-height:1.7}',
  '.whg-profile-intro strong{color:#eff9ff;font-weight:700}',
  '.whg-profile-guard{display:block;margin-top:7px;color:#d2bf89;font-size:11px}',
  '.whg-profile-form{display:flex;flex-direction:column;gap:17px;user-select:text}',
  '.whg-profile-section{margin:0;padding:0;border:0}',
  '.whg-profile-section-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 9px;padding-bottom:7px;border-bottom:1px solid rgba(215,182,108,.22)}',
  '.whg-profile-section-head strong{color:#d7c48f;font:700 10px/1.3 Consolas,monospace;letter-spacing:1.35px}',
  '.whg-profile-section-head span{color:#789bad;font-size:10px}',
  '.whg-profile-head-fields,.whg-profile-main-fields,.whg-profile-secondary-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}',
  '.whg-profile-field{display:flex;min-width:0;flex-direction:column;gap:6px}',
  '.whg-profile-field label{color:#e5f4fb;font-size:12px;font-weight:700;line-height:1.4}',
  '.whg-profile-field small{color:#789bad;font-size:10px;line-height:1.45}',
  '.whg-profile-control{box-sizing:border-box;width:100%;min-width:0;border:1px solid rgba(143,216,239,.24);border-radius:9px;background:rgba(1,11,21,.58);color:#eaf7ff;padding:9px 10px;font:12px/1.55 system-ui,"Segoe UI","Microsoft YaHei",sans-serif;outline:none;transition:border-color .16s ease,box-shadow .16s ease}',
  '.whg-profile-control::placeholder{color:#567687}',
  '.whg-profile-control:hover{border-color:rgba(143,216,239,.42)}',
  '.whg-profile-control:focus{border-color:rgba(159,232,255,.76);box-shadow:0 0 0 2px rgba(85,185,216,.14)}',
  '.whg-profile-control:disabled{opacity:.58;cursor:default}',
  'textarea.whg-profile-control{min-height:112px;resize:vertical}',
  '.whg-profile-secondary-fields textarea.whg-profile-control{min-height:92px}',
  '.whg-profile-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding-top:14px;border-top:1px solid rgba(215,182,108,.22)}',
  '.whg-profile-actions .whg-cg-btn{padding:8px 16px}',
  '.whg-profile-message{min-height:18px;flex:1 1 180px;margin:0;color:#8fd8e9;font-size:11px;line-height:1.5;text-align:right}',
  '.whg-profile-message.error{color:#ffb5bd}',
  '.whg-profile-loading{display:grid;place-items:center;min-height:240px;color:#8fb1c5;font-size:13px;letter-spacing:.2px}',
  '.whg-disabled{position:absolute;inset:0;z-index:6;display:grid;place-items:center;padding:24px;background:linear-gradient(180deg,#071629,#03101f)}',
  '.whg-disabled-card{width:min(480px,100%);padding:28px;border:1px solid rgba(215,182,108,.4);border-radius:18px;background:rgba(5,25,39,.86);box-shadow:0 22px 60px rgba(0,4,14,.46);text-align:center}',
  '.whg-disabled-card h2{margin:0 0 8px;color:#eefaff;font-family:"STSong","Songti SC",Georgia,serif;font-size:23px}',
  '.whg-disabled-card p{margin:0;color:#8fb1c5;font-size:13px;line-height:1.7}',
  // ── native DSH plugin-settings card ────────────────────────────────────
  '.whg-settings-card{list-style:none;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);overflow:hidden}',
  '.whg-settings-card[data-open="true"]{border-color:color-mix(in srgb,var(--dsw-alias-label-dimmed) 70%,#d7b66c);background:var(--dsw-alias-bg-layer-2)}',
  '.whg-settings-head{appearance:none;width:100%;display:flex;align-items:center;gap:12px;padding:14px 16px;border:0;background:transparent;color:inherit;cursor:pointer;text-align:left;font-family:inherit}',
  '.whg-settings-head:focus-visible,.whg-settings-toggle:focus-visible,.whg-settings-select:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#2f7fd6);outline-offset:-2px}',
  '.whg-settings-heading{display:flex;min-width:0;flex:1;flex-direction:column;gap:4px}',
  '.whg-settings-name{font-size:15px;font-weight:650;line-height:1.4}',
  '.whg-settings-desc{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}',
  '.whg-settings-status{flex:none;padding:2px 8px;border-radius:999px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);font-size:11px}',
  '.whg-settings-chevron{color:var(--dsw-alias-label-tertiary);font-size:12px;transition:transform .16s ease}',
  '.whg-settings-card[data-open="true"] .whg-settings-chevron{transform:rotate(180deg)}',
  '.whg-settings-body{display:flex;flex-direction:column;gap:14px;margin:0 16px;padding:16px 0;border-top:1px solid var(--dsw-alias-border-l2)}',
  '.whg-settings-row{display:grid;grid-template-columns:minmax(150px,.8fr) minmax(210px,1.2fr);align-items:center;gap:18px}',
  '.whg-settings-copy strong{display:block;font-size:13px;font-weight:600}',
  '.whg-settings-copy small{display:block;margin-top:3px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.45}',
  '.whg-settings-toggle{justify-self:end;min-width:74px;padding:6px 13px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;line-height:1.35}',
  '.whg-settings-toggle[aria-checked="true"]{border-color:#3da87a;background:color-mix(in srgb,#3da87a 18%,transparent);color:var(--dsw-alias-label-primary)}',
  '.whg-settings-select{box-sizing:border-box;width:100%;min-width:0;padding:7px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;line-height:1.4}',
  '.whg-settings-message{min-height:18px;margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5}',
  '.whg-settings-message.error{color:var(--dsw-alias-label-error,#c33)}',
  '@keyframes whgArchiveFade{from{opacity:0}to{opacity:1}}',
  '@keyframes whgArchiveSlide{from{transform:translateX(36px);opacity:.6}to{transform:none;opacity:1}}',
  // ── real skin toggling while the galgame tab is active ──────────────────
  'body[data-whale-galgame-active] [data-slot="conversation.composer"],body[data-whale-galgame-active] [data-slot="conversation.composer.dock"]{display:none !important}',
  'body[data-whale-galgame-active] .whg-pet{display:none !important}',
  // boot-time guard: the skin applies first; these rules suppress it in the
  // same frame until the galgame tab actually becomes active (no JS tick delay)
  'body[data-dsh-maid-atelier]:not([data-whale-galgame-active]) [data-skin-owner="maid-atelier"]{display:none !important}',
  'body[data-dsh-maid-atelier]:not([data-whale-galgame-active]){background-image:none !important}',
  '@media (max-width:900px){.whg-top{gap:6px;padding:10px 12px;flex-wrap:wrap}.whg-title{font-size:14px}.whg-chip{padding:3px 8px}.whg-spacer{display:none}.whg-top-actions{width:100%;justify-content:flex-end}.whg-btn{padding:5px 9px;font-size:12px}.whg-archive{width:min(470px,calc(100% - 12px))}.whg-archive-spine{display:none}}',
  '@media (max-width:560px){.whg-chip-wrap{max-width:calc(50% - 4px)}.whg-chip{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.whg-picker{position:fixed;top:92px;right:10px;left:10px;width:auto;max-height:55vh}.whg-top-actions{gap:5px;overflow-x:auto;padding-bottom:2px}.whg-archive{width:100%;border-left:0}.whg-archive-head{padding:18px 16px 14px}.whg-archive-body{padding:14px 14px 24px}.whg-gallery{grid-template-columns:1fr}.whg-history-row{grid-template-columns:38px minmax(0,1fr);gap:8px}.whg-archive-title{font-size:21px}.whg-profile-head-fields,.whg-profile-main-fields,.whg-profile-secondary-fields{grid-template-columns:1fr}.whg-profile-section-head{align-items:flex-start;flex-direction:column;gap:3px}.whg-profile-message{flex-basis:100%;text-align:left}.whg-settings-row{grid-template-columns:1fr;gap:8px}.whg-settings-toggle{justify-self:start}.whg-settings-head{padding:13px}.whg-settings-body{margin:0 13px}}',
  '@media (prefers-reduced-motion:reduce){.whg-archive-scrim,.whg-archive{animation:none}.whg-gallery-card:hover{transform:none}}',
].join('\n')

function art(key: any): string | undefined {
  if (!key) return undefined
  return (WHALE_ART as Record<string, string>)[String(key)]
}

function activateGalgameTab(): boolean {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('button[role="tab"]'))
  const target = tabs.find((tab) => tab.offsetParent !== null && (tab.textContent || '').trim() === 'galgame')
  if (!target || target.disabled) return false
  target.click()
  try { target.focus({ preventScroll: true }) } catch (err) { target.focus() }
  return true
}

function formatCgDate(value: any): string {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n <= 0) return '时间未记录'
  try {
    return new Date(n).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch (err) {
    return '时间未记录'
  }
}

async function api(action: string, args?: any): Promise<any> {
  const res = await fetch('/whale-galgame-api', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action, args: args || {} }),
  })
  if (!res.ok) throw new Error('galgame api ' + res.status)
  return res.json()
}

function selectMode(state: any): string {
  const current = state && state.current !== undefined && state.byId ? state.byId[state.current] : undefined
  if (current && current.pendingInteraction !== undefined) return 'waiting'
  if (current && current.running === true) return 'running'
  return 'idle'
}

// ── real maid-atelier skin toggling + composer hiding ─────────────────────
let skinBgCaptured: string | null = null

function ensureSkin(active: boolean): void {
  const owned = document.querySelectorAll('[data-skin-owner="maid-atelier"]')
  if (active) {
    document.body.setAttribute('data-dsh-maid-atelier', '')
    if (skinBgCaptured !== null) {
      document.body.style.backgroundImage = skinBgCaptured
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center top'
      document.body.style.backgroundAttachment = 'fixed'
      document.body.style.backgroundRepeat = 'no-repeat'
    }
    owned.forEach((node) => {
      (node as HTMLElement).style.display = ''
    })
  } else {
    if (document.body.hasAttribute('data-dsh-maid-atelier')) {
      if (skinBgCaptured === null) skinBgCaptured = document.body.style.backgroundImage || ''
      document.body.removeAttribute('data-dsh-maid-atelier')
      document.body.style.backgroundImage = ''
    }
    owned.forEach((node) => {
      (node as HTMLElement).style.display = 'none'
    })
  }
}

const composerHiddenEls = new Map<HTMLElement, string>()

function setComposerHidden(hidden: boolean): void {
  const els = document.querySelectorAll("[data-slot='conversation.composer'], [data-slot*='composer']")
  els.forEach((node) => {
    const el = node as HTMLElement
    if (hidden) {
      if (!composerHiddenEls.has(el)) {
        composerHiddenEls.set(el, el.style.display)
        el.style.display = 'none'
      }
    } else if (composerHiddenEls.has(el)) {
      el.style.display = composerHiddenEls.get(el) || ''
      composerHiddenEls.delete(el)
    }
  })
}

function syncTabLayout(visible: boolean): void {
  const rootEl = document.getElementById('whg-tab-root')
  if (!rootEl) return
  if (visible && rootEl.offsetParent !== null) {
    const r = rootEl.getBoundingClientRect()
    const fill = Math.max(420, Math.min(2000, window.innerHeight - r.top - 8))
    rootEl.style.minHeight = fill + 'px'
  } else {
    rootEl.style.minHeight = ''
  }
}

function Pet(props: { useSessions: any; onOpen: () => void }): React.ReactElement {
  const mode = props.useSessions ? props.useSessions(selectMode) : 'idle'
  const [lookIndex, setLookIndex] = useState<number | null>(null)
  const buttonRef = useRef<any>(null)
  const sheet = art('pet-spritesheet')
  const spriteStyle = sheet
    ? { backgroundImage: 'url(' + sheet + ')' }
    : { background: 'linear-gradient(160deg,#0e2b52,#123a63)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }

  useEffect(() => {
    if (mode !== 'idle') {
      setLookIndex(null)
      return undefined
    }
    let idleTimer: any
    const handlePointerMove = (event: PointerEvent) => {
      const rect = buttonRef.current && buttonRef.current.getBoundingClientRect ? buttonRef.current.getBoundingClientRect() : null
      if (!rect) return
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      const clockwiseFromUp = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360
      setLookIndex(Math.round(clockwiseFromUp / 22.5) % 16)
      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(() => setLookIndex(null), 1100)
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      if (idleTimer) clearTimeout(idleTimer)
    }
  }, [mode])

  const lookRow = lookIndex === null ? 0 : lookIndex < 8 ? 9 : 10
  const lookColumn = lookIndex === null ? 0 : lookIndex % 8
  const label = mode === 'running' ? 'deepseek娘正在工作' : mode === 'waiting' ? 'deepseek娘正在等待你' : 'deepseek娘正在待机'
  const hint = '点击开始galgame'
  return React.createElement('button', {
    'aria-label': label + '，' + hint,
    className: 'whg-pet',
    'data-looking': String(lookIndex !== null),
    'data-mode': mode,
    onClick: props.onOpen,
    ref: buttonRef,
    style: {
      '--whg-look-x': (-lookColumn * 192) + 'px',
      '--whg-look-y': (-lookRow * 208) + 'px',
    } as any,
    title: label + '，' + hint,
    type: 'button',
  },
    React.createElement('span', {
      'aria-hidden': 'true',
      className: 'whg-pet-sprite',
      style: spriteStyle,
    }, sheet ? undefined : '🐋'),
    React.createElement('span', { className: 'whg-pet-status' }, label),
  )
}

function optionText(option: any, fallback = '未命名'): string {
  if (!option) return fallback
  return String(option.label || option.name || option.model || option.id || fallback)
}

function selectionKey(selection: any): string {
  if (!selection) return ''
  return encodeURIComponent(String(selection.provider || '')) + '|' + encodeURIComponent(String(selection.model || selection.id || ''))
}

function parseSelectionKey(value: string): { provider: string; model: string } | null {
  const split = value.indexOf('|')
  if (split < 0) return null
  try {
    const provider = decodeURIComponent(value.slice(0, split))
    const model = decodeURIComponent(value.slice(split + 1))
    return model ? { provider, model } : null
  } catch (err) {
    return null
  }
}

function mainModelText(options: any): string {
  const main = options && options.mainSelection
  if (!main) return '当前工作区模型'
  return optionText(main, String(main.model || '当前工作区模型'))
}

function settingsFromResult(result: any): any | null {
  if (!result || typeof result !== 'object') return null
  if (result.settings && typeof result.settings === 'object') return result.settings
  if ('enabled' in result && ('characterMode' in result || 'chatMode' in result)) return result
  return null
}

function viewFromResult(result: any): any | null {
  if (!result || typeof result !== 'object') return null
  if (result.view && typeof result.view === 'object') return result.view
  if ('current' in result && ('name' in result || 'history' in result)) return result
  return null
}

const VIEW_CACHE_LIMIT = 8
const VIEW_CACHE_BY_SESSION = new Map<string, any>()

function viewCacheKey(sessionId?: string): string {
  const id = typeof sessionId === 'string' ? sessionId.trim() : ''
  return id ? 'session:' + id : 'unscoped'
}

function cachedView(key: string): any | null {
  return VIEW_CACHE_BY_SESSION.get(key) || null
}

function rememberView(key: string, value: any): void {
  if (!value || typeof value !== 'object') return
  VIEW_CACHE_BY_SESSION.delete(key)
  VIEW_CACHE_BY_SESSION.set(key, value)
  while (VIEW_CACHE_BY_SESSION.size > VIEW_CACHE_LIMIT) {
    const oldest = VIEW_CACHE_BY_SESSION.keys().next().value
    if (typeof oldest !== 'string') break
    VIEW_CACHE_BY_SESSION.delete(oldest)
  }
}

const PROFILE_KEYS = ['displayName', 'address', 'greeting', 'persona', 'tone', 'visual'] as const
type ProfileKey = typeof PROFILE_KEYS[number]
type CharacterProfile = Record<ProfileKey, string>

const EMPTY_CHARACTER_PROFILE: CharacterProfile = {
  displayName: '',
  address: '',
  greeting: '',
  persona: '',
  tone: '',
  visual: '',
}

function profileFromObject(value: any): CharacterProfile | null {
  if (!value || typeof value !== 'object') return null
  if (!PROFILE_KEYS.some((key) => Object.prototype.hasOwnProperty.call(value, key))) return null
  const profile = { ...EMPTY_CHARACTER_PROFILE }
  PROFILE_KEYS.forEach((key) => {
    const field = value[key]
    profile[key] = field === undefined || field === null ? '' : String(field)
  })
  return profile
}

function profileFromResult(result: any): CharacterProfile | null {
  if (!result || typeof result !== 'object') return null
  return profileFromObject(result.effective)
    || profileFromObject(result.profile && result.profile.effective)
    || profileFromObject(result.profile)
    || profileFromObject(result.values)
    || profileFromObject(result)
}

function builtInProfileFromResult(result: any): CharacterProfile | null {
  if (!result || typeof result !== 'object') return null
  return profileFromObject(result.builtIn)
    || profileFromObject(result.profile && result.profile.builtIn)
    || profileFromObject(result.defaults)
}

function profileOverridesFromResult(result: any): Partial<CharacterProfile> | null {
  if (!result || typeof result !== 'object') return null
  const value = result.overrides || (result.profile && result.profile.overrides)
  if (!value || typeof value !== 'object') return null
  const overrides: Partial<CharacterProfile> = {}
  PROFILE_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      overrides[key] = value[key] === undefined || value[key] === null ? '' : String(value[key])
    }
  })
  return overrides
}

function profileHasOverridesFromResult(result: any, fallback: boolean): boolean {
  if (result && typeof result.hasOverrides === 'boolean') return result.hasOverrides
  const overrides = profileOverridesFromResult(result)
  return overrides ? Object.keys(overrides).length > 0 : fallback
}

function assertApiResult(result: any, fallback: string): void {
  if (!result || result.ok !== false) return
  const errors = Array.isArray(result.errors) ? result.errors.join('；') : result.error
  throw new Error(errors || fallback)
}

function PluginSettingsCard(): React.ReactElement {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [options, setOptions] = useState<any>({ characters: [], models: [] })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([api('settings-get'), api('model-options')]).then(([nextSettings, nextOptions]) => {
      if (!alive) return
      setSettings(settingsFromResult(nextSettings) || nextSettings)
      setOptions(nextOptions && typeof nextOptions === 'object' ? nextOptions : { characters: [], models: [] })
      setError('')
    }).catch((err) => {
      if (alive) setError('插件设置读取失败：' + String(err && err.message ? err.message : err))
    }).then(() => {
      if (alive) setLoading(false)
    })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const onSettingsChanged = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (detail && detail.settings) setSettings(detail.settings)
      api('model-options').then((nextOptions) => {
        if (nextOptions && typeof nextOptions === 'object') setOptions(nextOptions)
      }).catch(() => { /* keep the last usable catalog */ })
    }
    window.addEventListener('whg:settings-changed', onSettingsChanged)
    return () => window.removeEventListener('whg:settings-changed', onSettingsChanged)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    let alive = true
    Promise.all([api('settings-get'), api('model-options')]).then(([nextSettings, nextOptions]) => {
      if (!alive) return
      setSettings(settingsFromResult(nextSettings) || nextSettings)
      if (nextOptions && typeof nextOptions === 'object') setOptions(nextOptions)
    }).catch(() => { /* the card already shows the last readable state */ })
    return () => { alive = false }
  }, [open])

  function save(patch: any): void {
    if (saving) return
    setSaving(true)
    setMessage('正在保存…')
    setError('')
    api('settings-set', patch).then(async (result) => {
      assertApiResult(result, '设置未被接受')
      let nextSettings = settingsFromResult(result)
      if (!nextSettings) {
        const refreshed = await api('settings-get')
        nextSettings = settingsFromResult(refreshed) || refreshed
      }
      setSettings(nextSettings)
      setMessage('已保存')
      window.dispatchEvent(new CustomEvent('whg:settings-changed', {
        detail: { settings: nextSettings, view: viewFromResult(result) },
      }))
    }).catch((err) => {
      setMessage('')
      setError('保存失败：' + String(err && err.message ? err.message : err))
    }).then(() => setSaving(false))
  }

  const characters: any[] = Array.isArray(options && options.characters) ? options.characters : []
  const models: any[] = Array.isArray(options && options.models) ? options.models : []
  const characterValue = settings && settings.characterMode === 'manual' && settings.characterId
    ? 'character:' + String(settings.characterId)
    : 'follow'
  const chatValue = settings && settings.chatMode === 'manual' && settings.chatSelection
    ? 'model:' + selectionKey(settings.chatSelection)
    : settings && settings.chatMode === 'main' ? 'main' : 'configured'
  const enabled = !settings || settings.enabled !== false
  const configuredModel = optionText(
    (options && options.configuredSelection) || (settings && settings.configuredSelection),
    '插件配置模型',
  )

  return React.createElement('li', { className: 'whg-settings-card', 'data-open': String(open) },
    React.createElement('button', {
      'aria-expanded': open,
      'aria-label': (open ? '收起' : '展开') + '鲸鱼娘 Galgame 设置',
      className: 'whg-settings-head',
      onClick: () => setOpen(!open),
      type: 'button',
    },
      React.createElement('span', { className: 'whg-settings-heading' },
        React.createElement('span', { className: 'whg-settings-name' }, '鲸鱼娘 Galgame'),
        React.createElement('span', { className: 'whg-settings-desc' }, '控制插件启用状态，以及出场角色与台词模型。'),
      ),
      React.createElement('span', { className: 'whg-settings-status' }, loading ? '读取中' : error ? '不可用' : enabled ? '已启用' : '已关闭'),
      React.createElement('span', { className: 'whg-settings-chevron', 'aria-hidden': 'true' }, '▼'),
    ),
    open
      ? React.createElement('div', { className: 'whg-settings-body' },
        React.createElement('div', { className: 'whg-settings-row' },
          React.createElement('span', { className: 'whg-settings-copy' },
            React.createElement('strong', null, '启用插件'),
            React.createElement('small', null, '关闭后隐藏桌宠，并暂停 galgame 对话入口内容。'),
          ),
          React.createElement('button', {
            'aria-checked': enabled,
            className: 'whg-settings-toggle',
            disabled: loading || saving || !settings,
            onClick: () => save({ enabled: !enabled }),
            role: 'switch',
            type: 'button',
          }, enabled ? '已开启' : '已关闭'),
        ),
        React.createElement('label', { className: 'whg-settings-row' },
          React.createElement('span', { className: 'whg-settings-copy' },
            React.createElement('strong', null, '角色来源'),
            React.createElement('small', null, '默认跟随工作区模型，也可固定为某位模型娘。'),
          ),
          React.createElement('select', {
            className: 'whg-settings-select',
            disabled: loading || saving || !settings,
            onChange: (event: any) => {
              const value = String(event.target.value)
              if (value === 'follow') save({ characterMode: 'follow', characterId: null })
              else if (value.startsWith('character:')) save({ characterMode: 'manual', characterId: value.slice(10) })
            },
            value: characterValue,
          },
            React.createElement('option', { value: 'follow' }, '跟随工作区 · ' + mainModelText(options)),
            characters.map((character: any, index: number) => React.createElement('option', {
              key: String(character.id || index),
              value: 'character:' + String(character.id || ''),
            }, optionText(character, '角色 ' + (index + 1)))),
          ),
        ),
        React.createElement('label', { className: 'whg-settings-row' },
          React.createElement('span', { className: 'whg-settings-copy' },
            React.createElement('strong', null, '对话模型'),
            React.createElement('small', null, '可继续使用插件默认模型、跟随工作区，或单独指定。'),
          ),
          React.createElement('select', {
            className: 'whg-settings-select',
            disabled: loading || saving || !settings,
            onChange: (event: any) => {
              const value = String(event.target.value)
              if (value === 'configured') save({ chatMode: 'configured', chatSelection: null })
              else if (value === 'main') save({ chatMode: 'main', chatSelection: null })
              else if (value.startsWith('model:')) {
                const selection = parseSelectionKey(value.slice(6))
                if (selection) save({ chatMode: 'manual', chatSelection: selection })
              }
            },
            value: chatValue,
          },
            React.createElement('option', { value: 'configured' }, '使用插件默认 · ' + configuredModel),
            React.createElement('option', { value: 'main' }, '跟随工作区 · ' + mainModelText(options)),
            models.map((model: any, index: number) => React.createElement('option', {
              key: selectionKey(model) || String(index),
              value: 'model:' + selectionKey(model),
            }, optionText(model, '模型 ' + (index + 1)))),
          ),
        ),
        React.createElement('p', {
          className: 'whg-settings-message' + (error ? ' error' : ''),
          role: error ? 'alert' : 'status',
        }, error || message || '设置会保存到当前工作区，顶部标签也可以随时快捷切换。'),
      )
      : null,
  )
}

function App(props: { useSessions: any; variant?: string; sessionId?: string }): React.ReactElement {
  const callApi = (action: string, args?: any) => api(action, props.sessionId
    ? { ...(args && typeof args === 'object' ? args : {}), sessionId: props.sessionId }
    : args)
  const appScope = props.variant === 'tab' ? 'tab' : 'overlay'
  const cacheKey = viewCacheKey(props.sessionId)
  const [viewState, setViewState] = useState<any>(() => ({ key: cacheKey, value: cachedView(cacheKey) }))
  const s = viewState && viewState.key === cacheKey ? viewState.value : cachedView(cacheKey)
  const setS = (nextOrUpdater: any) => {
    setViewState((previous: any) => {
      const base = previous && previous.key === cacheKey ? previous.value : cachedView(cacheKey)
      const next = typeof nextOrUpdater === 'function' ? nextOrUpdater(base) : nextOrUpdater
      rememberView(cacheKey, next)
      return { key: cacheKey, value: next }
    })
  }
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [text, setText] = useState('')
  const [armReset, setArmReset] = useState(false)
  const [imgFail, setImgFail] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [settled, setSettled] = useState(false)
  const [archivePanel, setArchivePanel] = useState<'history' | 'gallery' | 'profile' | null>(null)
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [galleryError, setGalleryError] = useState<string | null>(null)
  const [gallerySelected, setGallerySelected] = useState<any>(null)
  const [pickerPanel, setPickerPanel] = useState<'character' | 'chat' | 'background' | 'sprite' | null>(null)
  const [modelOptions, setModelOptions] = useState<any>(null)
  const [pluginSettings, setPluginSettings] = useState<any>(null)
  const [pickerLoading, setPickerLoading] = useState(false)
  const [pickerError, setPickerError] = useState('')
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null)
  const [backgroundFileName, setBackgroundFileName] = useState('')
  const [spritePreview, setSpritePreview] = useState<string | null>(null)
  const [spriteFileName, setSpriteFileName] = useState('')
  const [customSprite, setCustomSprite] = useState<string | null>(null)
  const [profileDraft, setProfileDraft] = useState<CharacterProfile>({ ...EMPTY_CHARACTER_PROFILE })
  const [profileBaseline, setProfileBaseline] = useState<CharacterProfile>({ ...EMPTY_CHARACTER_PROFILE })
  const [profileBuiltIn, setProfileBuiltIn] = useState<CharacterProfile>({ ...EMPTY_CHARACTER_PROFILE })
  const [profileCharacterId, setProfileCharacterId] = useState('')
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileHasOverrides, setProfileHasOverrides] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const bgCache = useRef<string | null>(null)
  const spriteCache = useRef<Record<string, string | null>>({})
  const spriteRevisionCache = useRef<Record<string, number>>({})
  const archiveRef = useRef<HTMLElement | null>(null)
  const archiveCloseRef = useRef<HTMLButtonElement | null>(null)
  const archiveReturnFocus = useRef<HTMLElement | null>(null)
  const historyScrollRef = useRef<HTMLDivElement | null>(null)
  const pickerRef = useRef<HTMLDivElement | null>(null)
  const pickerReturnFocus = useRef<HTMLElement | null>(null)
  const bgFileRef = useRef<HTMLInputElement | null>(null)
  const spriteFileRef = useRef<HTMLInputElement | null>(null)
  const profileFirstFieldRef = useRef<HTMLInputElement | null>(null)
  const profileRequestSeq = useRef(0)

  useEffect(() => {
    let alive = true
    callApi('view').then((v) => { if (alive) { setS(v); setApiError(null) } }).catch((e) => { if (alive) setApiError('galgame 服务未就绪：' + String(e && e.message ? e.message : e)) })
    return () => { alive = false }
  }, [props.sessionId])

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 4000)
    return () => clearTimeout(t)
  }, [])

  // while the galgame tab is actually visible: deep-sea maid immersion +
  // hide the workspace composer (restored the moment the tab hides)
  useEffect(() => {
    if (props.variant !== 'tab') return
    const sync = () => {
      const el = document.getElementById('whg-tab-root')
      const visible = !!el && el.offsetParent !== null
      if (visible) {
        document.body.dataset.whaleGalgameActive = ''
        ensureSkin(true)
        setComposerHidden(true)
        syncTabLayout(true)
      } else {
        delete document.body.dataset.whaleGalgameActive
        ensureSkin(false)
        setComposerHidden(false)
        syncTabLayout(false)
      }
    }
    sync()
    const id = setInterval(sync, 1200)
    return () => {
      clearInterval(id)
      delete document.body.dataset.whaleGalgameActive
      ensureSkin(false)
      setComposerHidden(false)
      syncTabLayout(false)
    }
  }, [props.variant])

  useEffect(() => {
    if (s && s.enabled === false && s.workspaceMismatch !== true) return undefined
    const id = setInterval(() => {
      callApi('view').then((v) => {
        if (v && typeof v === 'object') setS(v)
      }).catch(() => { /* server transient */ })
    }, 6000)
    return () => clearInterval(id)
  }, [s && s.enabled, s && s.workspaceMismatch, props.sessionId])

  useEffect(() => {
    if (!s) return
    if (s.bg === 'cg' || s.bg === 'custom') {
      if (!bgCache.current) {
        callApi('bg-data').then((r) => {
          if (r && typeof r.dataUrl === 'string' && r.dataUrl) {
            bgCache.current = r.dataUrl
            setS((prev: any) => prev ? { ...prev } : prev)
          }
        }).catch(() => { /* ignore */ })
      }
    } else {
      bgCache.current = null
    }
  }, [s && s.bg, props.sessionId])

  useEffect(() => {
    if (!s || s.enabled === false) {
      setCustomSprite(null)
      return undefined
    }
    const characterId = String(s.current || '')
    const revision = Number(s.spriteRevision)
    if (!characterId) {
      setCustomSprite(null)
      return undefined
    }
    if (Object.prototype.hasOwnProperty.call(spriteCache.current, characterId)
      && (!Number.isFinite(revision) || spriteRevisionCache.current[characterId] === revision)) {
      setCustomSprite(spriteCache.current[characterId])
      return undefined
    }
    let alive = true
    callApi('sprite-data', { characterId }).then((result) => {
      assertApiResult(result, '角色立绘读取失败')
      if (!alive) return
      const returnedId = String(result && (result.characterId || result.charId) ? (result.characterId || result.charId) : characterId)
      const dataUrl = result && typeof result.dataUrl === 'string' && result.dataUrl ? result.dataUrl : null
      spriteCache.current[returnedId] = dataUrl
      const returnedRevision = Number(result && result.revision)
      if (Number.isFinite(returnedRevision)) spriteRevisionCache.current[returnedId] = returnedRevision
      if (returnedId === characterId) {
        setCustomSprite(dataUrl)
        setImgFail(false)
      }
    }).catch(() => {
      if (alive) setCustomSprite(null)
    })
    return () => { alive = false }
  }, [s && s.current, s && s.enabled, s && s.spriteRevision, props.sessionId])

  useEffect(() => {
    const onSettingsChanged = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (detail && detail.settings) setPluginSettings(detail.settings)
      if (detail && detail.view) {
        setS(detail.view)
      } else {
        callApi('view').then((view) => {
          if (view && typeof view === 'object') setS(view)
        }).catch(() => { /* server transient */ })
      }
    }
    window.addEventListener('whg:settings-changed', onSettingsChanged)
    return () => window.removeEventListener('whg:settings-changed', onSettingsChanged)
  }, [props.sessionId])

  useEffect(() => {
    const onBackgroundChanged = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (!detail || typeof detail !== 'object') return
      bgCache.current = typeof detail.dataUrl === 'string' && detail.dataUrl ? detail.dataUrl : null
      if (detail.view && typeof detail.view === 'object') {
        setS(detail.view)
      } else {
        callApi('view').then((nextView) => {
          if (nextView && typeof nextView === 'object') setS(nextView)
        }).catch(() => { /* server transient */ })
      }
    }
    window.addEventListener('whg:bg-changed', onBackgroundChanged)
    return () => window.removeEventListener('whg:bg-changed', onBackgroundChanged)
  }, [props.sessionId])

  useEffect(() => {
    const currentId = String(s && s.current ? s.current : '')
    const onSpriteChanged = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (!detail || typeof detail !== 'object') return
      const characterId = String(detail.characterId || detail.charId || (detail.view && detail.view.current) || currentId)
      const dataUrl = typeof detail.dataUrl === 'string' && detail.dataUrl ? detail.dataUrl : null
      if (characterId) spriteCache.current[characterId] = dataUrl
      const revision = Number(detail.revision !== undefined ? detail.revision : detail.view && detail.view.spriteRevision)
      if (characterId && Number.isFinite(revision)) spriteRevisionCache.current[characterId] = revision
      if (!characterId || characterId === currentId) {
        setCustomSprite(dataUrl)
        setImgFail(false)
      }
      if (detail.view && typeof detail.view === 'object') {
        setS(detail.view)
      }
    }
    window.addEventListener('whg:sprite-changed', onSpriteChanged)
    return () => window.removeEventListener('whg:sprite-changed', onSpriteChanged)
  }, [s && s.current, props.sessionId])

  useEffect(() => {
    const currentId = String(s && s.current ? s.current : '')
    const onProfileChanged = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (!detail || typeof detail !== 'object') return
      const characterId = String(detail.characterId || detail.charId || (detail.view && detail.view.current) || currentId)
      const nextProfile = profileFromResult(detail)
      if (archivePanel === 'profile' && characterId && characterId === (profileCharacterId || currentId)) {
        if (nextProfile) {
          const nextBuiltIn = builtInProfileFromResult(detail)
          setProfileDraft(nextProfile)
          setProfileBaseline(nextProfile)
          if (nextBuiltIn) setProfileBuiltIn(nextBuiltIn)
          setProfileLoaded(true)
          setProfileLoading(false)
          setProfileHasOverrides(profileHasOverridesFromResult(detail, profileHasOverrides))
          setProfileError('')
        } else {
          loadCharacterProfile(characterId)
        }
      }
      if (detail.view && typeof detail.view === 'object') {
        setS(detail.view)
      } else {
        callApi('view').then((nextView) => {
          if (nextView && typeof nextView === 'object') setS(nextView)
        }).catch(() => { /* server transient */ })
      }
    }
    window.addEventListener('whg:profile-changed', onProfileChanged)
    return () => window.removeEventListener('whg:profile-changed', onProfileChanged)
  }, [archivePanel, profileCharacterId, profileHasOverrides, s && s.current, props.sessionId])

  useEffect(() => {
    setImgFail(false)
  }, [s && s.current, s && s.sprite, customSprite, props.sessionId])

  useEffect(() => {
    const onPetSetting = (event: Event) => {
      const enabled = (event as CustomEvent).detail
      if (typeof enabled === 'boolean') {
        setS((prev: any) => prev ? { ...prev, petEnabled: enabled } : prev)
      }
    }
    window.addEventListener('whg:pet-setting', onPetSetting)
    return () => window.removeEventListener('whg:pet-setting', onPetSetting)
  }, [])

  useEffect(() => {
    if (!archivePanel) return undefined
    const frame = requestAnimationFrame(() => {
      if (!archiveRef.current || archiveRef.current.contains(document.activeElement)) return
      if (archivePanel === 'profile' && !profileLoading && profileLoaded) profileFirstFieldRef.current?.focus()
      else archiveCloseRef.current?.focus()
    })
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (gallerySelected) setGallerySelected(null)
        else closeArchive()
        return
      }
      if (event.key !== 'Tab' || !archiveRef.current) return
      const focusable = Array.from(archiveRef.current.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])'))
        .filter((node) => node.offsetParent !== null)
      if (focusable.length === 0) {
        event.preventDefault()
        archiveCloseRef.current?.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      } else if (!archiveRef.current.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [archivePanel, gallerySelected, profileLoaded, profileLoading])

  useEffect(() => {
    if (!pickerPanel) return undefined
    const focusFrame = requestAnimationFrame(() => {
      const target = pickerRef.current?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]')
        || pickerRef.current?.querySelector<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled)')
      target?.focus()
    })
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (target && (pickerRef.current?.contains(target) || pickerReturnFocus.current?.contains(target))) return
      setPickerPanel(null)
      setBackgroundPreview(null)
      setSpritePreview(null)
      setPickerError('')
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        const target = pickerReturnFocus.current
        setPickerPanel(null)
        setBackgroundPreview(null)
        setSpritePreview(null)
        setPickerError('')
        requestAnimationFrame(() => target?.focus())
        return
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || !pickerRef.current) return
      const items = Array.from(pickerRef.current.querySelectorAll<HTMLElement>('button:not(:disabled),select:not(:disabled),input:not(:disabled)'))
        .filter((node) => node.offsetParent !== null)
      if (!items.length) return
      const current = items.indexOf(document.activeElement as HTMLElement)
      const next = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : current < 0
            ? (event.key === 'ArrowDown' ? 0 : items.length - 1)
            : event.key === 'ArrowDown'
              ? (current + 1) % items.length
              : (current - 1 + items.length) % items.length
      event.preventDefault()
      items[next].focus()
    }
    document.addEventListener('mousedown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      cancelAnimationFrame(focusFrame)
      document.removeEventListener('mousedown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [pickerPanel])

  useEffect(() => {
    if (s && s.enabled === false) {
      setPickerPanel(null)
      setArchivePanel(null)
    }
  }, [s && s.enabled])

  useEffect(() => {
    if (archivePanel !== 'profile') return
    const currentId = String(s && s.current ? s.current : '')
    if (currentId && currentId !== profileCharacterId && !profileLoading) loadCharacterProfile(currentId)
  }, [archivePanel, profileCharacterId, profileLoading, s && s.current])

  useEffect(() => {
    if (archivePanel !== 'history') return
    const frame = requestAnimationFrame(() => {
      const node = historyScrollRef.current
      if (node) node.scrollTop = node.scrollHeight
    })
    return () => cancelAnimationFrame(frame)
  }, [archivePanel, s && s.history && s.history.length])

  function act(action: string, args?: any): void {
    if (busy) return
    setBusy(true)
    callApi(action, args).then((v) => {
      if (v && typeof v === 'object') {
        setS(v)
        setApiError(null)
        if (action === 'pet-set' && typeof v.petEnabled === 'boolean') {
          window.dispatchEvent(new CustomEvent('whg:pet-setting', { detail: v.petEnabled }))
        }
        if (action === 'cg-save-bg') {
          window.dispatchEvent(new CustomEvent('whg:bg-changed', { detail: { dataUrl: bgCache.current, view: v } }))
        } else if (action === 'cg-clear-bg') {
          window.dispatchEvent(new CustomEvent('whg:bg-changed', { detail: { dataUrl: null, view: v } }))
        }
      }
    }).catch((e) => {
      setApiError(String(e && e.message ? e.message : e))
    }).then(() => {
      setBusy(false)
    })
  }

  function closePicker(restoreFocus = true): void {
    const target = pickerReturnFocus.current
    pickerReturnFocus.current = null
    setPickerPanel(null)
    setPickerError('')
    setBackgroundPreview(null)
    setBackgroundFileName('')
    setSpritePreview(null)
    setSpriteFileName('')
    if (restoreFocus && target && target.isConnected) requestAnimationFrame(() => target.focus())
  }

  function loadPickerData(): void {
    setPickerLoading(true)
    setPickerError('')
    Promise.all([callApi('model-options'), callApi('settings-get')]).then(([options, settingsResult]) => {
      setModelOptions(options && typeof options === 'object' ? options : { characters: [], models: [] })
      setPluginSettings(settingsFromResult(settingsResult) || settingsResult)
    }).catch((err) => {
      setPickerError('模型列表读取失败：' + String(err && err.message ? err.message : err))
    }).then(() => setPickerLoading(false))
  }

  function openPicker(kind: 'character' | 'chat' | 'background' | 'sprite', trigger: HTMLElement): void {
    if (pickerPanel === kind) {
      closePicker(false)
      return
    }
    pickerReturnFocus.current = trigger
    setPickerPanel(kind)
    setPickerError('')
    setBackgroundPreview(null)
    setBackgroundFileName('')
    setSpritePreview(null)
    setSpriteFileName('')
    if (kind === 'character' || kind === 'chat') loadPickerData()
  }

  function updateRuntimeSettings(patch: any): void {
    if (pickerLoading) return
    setPickerLoading(true)
    setPickerError('')
    callApi('settings-set', patch).then(async (result) => {
      assertApiResult(result, '切换未被接受')
      let nextSettings = settingsFromResult(result)
      if (!nextSettings) {
        const refreshed = await callApi('settings-get')
        nextSettings = settingsFromResult(refreshed) || refreshed
      }
      let nextView = viewFromResult(result)
      if (!nextView) nextView = await callApi('view')
      if (nextSettings) setPluginSettings(nextSettings)
      if (nextView && typeof nextView === 'object') setS(nextView)
      window.dispatchEvent(new CustomEvent('whg:settings-changed', {
        detail: { settings: nextSettings, view: nextView },
      }))
      closePicker()
    }).catch((err) => {
      setPickerError('切换失败：' + String(err && err.message ? err.message : err))
    }).then(() => setPickerLoading(false))
  }

  function chooseBackgroundFile(event: any): void {
    const file: File | undefined = event && event.target && event.target.files ? event.target.files[0] : undefined
    if (event && event.target) event.target.value = ''
    if (!file) return
    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/avif'])
    if (!allowedTypes.has(String(file.type || '').toLowerCase())) {
      setPickerError('请选择 PNG、JPG、WebP 或 AVIF 图片。')
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      setPickerError('图片不能超过 12 MB，请压缩后重试。')
      return
    }
    setPickerError('')
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setPickerError('图片预览失败，请换一张图片。')
        return
      }
      setBackgroundPreview(reader.result)
      setBackgroundFileName(file.name)
    }
    reader.onerror = () => setPickerError('图片读取失败，请重新选择。')
    reader.readAsDataURL(file)
  }

  function applyBackgroundUpload(): void {
    if (!backgroundPreview || pickerLoading) return
    setPickerLoading(true)
    setPickerError('')
    callApi('bg-upload', { dataUrl: backgroundPreview, fileName: backgroundFileName }).then(async (result) => {
      assertApiResult(result, '背景未保存')
      bgCache.current = backgroundPreview
      let nextView = viewFromResult(result)
      if (!nextView) nextView = await callApi('view')
      if (nextView && typeof nextView === 'object') setS(nextView)
      window.dispatchEvent(new CustomEvent('whg:bg-changed', {
        detail: { dataUrl: backgroundPreview, view: nextView },
      }))
      closePicker()
    }).catch((err) => {
      setPickerError('背景保存失败：' + String(err && err.message ? err.message : err))
    }).then(() => setPickerLoading(false))
  }

  function restoreDefaultBackground(): void {
    if (pickerLoading) return
    setPickerLoading(true)
    setPickerError('')
    const action = s && s.bg === 'cg' ? 'cg-clear-bg' : 'bg-clear-custom'
    callApi(action).then(async (result) => {
      assertApiResult(result, '背景未恢复')
      bgCache.current = null
      let nextView = viewFromResult(result)
      if (!nextView) nextView = await callApi('view')
      if (nextView && typeof nextView === 'object') setS(nextView)
      window.dispatchEvent(new CustomEvent('whg:bg-changed', {
        detail: { dataUrl: null, view: nextView },
      }))
      closePicker()
    }).catch((err) => {
      setPickerError('恢复默认背景失败：' + String(err && err.message ? err.message : err))
    }).then(() => setPickerLoading(false))
  }

  function applyBuiltinBackground(key: string): void {
    if (!key || pickerLoading) return
    setPickerLoading(true)
    setPickerError('')
    callApi('bg-set-builtin', { key }).then(async (result) => {
      assertApiResult(result, '内置背景未应用')
      bgCache.current = null
      let nextView = viewFromResult(result)
      if (!nextView) nextView = await callApi('view')
      if (nextView && typeof nextView === 'object') setS(nextView)
      window.dispatchEvent(new CustomEvent('whg:bg-changed', {
        detail: { dataUrl: null, view: nextView },
      }))
      closePicker()
    }).catch((err) => {
      setPickerError('内置背景切换失败：' + String(err && err.message ? err.message : err))
    }).then(() => setPickerLoading(false))
  }

  function chooseSpriteFile(event: any): void {
    const file: File | undefined = event && event.target && event.target.files ? event.target.files[0] : undefined
    if (event && event.target) event.target.value = ''
    if (!file) return
    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/avif'])
    if (!allowedTypes.has(String(file.type || '').toLowerCase())) {
      setPickerError('请选择 PNG、JPG、WebP 或 AVIF 图片。')
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      setPickerError('图片不能超过 12 MB，请压缩后重试。')
      return
    }
    setPickerError('')
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setPickerError('立绘预览失败，请换一张图片。')
        return
      }
      setSpritePreview(reader.result)
      setSpriteFileName(file.name)
    }
    reader.onerror = () => setPickerError('图片读取失败，请重新选择。')
    reader.readAsDataURL(file)
  }

  function applySpriteUpload(): void {
    const dataUrl = spritePreview
    const characterId = String(s && s.current ? s.current : '')
    if (!dataUrl || !characterId || pickerLoading) return
    setPickerLoading(true)
    setPickerError('')
    callApi('sprite-upload', { characterId, dataUrl, fileName: spriteFileName }).then(async (result) => {
      assertApiResult(result, '角色立绘未保存')
      const savedCharacterId = String(result && (result.characterId || result.charId) ? (result.characterId || result.charId) : characterId)
      const revision = Number(result && result.revision)
      spriteCache.current[savedCharacterId] = dataUrl
      if (Number.isFinite(revision)) spriteRevisionCache.current[savedCharacterId] = revision
      let nextView = viewFromResult(result)
      if (!nextView) nextView = await callApi('view')
      if (nextView && typeof nextView === 'object') setS(nextView)
      window.dispatchEvent(new CustomEvent('whg:sprite-changed', {
        detail: { characterId: savedCharacterId, dataUrl, revision, view: nextView },
      }))
      closePicker()
    }).catch((err) => {
      setPickerError('立绘保存失败：' + String(err && err.message ? err.message : err))
    }).then(() => setPickerLoading(false))
  }

  function restoreDefaultSprite(): void {
    const characterId = String(s && s.current ? s.current : '')
    if (!characterId || pickerLoading) return
    setPickerLoading(true)
    setPickerError('')
    callApi('sprite-clear', { characterId }).then(async (result) => {
      assertApiResult(result, '默认立绘未恢复')
      const savedCharacterId = String(result && (result.characterId || result.charId) ? (result.characterId || result.charId) : characterId)
      const revision = Number(result && result.revision)
      spriteCache.current[savedCharacterId] = null
      if (Number.isFinite(revision)) spriteRevisionCache.current[savedCharacterId] = revision
      let nextView = viewFromResult(result)
      if (!nextView) nextView = await callApi('view')
      if (nextView && typeof nextView === 'object') setS(nextView)
      window.dispatchEvent(new CustomEvent('whg:sprite-changed', {
        detail: { characterId: savedCharacterId, dataUrl: null, revision, view: nextView },
      }))
      closePicker()
    }).catch((err) => {
      setPickerError('恢复默认立绘失败：' + String(err && err.message ? err.message : err))
    }).then(() => setPickerLoading(false))
  }

  function loadCharacterProfile(characterId: string): void {
    if (!characterId) {
      setProfileLoaded(false)
      setProfileLoading(false)
      setProfileError('当前角色未识别，暂时无法读取角色设定。')
      return
    }
    const requestId = ++profileRequestSeq.current
    setProfileCharacterId(characterId)
    setProfileLoaded(false)
    setProfileLoading(true)
    setProfileError('')
    setProfileMessage('')
    callApi('profile-get', { characterId }).then((result) => {
      assertApiResult(result, '角色设定读取失败')
      if (requestId !== profileRequestSeq.current) return
      const profile = profileFromResult(result)
      if (!profile) throw new Error('服务未返回可编辑的角色设定')
      const returnedId = String(result && (result.charId || result.characterId) ? (result.charId || result.characterId) : characterId)
      const builtIn = builtInProfileFromResult(result) || profile
      setProfileCharacterId(returnedId)
      setProfileDraft(profile)
      setProfileBaseline(profile)
      setProfileBuiltIn(builtIn)
      setProfileHasOverrides(profileHasOverridesFromResult(result, false))
      setProfileLoaded(true)
    }).catch((err) => {
      if (requestId !== profileRequestSeq.current) return
      setProfileError('角色设定读取失败：' + String(err && err.message ? err.message : err))
    }).then(() => {
      if (requestId === profileRequestSeq.current) setProfileLoading(false)
    })
  }

  function updateProfileField(key: ProfileKey, value: string): void {
    setProfileDraft((current) => ({ ...current, [key]: value }))
    setProfileMessage('')
    setProfileError('')
  }

  function saveCharacterProfile(): void {
    const characterId = String(s && s.current ? s.current : profileCharacterId)
    if (!characterId || !profileLoaded || profileSaving) return
    if (profileCharacterId && characterId !== profileCharacterId) {
      loadCharacterProfile(characterId)
      return
    }
    const overrides: Partial<Record<ProfileKey, string | null>> = {}
    PROFILE_KEYS.forEach((key) => {
      overrides[key] = profileDraft[key] === profileBuiltIn[key] ? null : profileDraft[key]
    })
    setProfileSaving(true)
    setProfileError('')
    setProfileMessage('')
    callApi('profile-set', { characterId, overrides }).then(async (result) => {
      assertApiResult(result, '角色设定未保存')
      const returnedId = String(result && (result.charId || result.characterId) ? (result.charId || result.characterId) : characterId)
      const effective = profileFromResult(result) || { ...profileDraft }
      const builtIn = builtInProfileFromResult(result) || profileBuiltIn
      let nextView = viewFromResult(result)
      let refreshError = ''
      if (!nextView) {
        try {
          nextView = await callApi('view')
        } catch (err: any) {
          refreshError = '设定已保存，但画面刷新失败：' + String(err && err.message ? err.message : err)
        }
      }
      setProfileCharacterId(returnedId)
      setProfileDraft(effective)
      setProfileBaseline(effective)
      setProfileBuiltIn(builtIn)
      setProfileHasOverrides(profileHasOverridesFromResult(result, true))
      setProfileLoaded(true)
      if (nextView && typeof nextView === 'object') setS(nextView)
      window.dispatchEvent(new CustomEvent('whg:profile-changed', {
        detail: {
          characterId: returnedId,
          builtIn,
          effective,
          overrides: profileOverridesFromResult(result) || Object.fromEntries(
            PROFILE_KEYS.filter((key) => overrides[key] !== null).map((key) => [key, overrides[key]]),
          ),
          view: nextView,
        },
      }))
      setProfileMessage(refreshError ? '设定已保存；画面会在服务恢复后自动同步。' : '角色设定已保存。')
      setProfileError(refreshError)
    }).catch((err) => {
      setProfileError('角色设定保存失败：' + String(err && err.message ? err.message : err))
    }).then(() => setProfileSaving(false))
  }

  function resetCharacterProfile(): void {
    const characterId = String(s && s.current ? s.current : profileCharacterId)
    if (!characterId || profileSaving) return
    setProfileSaving(true)
    setProfileError('')
    setProfileMessage('')
    callApi('profile-reset', { characterId }).then(async (result) => {
      assertApiResult(result, '默认角色设定未恢复')
      const returnedId = String(result && (result.charId || result.characterId) ? (result.charId || result.characterId) : characterId)
      let effective = profileFromResult(result)
      let builtIn = builtInProfileFromResult(result)
      let refreshError = ''
      if (!effective) {
        try {
          const refreshed = await callApi('profile-get', { characterId: returnedId })
          assertApiResult(refreshed, '默认角色设定读取失败')
          effective = profileFromResult(refreshed)
          builtIn = builtInProfileFromResult(refreshed)
        } catch (err: any) {
          refreshError = '默认设定已恢复，但内容刷新失败：' + String(err && err.message ? err.message : err)
        }
      }
      let nextView = viewFromResult(result)
      if (!nextView) {
        try {
          nextView = await callApi('view')
        } catch (err: any) {
          refreshError = refreshError || ('默认设定已恢复，但画面刷新失败：' + String(err && err.message ? err.message : err))
        }
      }
      if (effective) {
        setProfileDraft(effective)
        setProfileBaseline(effective)
        setProfileBuiltIn(builtIn || effective)
        setProfileLoaded(true)
      }
      setProfileCharacterId(returnedId)
      setProfileHasOverrides(false)
      if (nextView && typeof nextView === 'object') setS(nextView)
      window.dispatchEvent(new CustomEvent('whg:profile-changed', {
        detail: { characterId: returnedId, builtIn: builtIn || effective, effective, overrides: {}, view: nextView },
      }))
      setProfileMessage(refreshError ? '默认设定已恢复；内容会在服务恢复后自动同步。' : '已恢复该角色的默认设定。')
      setProfileError(refreshError)
    }).catch((err) => {
      setProfileError('恢复默认设定失败：' + String(err && err.message ? err.message : err))
    }).then(() => setProfileSaving(false))
  }

  function send(): void {
    const t = text
    if (!t.trim()) return
    setText('')
    act('chat', { text: t })
  }

  // whale-girl emotion sprites: filename = emotion (local asset keys)
  const EMOTION_ART: Record<string, string> = {
    cheerful: 'whale-cheerful',
    shy: 'whale-shy',
    serious: 'whale-serious',
    confused: 'whale-confused',
    angry: 'whale-angry',
    frightened: 'whale-frightened',
    exasperated: 'whale-exasperated',
    starry: 'whale-starry',
  }

  // detect the emotion: prefer the host's LLM classification, fall back to keywords
  function emotionOf(): string {
    const lines: any[] = (s && s.history) || []
    let lastLine: any = null
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].who === 'user') { lastLine = lines[i]; break }
    }
    if (!lastLine) return 'normal'
    if (lastLine.emotion && EMOTION_ART[lastLine.emotion]) return lastLine.emotion
    const last: string = lastLine.text || ''
    if (!last) return 'normal'
    if (/生气|讨厌|哼|烦|滚|过分|笨蛋|气死|可恶/.test(last)) return 'angry'
    if (/害怕|吓|恐怖|鬼|啊啊|惊|别吓我/.test(last)) return 'frightened'
    if (/无奈|累死|唉|好吧|算了|服了|无语|头疼/.test(last)) return 'exasperated'
    if (/星星|好美|浪漫|月亮|梦想|憧憬|心动|闪闪|漂亮/.test(last)) return 'starry'
    if (/害羞|呜|脸红|别这样|不好意思|才不/.test(last)) return 'shy'
    if (/？|\?|什么|不懂|困惑|为啥|咦|不明白|没听懂/.test(last)) return 'confused'
    if (/认真|工作|学习|讨论|问题|严肃|报告|项目|方案/.test(last)) return 'serious'
    if (/开心|高兴|哈哈|太好了|棒|喜欢|爱|♪|≧▽≦|耶|抱抱|亲亲/.test(last)) return 'cheerful'
    return 'normal'
  }

  function moodOf(): string {
    const lines: any[] = (s && s.history) || []
    let last: string | null = null
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].who === 'heroine') { last = lines[i].text; break }
    }
    if (!last) return 'normal'
    if (/生气|讨厌|哼|笨蛋|不理|走开|过分|烦/.test(last)) return 'angry'
    if (/喜欢|♪|开心|太棒|幸福|≧▽≦|哈哈|啦～/.test(last)) return 'happy'
    if (/害羞|才不|呜|脸红|别这样|……/.test(last)) return 'shy'
    return 'normal'
  }

  function lastLine(): any {
    const lines: any[] = (s && s.history) || []
    return lines.length > 0 ? lines[lines.length - 1] : null
  }

  function closeArchive(): void {
    setArchivePanel(null)
    setGallerySelected(null)
    setProfileMessage('')
    setProfileError('')
    const target = archiveReturnFocus.current
    archiveReturnFocus.current = null
    if (target && target.isConnected) {
      requestAnimationFrame(() => target.focus())
    }
  }

  function loadGallery(): void {
    setGalleryLoading(true)
    setGalleryError(null)
    callApi('cg-gallery').then((result) => {
      const items = result && Array.isArray(result.items) ? result.items : []
      setGalleryItems(items)
    }).catch((error) => {
      setGalleryError(String(error && error.message ? error.message : error))
    }).then(() => {
      setGalleryLoading(false)
    })
  }

  function openArchive(kind: 'history' | 'gallery' | 'profile', trigger: HTMLElement): void {
    setPickerPanel(null)
    if (!archivePanel) archiveReturnFocus.current = trigger
    setGallerySelected(null)
    setArchivePanel(kind)
    if (kind === 'gallery') loadGallery()
    if (kind === 'profile') loadCharacterProfile(String(s && s.current ? s.current : ''))
  }

  function saveGalleryBackground(item: any): void {
    if (!item || !item.id) return
    if (typeof item.dataUrl === 'string' && item.dataUrl) bgCache.current = item.dataUrl
    const selected = { ...item, savedAsBg: true }
    setGallerySelected(selected)
    setGalleryItems((items) => items.map((entry) => ({ ...entry, savedAsBg: entry.id === item.id })))
    act('cg-save-bg', { id: item.id })
  }

  function pickerOption(props: {
    selected: boolean
    title: string
    subtitle?: string
    onChoose: () => void
    key?: string
  }): React.ReactElement {
    return React.createElement('button', {
      'aria-selected': props.selected,
      className: 'whg-picker-option',
      disabled: pickerLoading,
      key: props.key,
      onClick: props.onChoose,
      role: 'option',
      type: 'button',
    },
      React.createElement('span', null,
        React.createElement('span', { className: 'whg-picker-option-main' }, props.title),
        props.subtitle ? React.createElement('span', { className: 'whg-picker-option-sub' }, props.subtitle) : null,
      ),
      React.createElement('span', { className: 'whg-picker-check', 'aria-hidden': 'true' }, props.selected ? '●' : ''),
    )
  }

  function characterPicker(): React.ReactElement | null {
    if (pickerPanel !== 'character') return null
    const characters: any[] = Array.isArray(modelOptions && modelOptions.characters) ? modelOptions.characters : []
    const mode = (pluginSettings && pluginSettings.characterMode) || s.characterMode || 'follow'
    const selectedId = (pluginSettings && pluginSettings.characterId) || s.characterId || s.current
    return React.createElement('div', {
      'aria-label': '选择出场角色',
      className: 'whg-picker',
      id: 'whg-character-picker',
      ref: pickerRef,
      role: 'listbox',
    },
      React.createElement('div', { className: 'whg-picker-head' },
        React.createElement('span', null, 'CHARACTER SOURCE'),
        React.createElement('span', null, pickerLoading ? '读取中…' : String(characters.length + 1).padStart(2, '0')),
      ),
      pickerOption({
        selected: mode !== 'manual',
        title: '跟随工作区',
        subtitle: mainModelText(modelOptions),
        onChoose: () => updateRuntimeSettings({ characterMode: 'follow', characterId: null }),
      }),
      characters.map((character: any, index: number) => pickerOption({
        key: String(character.id || index),
        selected: mode === 'manual' && String(selectedId) === String(character.id),
        title: optionText(character, '角色 ' + (index + 1)),
        subtitle: character.model ? String(character.model) : character.description ? String(character.description) : undefined,
        onChoose: () => updateRuntimeSettings({ characterMode: 'manual', characterId: String(character.id) }),
      })),
      pickerError ? React.createElement('div', { className: 'whg-bg-error', role: 'alert' }, pickerError) : null,
    )
  }

  function chatPicker(): React.ReactElement | null {
    if (pickerPanel !== 'chat') return null
    const models: any[] = Array.isArray(modelOptions && modelOptions.models) ? modelOptions.models : []
    const mode = (pluginSettings && pluginSettings.chatMode) || s.chatMode || 'configured'
    const selected = (pluginSettings && pluginSettings.chatSelection) || s.chatSelection
    const selectedKey = selectionKey(selected)
    const configuredLabel = optionText(
      modelOptions && modelOptions.configuredSelection,
      s.configuredChatModelLabel || s.defaultChatModelLabel || s.chatModelLabel || s.lastModel || '插件配置模型',
    )
    return React.createElement('div', {
      'aria-label': '选择对话模型',
      className: 'whg-picker',
      id: 'whg-chat-picker',
      ref: pickerRef,
      role: 'listbox',
    },
      React.createElement('div', { className: 'whg-picker-head' },
        React.createElement('span', null, 'DIALOGUE MODEL'),
        React.createElement('span', null, pickerLoading ? '读取中…' : String(models.length + 2).padStart(2, '0')),
      ),
      pickerOption({
        selected: mode === 'configured' || (!pluginSettings && !s.chatMode),
        title: '使用插件默认模型',
        subtitle: configuredLabel,
        onChoose: () => updateRuntimeSettings({ chatMode: 'configured', chatSelection: null }),
      }),
      pickerOption({
        selected: mode === 'main',
        title: '跟随工作区',
        subtitle: mainModelText(modelOptions),
        onChoose: () => updateRuntimeSettings({ chatMode: 'main', chatSelection: null }),
      }),
      models.map((model: any, index: number) => {
        const key = selectionKey(model)
        return pickerOption({
          key: key || String(index),
          selected: mode === 'manual' && key === selectedKey,
          title: optionText(model, '模型 ' + (index + 1)),
          subtitle: [model.provider, model.model].filter(Boolean).join(' · '),
          onChoose: () => updateRuntimeSettings({
            chatMode: 'manual',
            chatSelection: { provider: String(model.provider || ''), model: String(model.model || model.id || '') },
          }),
        })
      }),
      pickerError ? React.createElement('div', { className: 'whg-bg-error', role: 'alert' }, pickerError) : null,
    )
  }

  function backgroundPicker(): React.ReactElement | null {
    if (pickerPanel !== 'background') return null
    const backgroundMode = String((s && s.backgroundMode) || (s && (s.bg === 'custom' || s.bg === 'cg') ? s.bg : 'builtin'))
    const hasSavedBackground = backgroundMode === 'custom' || backgroundMode === 'cg'
    const builtinOptions = Array.isArray(s && s.builtinBackgroundOptions)
      ? s.builtinBackgroundOptions.filter((item: any) => item && typeof item.key === 'string' && item.key)
      : []
    const currentBuiltin = String(
      (s && (s.builtinBackgroundKey || s.selectedBuiltinBackground))
      || (builtinOptions.find((item: any) => item.current === true || item.selected === true) || {}).key
      || (!hasSavedBackground && s && s.bg ? s.bg : ''),
    )
    const currentActual = hasSavedBackground ? bgCache.current : art(s && s.bg)
    const visiblePreview = backgroundPreview || currentActual
    const builtinSection = builtinOptions.length > 0
      ? React.createElement('section', { className: 'whg-bg-builtins', 'aria-label': (s && s.name ? s.name : '当前角色') + '的内置背景' },
        React.createElement('div', { className: 'whg-bg-builtins-head' },
          React.createElement('span', null, '角色内置背景'),
          React.createElement('span', { className: 'whg-bg-builtins-role' }, s && s.name ? s.name : ''),
        ),
        hasSavedBackground
          ? React.createElement('div', { className: 'whg-bg-override-note' },
            backgroundMode === 'cg' ? '特殊 CG 正在覆盖角色背景。选择下方背景会退出 CG 覆盖。' : '自定义图片正在覆盖角色背景。选择下方背景会退出自定义覆盖。',
          )
          : null,
        React.createElement('div', { className: 'whg-bg-builtins-grid' },
          builtinOptions.map((option: any, index: number) => {
            const key = String(option.key)
            const label = String(option.label || option.name || ('内置背景 ' + (index + 1)))
            const preview = art(key)
            const selected = key === currentBuiltin
            const isDefault = option.default === true || option.isDefault === true
            return React.createElement('button', {
              'aria-label': label + (isDefault ? '，角色默认背景' : '') + (selected && hasSavedBackground ? '，退出覆盖后使用' : ''),
              'aria-pressed': selected && !hasSavedBackground,
              className: 'whg-bg-builtin',
              disabled: pickerLoading,
              key,
              onClick: () => applyBuiltinBackground(key),
              type: 'button',
            },
              preview
                ? React.createElement('img', { alt: '', className: 'whg-bg-builtin-img', draggable: false, src: preview })
                : React.createElement('div', { className: 'whg-bg-builtin-img whg-bg-builtin-fallback' }, 'BACKGROUND'),
              React.createElement('span', { className: 'whg-bg-builtin-meta' },
                React.createElement('span', { className: 'whg-bg-builtin-name' }, label),
                isDefault ? React.createElement('span', { className: 'whg-bg-builtin-tag' }, '默认') : null,
                selected ? React.createElement('span', { className: 'whg-bg-builtin-tag' }, hasSavedBackground ? '恢复后' : '使用中') : null,
              ),
            )
          }),
        ),
      )
      : null
    return React.createElement('div', {
      'aria-label': '修改 galgame 背景图',
      className: 'whg-picker right whg-bg-picker',
      id: 'whg-background-picker',
      ref: pickerRef,
      role: 'dialog',
    },
      React.createElement('div', { className: 'whg-picker-head' },
        React.createElement('span', null, 'BACKGROUND FILE'),
        React.createElement('span', null, backgroundPreview ? '预览' : hasSavedBackground ? '覆盖中' : '角色背景'),
      ),
      visiblePreview
        ? React.createElement('img', { className: 'whg-bg-preview', src: visiblePreview, alt: backgroundPreview ? '待应用背景预览' : '当前 galgame 背景' })
        : React.createElement('div', { className: 'whg-bg-empty' }, '选择一张本地图片后在这里预览'),
      builtinSection,
      React.createElement('div', { className: 'whg-picker-note' }, '内置背景会随角色切换。上传的图片只保存在本工作区，并会持续覆盖角色背景；建议使用横向 16:9 图片。'),
      React.createElement('input', {
        accept: 'image/png,image/jpeg,image/webp,image/avif',
        className: 'whg-bg-file',
        onChange: chooseBackgroundFile,
        ref: bgFileRef,
        type: 'file',
      }),
      React.createElement('div', { className: 'whg-bg-actions' },
        React.createElement('button', {
          className: 'whg-btn',
          disabled: pickerLoading,
          onClick: () => bgFileRef.current?.click(),
          type: 'button',
        }, backgroundPreview ? '重新选择' : '上传图片'),
        backgroundPreview
          ? React.createElement('button', {
            className: 'whg-cg-btn',
            disabled: pickerLoading,
            onClick: applyBackgroundUpload,
            type: 'button',
          }, pickerLoading ? '保存中…' : '应用这张背景')
          : null,
        backgroundPreview
          ? React.createElement('button', {
            className: 'whg-btn',
            disabled: pickerLoading,
            onClick: () => { setBackgroundPreview(null); setBackgroundFileName(''); setPickerError('') },
            type: 'button',
          }, '取消预览')
          : null,
        hasSavedBackground
          ? React.createElement('button', {
            className: 'whg-btn',
            disabled: pickerLoading,
            onClick: restoreDefaultBackground,
            type: 'button',
          }, '恢复默认')
          : null,
      ),
      pickerError ? React.createElement('div', { className: 'whg-bg-error', role: 'alert' }, pickerError) : null,
    )
  }

  function spritePicker(): React.ReactElement | null {
    if (pickerPanel !== 'sprite') return null
    const defaultSprite = art(s && s.sprite)
    const visiblePreview = spritePreview || customSprite || defaultSprite
    const hasSavedSprite = !!customSprite || !!(s && (s.hasCustomSprite === true || s.customSprite === true || s.spriteMode === 'custom'))
    return React.createElement('div', {
      'aria-label': '修改' + (s && s.name ? s.name : '当前角色') + '的角色立绘',
      className: 'whg-picker right whg-sprite-picker',
      id: 'whg-sprite-picker',
      ref: pickerRef,
      role: 'dialog',
    },
      React.createElement('div', { className: 'whg-picker-head' },
        React.createElement('span', null, 'CHARACTER PORTRAIT'),
        React.createElement('span', null, spritePreview ? '预览' : hasSavedSprite ? '使用中' : '默认'),
      ),
      visiblePreview
        ? React.createElement('div', { className: 'whg-sprite-preview-shell' },
          React.createElement('img', {
            alt: spritePreview ? '待应用立绘预览' : (s && s.name ? s.name : '当前角色') + '的当前立绘',
            className: 'whg-sprite-preview',
            src: visiblePreview,
          }),
        )
        : React.createElement('div', { className: 'whg-bg-empty' }, '选择一张本地图片后在这里预览'),
      React.createElement('div', { className: 'whg-picker-note' },
        '当前角色 · ' + (s && s.name ? s.name : '未识别') + '。立绘按角色分别保存，只用于本工作区；建议使用透明背景的竖向图片。',
      ),
      React.createElement('input', {
        accept: 'image/png,image/jpeg,image/webp,image/avif',
        className: 'whg-bg-file',
        onChange: chooseSpriteFile,
        ref: spriteFileRef,
        type: 'file',
      }),
      React.createElement('div', { className: 'whg-bg-actions' },
        React.createElement('button', {
          className: 'whg-btn',
          disabled: pickerLoading,
          onClick: () => spriteFileRef.current?.click(),
          type: 'button',
        }, spritePreview ? '重新选择' : '上传图片'),
        spritePreview
          ? React.createElement('button', {
            className: 'whg-cg-btn',
            disabled: pickerLoading,
            onClick: applySpriteUpload,
            type: 'button',
          }, pickerLoading ? '保存中…' : '应用这张立绘')
          : null,
        React.createElement('button', {
          className: 'whg-btn',
          disabled: pickerLoading,
          onClick: () => closePicker(),
          type: 'button',
        }, '取消'),
        hasSavedSprite
          ? React.createElement('button', {
            className: 'whg-btn',
            disabled: pickerLoading,
            onClick: restoreDefaultSprite,
            type: 'button',
          }, '恢复默认')
          : null,
      ),
      pickerError ? React.createElement('div', { className: 'whg-bg-error', role: 'alert' }, pickerError) : null,
    )
  }

  function profileField(
    key: ProfileKey,
    label: string,
    hint: string,
    multiline = false,
  ): React.ReactElement {
    const id = 'whg-profile-' + appScope + '-' + key
    const hintId = id + '-hint'
    const common = {
      'aria-describedby': hintId,
      className: 'whg-profile-control',
      disabled: profileLoading || profileSaving,
      id,
      onChange: (event: any) => updateProfileField(key, String(event.target.value || '')),
      spellCheck: true,
      value: profileDraft[key],
    }
    const control = multiline
      ? React.createElement('textarea', { ...common, rows: key === 'persona' || key === 'tone' ? 5 : 4 })
      : React.createElement('input', {
        ...common,
        autoComplete: 'off',
        ref: key === 'displayName' ? profileFirstFieldRef : undefined,
        type: 'text',
      })
    return React.createElement('div', { className: 'whg-profile-field' },
      React.createElement('label', { htmlFor: id }, label),
      control,
      React.createElement('small', { id: hintId }, hint),
    )
  }

  function profileEditor(): React.ReactElement {
    if (profileLoading) {
      return React.createElement('div', { className: 'whg-profile-loading', role: 'status' }, '正在调取角色档案……')
    }
    if (!profileLoaded) {
      return React.createElement('div', { className: 'whg-archive-error', role: 'alert' },
        profileError || '角色设定暂时无法读取。',
        React.createElement('button', {
          className: 'whg-btn',
          onClick: () => loadCharacterProfile(String(s && s.current ? s.current : '')),
          type: 'button',
        }, '重新读取'),
      )
    }
    const dirty = PROFILE_KEYS.some((key) => profileDraft[key] !== profileBaseline[key])
    const message = profileError
      || profileMessage
      || (dirty ? '有未保存的修改。' : profileHasOverrides ? '当前角色使用自定义设定。' : '当前角色使用默认设定。')
    return React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'whg-profile-intro' },
        React.createElement('strong', null, (s && s.name ? s.name : '当前角色') + ' · 独立角色档案'),
        '。设定按角色分别保存；保存或恢复默认都不会改变好感度、记忆或角色立绘，已经开始互动的对话历史也不会被改写。',
        React.createElement('span', { className: 'whg-profile-guard' },
          '若尚未开始互动，编辑会原位更新当前开场问候；开始对话后不再改写历史。安全规则与单句回复限制始终保留。',
        ),
      ),
      React.createElement('form', {
        'aria-busy': profileSaving,
        className: 'whg-profile-form',
        onSubmit: (event: any) => { event.preventDefault(); saveCharacterProfile() },
      },
        React.createElement('section', { 'aria-labelledby': 'whg-profile-heading-' + appScope, className: 'whg-profile-section' },
          React.createElement('div', { className: 'whg-profile-section-head', id: 'whg-profile-heading-' + appScope },
            React.createElement('strong', null, 'DOSSIER HEADING'),
            React.createElement('span', null, '姓名牌与彼此称呼'),
          ),
          React.createElement('div', { className: 'whg-profile-head-fields' },
            profileField('displayName', '角色昵称', '显示在标题、姓名牌与对话记录中。'),
            profileField('address', '对用户称呼', '角色在台词中如何称呼你。'),
          ),
        ),
        React.createElement('section', { 'aria-labelledby': 'whg-profile-core-' + appScope, className: 'whg-profile-section' },
          React.createElement('div', { className: 'whg-profile-section-head', id: 'whg-profile-core-' + appScope },
            React.createElement('strong', null, 'CHARACTER CORE'),
            React.createElement('span', null, '主要对话依据'),
          ),
          React.createElement('div', { className: 'whg-profile-main-fields' },
            profileField('persona', '性格', '角色的性格、价值取向与互动边界。', true),
            profileField('tone', '语气', '措辞、节奏、口癖等表达偏好。', true),
          ),
        ),
        React.createElement('section', { 'aria-labelledby': 'whg-profile-scenes-' + appScope, className: 'whg-profile-section' },
          React.createElement('div', { className: 'whg-profile-section-head', id: 'whg-profile-scenes-' + appScope },
            React.createElement('strong', null, 'SCENE NOTES'),
            React.createElement('span', null, '开场与纪念 CG'),
          ),
          React.createElement('div', { className: 'whg-profile-secondary-fields' },
            profileField('greeting', '首次问候', '尚未开始互动时可更新当前开场问候；已有真实对话后不会改写。', true),
            profileField('visual', 'CG 外观描述', '用于生成升级纪念 CG，不会更换当前角色立绘。', true),
          ),
        ),
        React.createElement('div', { className: 'whg-profile-actions' },
          React.createElement('button', {
            className: 'whg-cg-btn',
            disabled: profileSaving || !dirty,
            type: 'submit',
          }, profileSaving ? '保存中…' : '保存设定'),
          React.createElement('button', {
            className: 'whg-btn',
            disabled: profileSaving || (!profileHasOverrides && !dirty),
            onClick: resetCharacterProfile,
            title: '只恢复当前角色的六项设定，不清除其他存档内容',
            type: 'button',
          }, profileSaving ? '处理中…' : '恢复默认'),
          React.createElement('p', {
            className: 'whg-profile-message' + (profileError ? ' error' : ''),
            role: profileError ? 'alert' : 'status',
          }, message),
        ),
      ),
    )
  }

  function archiveDrawer(): React.ReactElement | null {
    if (!archivePanel || !s) return null
    const history: any[] = Array.isArray(s.history) ? s.history : []
    const galleryCount = typeof s.galleryCount === 'number' ? s.galleryCount : galleryItems.length
    const isHistory = archivePanel === 'history'
    const isProfile = archivePanel === 'profile'
    const recordCount = isHistory ? history.length : galleryCount
    const kicker = isProfile
      ? 'DEEP-SEA DOSSIER · ' + String(profileCharacterId || s.current || 'PROFILE').toUpperCase()
      : 'DEEP-SEA ARCHIVE · ' + (isHistory ? 'LOG ' : 'CG ') + String(recordCount).padStart(3, '0')
    let body: React.ReactElement

    if (isProfile) {
      body = profileEditor()
    } else if (isHistory) {
      body = history.length === 0
        ? React.createElement('div', { className: 'whg-archive-empty' }, '还没有对话记录。和' + s.name + '说句话，第一份深海档案就会在这里归档。')
        : React.createElement('div', { className: 'whg-history' },
          history.map((line: any, index: number) => {
            const who = line && line.who === 'heroine' ? s.name : line && line.who === 'user' ? '主人' : '旁白'
            const kind = line && line.who ? String(line.who) : 'narrator'
            return React.createElement('div', { className: 'whg-history-row ' + kind, key: index + '-' + kind },
              React.createElement('div', { className: 'whg-history-who' }, who),
              React.createElement('p', { className: 'whg-history-text' }, line && typeof line.text === 'string' ? line.text : ''),
            )
          }),
        )
    } else if (gallerySelected) {
      body = React.createElement('div', { className: 'whg-gallery-detail' },
        React.createElement('button', {
          className: 'whg-archive-back',
          onClick: () => setGallerySelected(null),
          type: 'button',
        }, '← 返回图鉴'),
        gallerySelected.dataUrl
          ? React.createElement('img', {
            className: 'whg-gallery-full',
            src: gallerySelected.dataUrl,
            alt: (gallerySelected.name || s.name) + '的特殊CG',
          })
          : React.createElement('div', { className: 'whg-archive-empty' }, '这张 CG 暂时无法读取。'),
        React.createElement('div', { className: 'whg-gallery-caption' },
          React.createElement('strong', null, 'Lv.' + (gallerySelected.level || '?')),
          React.createElement('span', null, (gallerySelected.name || s.name) + ' · ' + formatCgDate(gallerySelected.at)),
        ),
        gallerySelected.prompt
          ? React.createElement('p', { className: 'whg-gallery-prompt' }, gallerySelected.prompt)
          : null,
        React.createElement('button', {
          className: 'whg-cg-btn',
          disabled: busy || gallerySelected.savedAsBg === true,
          onClick: () => saveGalleryBackground(gallerySelected),
          type: 'button',
        }, gallerySelected.savedAsBg ? '当前galgame背景' : '设为galgame背景'),
      )
    } else if (galleryLoading) {
      body = React.createElement('div', { className: 'whg-archive-empty', role: 'status' }, '正在打开深海图鉴柜……')
    } else if (galleryError) {
      body = React.createElement('div', { className: 'whg-archive-error', role: 'alert' },
        'CG 图鉴读取失败：' + galleryError,
        React.createElement('button', { className: 'whg-btn', onClick: loadGallery, type: 'button' }, '重新读取'),
      )
    } else if (galleryItems.length === 0) {
      body = React.createElement('div', { className: 'whg-archive-empty' }, '图鉴柜还是空的。提升等级后，收到的特殊 CG 会依角色分别收藏在这里。')
    } else {
      body = React.createElement('div', { className: 'whg-gallery' },
        galleryItems.map((item: any, index: number) => React.createElement('button', {
          'aria-label': '查看' + (item.name || s.name) + ' Lv.' + (item.level || '?') + ' 特殊CG',
          className: 'whg-gallery-card',
          key: item.id || index,
          onClick: () => setGallerySelected(item),
          type: 'button',
        },
          item.dataUrl
            ? React.createElement('img', { className: 'whg-gallery-thumb', src: item.dataUrl, alt: '', loading: 'lazy' })
            : React.createElement('div', { className: 'whg-gallery-thumb whg-gallery-placeholder' }, 'CG'),
          item.savedAsBg
            ? React.createElement('span', { className: 'whg-gallery-bg' }, '背景中')
            : null,
          React.createElement('span', { className: 'whg-gallery-meta' },
            React.createElement('span', { className: 'whg-gallery-level' }, 'Lv.' + (item.level || '?')),
            React.createElement('span', { className: 'whg-gallery-date' }, (item.name || s.name) + ' · ' + formatCgDate(item.at)),
          ),
        )),
      )
    }

    return React.createElement('div', {
      className: 'whg-archive-scrim',
      onMouseDown: (event: any) => { if (event.target === event.currentTarget) closeArchive() },
    },
      React.createElement('aside', {
        'aria-labelledby': 'whg-archive-title-' + appScope,
        'aria-modal': 'true',
        className: 'whg-archive' + (isProfile ? ' whg-profile-archive' : ''),
        id: isProfile ? 'whg-profile-editor-' + appScope : undefined,
        ref: archiveRef,
        role: 'dialog',
      },
        React.createElement('div', { className: 'whg-archive-spine', 'aria-hidden': 'true' }, isProfile ? 'CHARACTER DOSSIER' : 'DEEP-SEA ARCHIVE'),
        React.createElement('header', { className: 'whg-archive-head' },
          React.createElement('div', { className: 'whg-archive-heading' },
            React.createElement('div', { className: 'whg-archive-kicker' }, kicker),
            React.createElement('h2', { className: 'whg-archive-title', id: 'whg-archive-title-' + appScope }, isProfile ? '角色设定' : isHistory ? '对话历史' : 'CG图鉴'),
          ),
          React.createElement('button', {
            'aria-label': '关闭' + (isProfile ? '角色设定' : isHistory ? '对话历史' : 'CG图鉴'),
            className: 'whg-archive-close',
            onClick: closeArchive,
            ref: archiveCloseRef,
            type: 'button',
          }, '×'),
        ),
        React.createElement('div', {
          className: 'whg-archive-body',
          ref: isHistory ? historyScrollRef : undefined,
        }, body),
      ),
    )
  }

  function topbar(showBack: boolean): React.ReactElement {
    const characterModel = s.characterModelLabel || s.modelLabel || ''
    const chatModel = s.chatModelLabel || s.lastModel || ''
    const petEnabled = s.petEnabled !== false
    const galleryCount = typeof s.galleryCount === 'number' ? s.galleryCount : 0
    const characterMode = (pluginSettings && pluginSettings.characterMode) || s.characterMode || 'follow'
    const chatMode = (pluginSettings && pluginSettings.chatMode) || s.chatMode || 'configured'
    return React.createElement('div', { className: 'whg-top' },
      React.createElement('span', { className: 'whg-title' }, '与' + s.name + '的galgame'),
      React.createElement('div', { className: 'whg-chip-wrap' },
        React.createElement('button', {
          'aria-controls': 'whg-character-picker',
          'aria-expanded': pickerPanel === 'character',
          'aria-haspopup': 'listbox',
          className: 'whg-chip whg-chip-button',
          onClick: (event: any) => openPicker('character', event.currentTarget),
          title: '点击切换出场角色。当前' + (characterMode === 'manual' ? '已固定' : '跟随工作区') + '：' + (characterModel || '未识别'),
          type: 'button',
        },
          React.createElement('span', { className: 'whg-dot' + (s.modelOnline ? '' : ' off') }),
          React.createElement('span', null, '角色来源 · '),
          React.createElement('strong', null, characterModel || '未识别'),
          React.createElement('span', { className: 'whg-chip-caret', 'aria-hidden': 'true' }, '▼'),
        ),
        characterPicker(),
      ),
      React.createElement('div', { className: 'whg-chip-wrap' },
        React.createElement('button', {
          'aria-controls': 'whg-chat-picker',
          'aria-expanded': pickerPanel === 'chat',
          'aria-haspopup': 'listbox',
          className: 'whg-chip whg-chip-button',
          onClick: (event: any) => openPicker('chat', event.currentTarget),
          title: '点击切换 galgame 对话模型。当前模式：' + (chatMode === 'manual' ? '单独指定' : chatMode === 'main' ? '跟随工作区' : '插件默认') + '；实际使用：' + (chatModel || '离线'),
          type: 'button',
        },
          React.createElement('span', { className: 'whg-dot' + (chatModel && !s.fallbackUsed ? '' : ' off') }),
          React.createElement('span', null, '实际对话 · '),
          React.createElement('strong', null, chatModel || '离线'),
          React.createElement('span', { className: 'whg-chip-caret', 'aria-hidden': 'true' }, '▼'),
        ),
        chatPicker(),
      ),
      React.createElement('div', { className: 'whg-spacer' }),
      React.createElement('div', { className: 'whg-top-actions' },
        React.createElement('div', { className: 'whg-chip-wrap' },
          React.createElement('button', {
            'aria-controls': 'whg-background-picker',
            'aria-expanded': pickerPanel === 'background',
            'aria-haspopup': 'dialog',
            className: 'whg-btn',
            onClick: (event: any) => openPicker('background', event.currentTarget),
            type: 'button',
          }, '背景图'),
          backgroundPicker(),
        ),
        React.createElement('div', { className: 'whg-chip-wrap' },
          React.createElement('button', {
            'aria-controls': 'whg-sprite-picker',
            'aria-expanded': pickerPanel === 'sprite',
            'aria-haspopup': 'dialog',
            className: 'whg-btn',
            onClick: (event: any) => openPicker('sprite', event.currentTarget),
            title: '为' + (s.name || '当前角色') + '上传本地角色立绘',
            type: 'button',
          }, '角色立绘'),
          spritePicker(),
        ),
        React.createElement('button', {
          'aria-controls': 'whg-profile-editor-' + appScope,
          'aria-expanded': archivePanel === 'profile',
          'aria-haspopup': 'dialog',
          className: 'whg-btn',
          onClick: (event: any) => openArchive('profile', event.currentTarget),
          title: '修改' + (s.name || '当前角色') + '的昵称、称呼、问候、性格、语气与 CG 外观描述',
          type: 'button',
        }, '角色设定'),
        React.createElement('button', {
          'aria-expanded': archivePanel === 'history',
          className: 'whg-btn',
          onClick: (event: any) => openArchive('history', event.currentTarget),
          type: 'button',
        }, '对话历史'),
        React.createElement('button', {
          'aria-expanded': archivePanel === 'gallery',
          className: 'whg-btn',
          onClick: (event: any) => openArchive('gallery', event.currentTarget),
          type: 'button',
        },
          'CG图鉴',
          galleryCount > 0 ? React.createElement('span', { className: 'whg-count' }, galleryCount) : null,
        ),
        React.createElement('button', {
          'aria-pressed': petEnabled,
          className: 'whg-btn',
          disabled: busy,
          onClick: () => act('pet-set', { enabled: !petEnabled }),
          title: petEnabled ? '关闭桌宠，避免与其他悬浮插件冲突' : '开启可跳转 galgame 的桌宠',
          type: 'button',
        }, '桌宠 · ' + (petEnabled ? '开' : '关')),
        React.createElement('button', {
          className: 'whg-btn',
          title: '重新开始（清零等级与好感度）',
          onClick: (e: any) => {
            e.stopPropagation()
            if (armReset) { setArmReset(false); act('reset') } else { setArmReset(true) }
          },
          type: 'button',
        }, armReset ? '确认?' : '↺'),
        showBack
          ? React.createElement('button', {
            className: 'whg-btn back',
            title: '回到办公区（角色会继续在桌宠状态陪你）',
            onClick: (e: any) => { e.stopPropagation(); setOpen(false) },
            type: 'button',
          }, '返回办公区')
          : null,
      ),
    )
  }

  function stage(): React.ReactElement {
    const emotion = emotionOf()
    const mood = moodOf()
    let src: string | undefined
    let useFilter = !s.moodSprites
    let emoKey = ''
    if (customSprite) {
      src = customSprite
      useFilter = true
    } else if (s.current === 'deepseek') {
      emoKey = emotion === 'normal' ? '' : EMOTION_ART[emotion]
      src = emoKey ? art(emoKey) : art(s.sprite)
      useFilter = !emoKey
    } else if (s.moods) {
      src = art(s.moods[mood]) || art(s.moods.normal)
      if (!src) src = art(s.sprite)
    } else {
      src = art(s.sprite)
    }
    const wrap = (!src || imgFail)
      ? React.createElement('div', { className: 'whg-sprite-fallback' }, '🐋')
      : React.createElement('img', {
        className: 'whg-sprite' + (s.portrait ? ' whg-sprite-portrait' : '') + (customSprite ? ' whg-sprite-custom' : ''),
        src,
        alt: s.name,
        draggable: false,
        onError: () => { setImgFail(true) },
      })
    const blushOpacity = emoKey
      ? 0
      : mood === 'shy' ? 0.55 : mood === 'happy' ? 0.3 : 0
    return React.createElement('div', { className: 'whg-stage' },
      React.createElement('div', { className: 'whg-tint', style: { background: 'radial-gradient(closest-side, ' + s.color + '2e, transparent)' } }),
      React.createElement('div', { className: 'whg-sprite-wrap' + (s.portrait ? ' whg-portrait' : '') + (useFilter ? ' whg-mood-' + mood : '') },
        wrap,
        React.createElement('div', {
          className: 'whg-blush',
          style: { opacity: blushOpacity },
        }),
      ),
    )
  }

  function dialogue(): React.ReactElement {
    const last = lastLine()
    const plateLabel = last
      ? (last.who === 'heroine' ? s.name : last.who === 'user' ? '主人' : '旁白')
      : s.name
    const plateClass = last ? (last.who === 'heroine' ? '' : ' ' + last.who) : ''
    const plateColor = last
      ? (last.who === 'heroine' ? s.color : last.who === 'user' ? '#ff9cc8' : '#8fb4dd')
      : s.color
    const showChoices = last && last.who === 'heroine' && s.choices && s.choices.length > 0
    const choices = showChoices
      ? React.createElement('div', { className: 'whg-choices' },
        s.choices.map((c: any, i: number) => {
          const choiceText = typeof c === 'string' ? c : c && typeof c.text === 'string' ? c.text : ''
          const choiceId = typeof c === 'object' && c && c.id !== undefined ? String(c.id) : undefined
          return React.createElement('button', {
            key: choiceId || i,
            className: 'whg-choice',
            disabled: busy || !choiceText,
            onClick: () => { act('chat', choiceId ? { choiceId, text: choiceText } : { text: choiceText }) },
            type: 'button',
          }, choiceText)
        }))
      : null
    const input = React.createElement('div', { className: 'whg-input-row' },
      React.createElement('input', {
        className: 'whg-input',
        value: text,
        placeholder: '回复 ' + s.name + ' …',
        disabled: busy,
        onChange: (e: any) => { setText(e.target.value) },
        onKeyDown: (e: any) => { if (e.key === 'Enter') send() },
      }),
      React.createElement('button', { className: 'whg-send', disabled: busy || !text.trim(), onClick: send }, '回复'))
    const fallbackNote = s.fallbackUsed
      ? React.createElement('div', { className: 'whg-fallback-note' }, '（模型调用失败，' + s.name + ' 用了备用台词。原因：' + (s.fallbackReason || '未知') + ' · 目标模型：' + (s.lastModel || s.modelLabel || '未知') + '）')
      : null
    const now = last
      ? React.createElement('div', { key: 'now-' + ((s.history || []).length), className: 'whg-line-now ' + last.who }, last.text)
      : React.createElement('div', { className: 'whg-line-now narrator' }, '（点击输入框，开始和' + s.name + '对话吧）')
    return React.createElement('div', { id: 'whg-panel', className: 'whg-panel' },
      React.createElement('div', { className: 'whg-plate' + plateClass, style: { background: plateColor } }, plateLabel),
      React.createElement('div', { className: 'whg-level' },
        React.createElement('span', null, 'Lv.' + s.level + ' · 好感度 ' + s.affection + '/' + s.cap),
        React.createElement('div', { className: 'whg-level-track' },
          React.createElement('div', { className: 'whg-level-fill', style: { width: Math.min(100, Math.round((s.affection / Math.max(1, s.cap)) * 100)) + '%' } }))),
      now,
      fallbackNote,
      choices,
      input,
    )
  }

  function cgModal(): React.ReactElement | null {
    if (!settled || !s || !s.cg) return null
    if (s.cg.status === 'generating') {
      return React.createElement('div', { className: 'whg-toast' }, '🎨 正在绘制 Lv 纪念 CG……（约半分钟）')
    }
    if (s.cg.status === 'failed' && !s.cg.seen) {
      return React.createElement('div', { className: 'whg-toast', onClick: () => { act('cg-ack') } },
        '⚠️ CG 生成失败：' + (s.cg.error || '未知错误') + '（点击关闭）')
    }
    if (s.cg.status === 'ready' && !s.cg.seen && s.cg.dataUrl) {
      return React.createElement('div', { 'aria-modal': 'true', className: 'whg-cg-backdrop', role: 'dialog' },
        React.createElement('div', { className: 'whg-cg-title' }, '🎁 升级啦 · ' + (s.cg.name || s.name) + '送给你的特殊CG'),
        React.createElement('img', { className: 'whg-cg-img', src: s.cg.dataUrl, alt: (s.cg.name || s.name) + '送给你的特殊CG' }),
        React.createElement('div', { className: 'whg-cg-btns' },
          s.cg.savedAsBg
            ? React.createElement('button', {
              className: 'whg-cg-btn alt',
              onClick: () => {
                bgCache.current = null
                act('cg-clear-bg')
              },
              type: 'button',
            }, '恢复默认背景')
            : React.createElement('button', {
              className: 'whg-cg-btn',
              onClick: () => {
                if (s.cg && s.cg.dataUrl) {
                  bgCache.current = s.cg.dataUrl
                }
                act('cg-save-bg')
              },
              type: 'button',
            }, '保存为galgame界面背景'),
          React.createElement('button', {
            className: 'whg-cg-btn alt',
            onClick: () => { act('cg-ack') },
            type: 'button',
          }, '收下并关闭'),
        ),
      )
    }
    return null
  }

  const isTab = props.variant === 'tab'

  if (isTab) {
    if (s === null) {
      return React.createElement('div', { id: 'whg-tab-root', className: 'whg-root-tab' },
        React.createElement('div', { className: 'whg-bg whg-bg-fallback' }),
        React.createElement('div', { className: 'whg-toast' }, apiError ? '⚠️ ' + apiError : '连接 galgame 服务中…'),
      )
    }
    if (s.enabled === false) {
      const mismatch = s.workspaceMismatch === true
      return React.createElement('div', { id: 'whg-tab-root', className: 'whg-root-tab' },
        React.createElement('div', { className: 'whg-disabled' },
          React.createElement('div', { className: 'whg-disabled-card' },
            React.createElement('h2', null, mismatch ? '此工作区没有对应的 Galgame 存档' : '鲸鱼娘 Galgame 已关闭'),
            React.createElement('p', null, mismatch
              ? '为避免跨工作区混用角色记忆与任务上下文，本页不会读取另一个工作区的 Galgame 数据。'
              : '在左侧“设置 → 插件 → 插件配置”中展开鲸鱼娘 Galgame，即可重新开启。'),
          ),
        ),
      )
    }
    const bgSrc = s.bg === 'cg' || s.bg === 'custom' ? bgCache.current : art(s.bg)
    const bgEl = bgSrc
      ? React.createElement('img', { className: 'whg-bg', src: bgSrc, alt: '', draggable: false })
      : React.createElement('div', { className: 'whg-bg whg-bg-fallback' })
    return React.createElement('div', { id: 'whg-tab-root', className: 'whg-root-tab' },
      bgEl,
      React.createElement('div', { className: 'whg-vignette' }),
      topbar(false),
      stage(),
      dialogue(),
      archiveDrawer(),
      cgModal(),
    )
  }

  if (!open) {
    const petEnabled = !!s && s.enabled !== false && s.petEnabled !== false
    return React.createElement(React.Fragment, null,
      petEnabled
        ? React.createElement(Pet, {
          useSessions: props.useSessions,
          onOpen: () => {
            if (s !== null && !activateGalgameTab()) setOpen(true)
          },
        })
        : null,
      s === null
        ? React.createElement('div', { className: 'whg-toast' }, apiError ? '⚠️ ' + apiError : '连接 galgame 服务中…')
        : (apiError ? React.createElement('div', { className: 'whg-toast' }, '⚠️ ' + apiError) : null),
    )
  }
  if (s.enabled === false) return React.createElement(React.Fragment, null)
  const bgSrc = s.bg === 'cg' || s.bg === 'custom' ? bgCache.current : art(s.bg)
  const bgEl = bgSrc
    ? React.createElement('img', { className: 'whg-bg', src: bgSrc, alt: '', draggable: false })
    : React.createElement('div', { className: 'whg-bg whg-bg-fallback' })
  return React.createElement('div', { className: 'whg-root' },
    bgEl,
    React.createElement('div', { className: 'whg-vignette' }),
    topbar(true),
    stage(),
    dialogue(),
    archiveDrawer(),
    cgModal(),
  )
}

export const name = 'whale-galgame'
export const inject = ['slots']

export function apply(ctx: any): void {
  const style = document.createElement('style')
  style.dataset.plugin = 'dsh-whale-galgame'
  style.textContent = CSS
  document.head.appendChild(style)

  const slots = ctx.slots || ctx.get('slots')
  if (slots === undefined || typeof slots.inject !== 'function') {
    const hostRoot = document.createElement('div')
    document.body.appendChild(hostRoot)
    const root = createRoot(hostRoot)
    root.render(React.createElement(App, { useSessions: null }))
    ctx.effect(() => () => {
      root.unmount()
      hostRoot.remove()
      style.remove()
    }, 'dsh-whale-galgame: direct-mount overlay')
    return
  }
  slots.inject('shell.overlay', () => {
    return slots.register(
      { name: 'shell.overlay', id: 'whale-galgame', order: 900 },
      (slotProps: any) => {
        return React.createElement(App, { useSessions: slotProps && slotProps.useSessions })
      },
    )
  })

  // galgame as a first-class conversation view tab (对话 / 轨迹 / galgame)
  slots.inject('conversation.view', () => slots.register(
    { name: 'conversation.view', id: 'galgame', order: 100, label: 'galgame' },
    (slotProps: any) => React.createElement(App, {
      useSessions: slotProps && slotProps.useSessions,
      sessionId: slotProps && slotProps.sessionId,
      variant: 'tab',
    }),
  ))

  // Public DSH extension point: Settings → Plugins → Plugin configuration.
  slots.inject('settings.plugin.item', () => slots.register(
    { name: 'settings.plugin.item', id: 'whale-galgame', order: 30 },
    () => React.createElement(PluginSettingsCard),
  ))

  ctx.effect(() => () => {
    style.remove()
  }, 'dsh-whale-galgame: pet + galgame overlay')
  // global enforcer: the real skin stays off unless the galgame tab is active
  const enforcer = setInterval(() => {
    ensureSkin(document.body.hasAttribute('data-whale-galgame-active'))
  }, 1500)
  // immediate sweep at apply time (covers "skin applied before us" ordering)
  if (!document.body.hasAttribute('data-whale-galgame-active')) {
    ensureSkin(false)
  }
  // same-frame interception: strip the skin attribute the moment it appears
  // (unless the galgame tab is active), and hide every decoration node the
  // skin inserts while inactive — no visible flash at boot
  const skinAttrObserver = new MutationObserver(() => {
    if (!document.body.hasAttribute('data-whale-galgame-active')) {
      ensureSkin(false)
    }
  })
  skinAttrObserver.observe(document.body, { attributes: true, attributeFilter: ['data-dsh-maid-atelier'] })
  const skinNodeObserver = new MutationObserver((records) => {
    if (document.body.hasAttribute('data-whale-galgame-active')) return
    for (const r of records) {
      for (const n of Array.from(r.addedNodes)) {
        const el = n as HTMLElement
        if (el && el.nodeType === 1 && typeof el.getAttribute === 'function' && el.getAttribute('data-skin-owner') === 'maid-atelier') {
          el.style.display = 'none'
        }
      }
    }
  })
  skinNodeObserver.observe(document.body, { childList: true, subtree: true })
  ctx.effect(() => () => {
    clearInterval(enforcer)
    skinAttrObserver.disconnect()
    skinNodeObserver.disconnect()
    ensureSkin(false)
    setComposerHidden(false)
  }, 'dsh-whale-galgame: skin enforcer')
}
