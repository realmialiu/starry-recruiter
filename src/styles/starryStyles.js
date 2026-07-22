/* ---------- styles ---------- */
export const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&family=Press+Start+2P&family=VT323&family=Nunito:wght@400;500;600;700;800&display=swap');
:root{
  --paper:#F3EEFB; --paper2:#ECE4F8; --card:#FFFFFF;
  --ink:#3B2E55; --ink-soft:#7E6E9E; --ink-faint:#B6A9CE;
  --line:#ECE3F7; --line2:#DBCCEF;
  --pink:#F4A9CC; --blush:#FBDCEC; --rose:#EE8FB2;
  --purple:#C3A3F0; --grape:#8E7CC0; --peri:#A9A7F0;
  --blue:#8FB8F0; --sky:#BFD8F5; --yellow:#F5D25E; --butter:#FBEBA6;
  --leaf:#B7A6E8; --stem:#8E7CC0; --soil:#ECE4F8; --soil2:#DEEBD8;
  --shadow:4px 4px 0 rgba(59,46,85,.85); --shadow-sm:3px 3px 0 rgba(59,46,85,.85);
}
*{box-sizing:border-box}
.gr{font-family:'Nunito',system-ui,sans-serif;color:var(--ink);min-height:100vh;font-size:14px;line-height:1.5;
  background:
   radial-gradient(900px 500px at 10% -8%, #E9DEFB 0%, transparent 58%),
   radial-gradient(820px 460px at 100% 0%, #DBE6FB 0%, transparent 55%),
   radial-gradient(720px 420px at 55% 108%, #FBE0EC 0%, transparent 60%),
   var(--paper);}
.gr button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
.gr h1,.gr h2,.gr h3,.gr h4{font-family:'Pixelify Sans',sans-serif;font-weight:600;margin:0;line-height:1.15;letter-spacing:.3px}
.pixel{font-family:'Press Start 2P',monospace}
.mono{font-family:'VT323',monospace;font-size:1.15em}
.serif{font-family:'Pixelify Sans',sans-serif}
.muted{color:var(--ink-soft)} .faint{color:var(--ink-faint)}
.row{display:flex;align-items:center}.col{display:flex;flex-direction:column}
.gap4{gap:4px}.gap6{gap:6px}.gap8{gap:8px}.gap10{gap:10px}.gap12{gap:12px}.gap16{gap:16px}.gap18{gap:18px}.gap2{gap:2px}
.wrap{flex-wrap:wrap}.between{justify-content:space-between}.center{justify-content:center}
.grow{flex:1}.right{margin-left:auto}

/* window */
.win{background:var(--card);border:3px solid var(--ink);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
.win-bar{display:flex;align-items:center;gap:8px;background:var(--grape);color:#fff;padding:8px 12px;
  border-bottom:3px solid var(--ink);font-family:'Pixelify Sans';font-weight:600;font-size:14px}
.win-bar.pink{background:var(--pink)}.win-bar.blue{background:var(--blue)}.win-bar.yellow{background:var(--yellow);color:var(--ink)}
.win-bar.leaf{background:var(--peri)}
.win-dots{margin-left:auto;display:flex;gap:5px}
.win-dots span{width:14px;height:14px;border:2px solid var(--ink);background:#fff;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:8px;color:var(--ink);font-family:'Press Start 2P'}
.win-body{padding:16px 18px}

/* buttons */
.pbtn{font-family:'Pixelify Sans';font-weight:600;font-size:14px;color:#fff;background:var(--grape);border:3px solid var(--ink);
  border-radius:9px;padding:8px 15px;box-shadow:3px 3px 0 rgba(59,46,85,.85);display:inline-flex;align-items:center;gap:7px;white-space:nowrap;transition:.05s}
.pbtn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 rgba(59,46,85,.85)}
.pbtn.pink{background:var(--pink)}.pbtn.grape{background:var(--grape)}
.pbtn.ghost{background:#fff;color:var(--ink)}.pbtn.danger{background:var(--rose)}
.pbtn.blue{background:var(--blue)}
.pbtn.sm{font-size:12.5px;padding:6px 11px;border-width:2px;box-shadow:2px 2px 0 rgba(59,46,85,.85)}
.pbtn:disabled{opacity:.5}
.icon-btn{width:34px;height:34px;border-radius:9px;border:2px solid var(--ink);background:#fff;display:inline-flex;align-items:center;justify-content:center;color:var(--ink-soft);box-shadow:2px 2px 0 rgba(59,46,85,.55);transition:.05s}
.icon-btn:hover{color:var(--grape)}.icon-btn:active{transform:translate(1px,1px);box-shadow:1px 1px 0 rgba(59,46,85,.55)}

/* inputs */
.input,.select,.textarea{width:100%;font-family:'Nunito';font-size:14px;color:var(--ink);background:#fff;border:2.5px solid var(--line2);border-radius:9px;padding:9px 11px}
.input:focus,.select:focus,.textarea:focus{outline:none;border-color:var(--grape);box-shadow:0 0 0 3px var(--blush)}
.textarea{resize:vertical;min-height:80px;line-height:1.5}
.label{font-family:'Press Start 2P';font-size:8px;letter-spacing:.5px;color:var(--ink-soft);margin-bottom:7px;display:block;text-transform:uppercase}

/* chips + seg */
.chip{display:inline-flex;align-items:center;gap:5px;font-family:'Pixelify Sans';font-weight:600;font-size:12px;padding:2px 10px;border:2px solid var(--ink);border-radius:999px;background:#fff}
.seg{display:inline-flex;background:var(--paper2);border:2px solid var(--line2);border-radius:10px;padding:3px}
.seg button{padding:6px 11px;border-radius:7px;font-family:'Pixelify Sans';font-weight:600;font-size:12.5px;color:var(--ink-soft)}
.seg button.on{background:#fff;color:var(--grape);box-shadow:2px 2px 0 rgba(59,46,85,.35)}

/* shell */
.shell{display:grid;grid-template-columns:166px 1fr;min-height:100vh}
.side{border-right:3px solid var(--ink);background:rgba(255,255,255,.72);backdrop-filter:blur(6px);padding:16px 8px;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;gap:5px}
.brand{display:flex;align-items:center;gap:8px;padding:4px 4px 14px}
.brand .logo{font-family:'Pixelify Sans';font-weight:700;font-size:20px}
.nav{display:flex;align-items:center;gap:8px;padding:9px 8px;border-radius:10px;font-family:'Pixelify Sans';font-weight:600;font-size:14px;color:var(--ink-soft);border:2px solid transparent}
.nav:hover{background:var(--paper2);color:var(--ink)}
.nav.active{background:#fff;color:var(--grape);border-color:var(--ink);box-shadow:2px 2px 0 rgba(59,46,85,.4)}
.main{padding:22px 26px 70px;max-width:1500px;width:100%}
.pagehead{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:18px;flex-wrap:wrap}
.pagehead h1{font-size:28px}

/* game strip */
.strip{display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:#fff;border:3px solid var(--ink);border-radius:14px;box-shadow:var(--shadow);padding:12px 16px;margin-bottom:16px}
.rankpill{font-family:'Press Start 2P';font-size:9px;color:#fff;background:var(--grape);border:2px solid var(--ink);border-radius:7px;padding:6px 8px}
.xpwrap{flex:1;min-width:180px}
.xpbar{height:16px;border:3px solid var(--ink);border-radius:8px;background:#fff;padding:2px;box-shadow:var(--shadow-sm)}
.xpfill{height:100%;border-radius:4px;background:repeating-linear-gradient(90deg,var(--yellow) 0 7px,var(--butter) 7px 10px);transition:width .5s steps(10)}
.xplbl{font-family:'VT323';font-size:15px;color:var(--ink-soft);margin-top:3px}
.streak{font-family:'Pixelify Sans';font-weight:600;display:flex;align-items:center;gap:5px;color:var(--ink)}

/* the night sky (calendar) */
.sky{border:3px solid var(--ink);border-radius:16px;box-shadow:var(--shadow);overflow:hidden;background:
  radial-gradient(2px 2px at 18% 16%, rgba(255,255,255,.85), transparent 60%),
  radial-gradient(2px 2px at 64% 26%, rgba(255,255,255,.75), transparent 60%),
  radial-gradient(1.6px 1.6px at 82% 12%, rgba(255,255,255,.8), transparent 60%),
  radial-gradient(1.6px 1.6px at 38% 40%, rgba(255,255,255,.65), transparent 60%),
  radial-gradient(2px 2px at 90% 48%, rgba(255,255,255,.7), transparent 60%),
  radial-gradient(1.4px 1.4px at 8% 52%, rgba(255,255,255,.6), transparent 60%),
  linear-gradient(180deg,#5B5390 0%, #7C6DAA 34%, #B98DB6 68%, #F4C9CC 100%)}
.sky-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;flex-wrap:wrap}
.sky-top h2{color:#fff;text-shadow:1px 1px 0 rgba(59,46,85,.45)}
.garden-inner{padding:10px 14px 0}
.dow-row{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:6px}
.dow{font-family:'Press Start 2P';font-size:8px;color:rgba(255,255,255,.85);text-align:center}
.plots{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.plot{position:relative;aspect-ratio:1/1;min-width:0;max-width:100%;border:2px solid rgba(255,255,255,.42);border-radius:10px;padding:4px;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;
  background:linear-gradient(180deg, rgba(52,42,88,.34), rgba(92,76,140,.20));box-shadow:inset 0 0 14px rgba(35,26,64,.22);cursor:pointer;transition:.08s}
.plot:hover{border-color:var(--yellow);transform:translateY(-1px)}
.plot.out{opacity:.4}
.plot.today{border-color:var(--pink);box-shadow:0 0 0 3px var(--blush), inset 0 0 16px rgba(255,220,130,.28)}
.plot-n{font-family:'Pixelify Sans';font-weight:700;font-size:12px;color:#FBF3FF;align-self:flex-end;background:rgba(59,46,85,.5);border:1.5px solid rgba(255,255,255,.4);border-radius:5px;padding:0 5px;line-height:1.4}
.plot.today .plot-n{color:var(--ink);background:var(--pink);border-color:var(--ink)}
.blooms{flex:1;display:flex;flex-direction:column;align-content:flex-start;gap:2px;padding-top:3px;width:100%;overflow:hidden}
.bloom-btn{background:none;padding:0;line-height:0}
.ev-chip{display:flex;align-items:center;gap:3px;width:100%;min-width:0;max-width:100%;box-sizing:border-box;padding:1px 3px;border-radius:6px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);cursor:pointer;text-align:left;height:18px;flex:0 0 auto;transition:.05s}
.ev-chip:hover{background:rgba(255,255,255,.34);transform:translateX(1px)}
.ev-chip.dim{opacity:.72;background:rgba(255,255,255,.07);border-style:dashed}
.ev-chip.sel{outline:2px solid var(--yellow);background:rgba(245,210,94,.3)}
.ev-t{flex:1;min-width:0;font-family:'Pixelify Sans';font-weight:600;font-size:8px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 rgba(59,46,85,.45)}
.ev-sub{font-family:'VT323';font-size:11px;color:rgba(255,255,255,.85);flex:0 0 auto}
.more{font-family:'Pixelify Sans';font-weight:600;font-size:10.5px;color:#fff;align-self:flex-start;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.32);border-radius:6px;padding:1px 7px;cursor:pointer}
.more:hover{background:rgba(255,255,255,.36)}
.tick.sm{width:14px;height:14px;border-width:2px;border-radius:4px;flex:0 0 auto}
.sky-tools{display:flex;gap:8px;align-items:center;padding:0 14px 10px;flex-wrap:wrap}
.sky-search{font-family:'Nunito';font-weight:600;font-size:13px;color:var(--ink);background:rgba(255,255,255,.94);border:2px solid var(--ink);border-radius:8px;padding:6px 10px;box-shadow:2px 2px 0 rgba(59,46,85,.4)}
.sky-search::placeholder{color:var(--ink-soft)}
.grass{height:20px;background:linear-gradient(180deg, rgba(255,222,150,.55), transparent);border-top:2px solid rgba(255,255,255,.4);margin-top:10px}

/* full-screen expand */
.sky.expanded{position:fixed;inset:16px;z-index:70;max-width:none;display:flex;flex-direction:column;box-shadow:0 24px 70px rgba(20,14,34,.55)}
.sky.expanded .sky-body{flex:1;display:flex;min-height:0}
.sky.expanded .garden-inner{flex:1;overflow-y:auto;padding-bottom:14px}
.sky-side{width:200px;flex:0 0 auto;overflow-y:auto;padding:10px 12px 16px}
.sky-side.left{border-right:2px solid rgba(255,255,255,.25)}
.sky-side.right{border-left:2px solid rgba(255,255,255,.25)}
.sky-side h4{font-family:'Press Start 2P';font-size:8px;color:rgba(255,255,255,.9);margin:2px 0 8px;display:flex;align-items:center;gap:5px}
.sky-side-row{display:flex;align-items:center;gap:6px;padding:5px 4px;border-radius:7px;cursor:pointer}
.sky-side-row:hover{background:rgba(255,255,255,.14)}
.sky-side-t{flex:1;min-width:0;font-family:'Pixelify Sans';font-weight:600;font-size:11.5px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sky-side-sub{font-family:'VT323';font-size:11.5px;color:rgba(255,255,255,.8);flex:0 0 auto}
.sky-side-empty{font-family:'VT323';font-size:13px;color:rgba(255,255,255,.7);padding:4px}
.track-chip{display:inline-flex;align-items:center;gap:5px;font-family:'Pixelify Sans';font-weight:600;font-size:10.5px;color:#fff;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:2px 8px;margin:2px 3px 2px 0}
.scrim.expand-lock{position:fixed}
@media(max-width:1000px){
  .sky.expanded{inset:0;border-radius:0}
  .sky-side{display:none}
}

/* constellation lanes (drop windows + focus ranges) */
.beds{background:rgba(59,46,85,.26);border:2px dashed rgba(255,255,255,.36);border-radius:11px;padding:8px 10px;margin-bottom:10px}
.beds-title{font-family:'Press Start 2P';font-size:8px;color:rgba(255,255,255,.9);display:flex;align-items:center;gap:6px;margin:2px 2px 6px}
.bed-lane{position:relative}
.bed-bar{position:absolute;height:20px;border:2px solid var(--ink);border-radius:999px;font-family:'Pixelify Sans';font-weight:600;font-size:11px;color:#fff;display:flex;align-items:center;padding:0 8px;overflow:hidden;white-space:nowrap;cursor:pointer;box-shadow:2px 2px 0 rgba(59,46,85,.5)}

/* modal + toast */
.scrim{position:fixed;inset:0;background:rgba(40,30,64,.44);z-index:60;display:flex;align-items:flex-start;justify-content:center;padding:38px 14px;overflow:auto}
.modal{background:var(--card);border:3px solid var(--ink);border-radius:14px;box-shadow:var(--shadow);width:100%;max-width:520px;overflow:hidden;animation:pop .16s ease}
.modal.wide{max-width:720px}
@keyframes pop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.field{margin-bottom:12px}.two{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.toast-wrap{position:fixed;top:16px;right:16px;z-index:80;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast{pointer-events:auto;display:flex;align-items:center;gap:10px;background:#fff;border:3px solid var(--ink);border-radius:12px;box-shadow:var(--shadow);padding:9px 13px;max-width:300px;animation:slidein .22s ease}
@keyframes slidein{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
.toast .ico{width:34px;height:34px;border:2px solid var(--ink);border-radius:8px;background:var(--blush);display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.toast .t{font-family:'Pixelify Sans';font-weight:600;font-size:13.5px}

/* misc */
.stat{border:3px solid var(--ink);border-radius:12px;background:#fff;box-shadow:var(--shadow-sm);padding:12px 14px}
.stat .big{font-family:'Pixelify Sans';font-weight:700;font-size:24px;line-height:1}
.list-row{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:10px;cursor:pointer}
.list-row:hover{background:var(--paper2)}
.tick{width:20px;height:20px;border-radius:6px;border:2.5px solid var(--line2);display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;background:#fff}
.tick.on{background:var(--grape);border-color:var(--ink);color:#fff}
.dot{width:9px;height:9px;border-radius:50%;flex:0 0 auto;border:1.5px solid rgba(59,46,85,.3)}
.swatch{width:26px;height:26px;border-radius:8px;border:2.5px solid transparent;cursor:pointer}
.swatch.on{border-color:var(--ink);transform:scale(1.08)}
.card{background:#fff;border:3px solid var(--ink);border-radius:12px;box-shadow:var(--shadow-sm)}
.empty{text-align:center;padding:30px 18px;color:var(--ink-soft)}
.tl-node{position:relative;padding:0 0 18px 24px;border-left:3px solid var(--line2);margin-left:8px}
.tl-node:last-child{border-left-color:transparent}
.tl-dot{position:absolute;left:-10px;top:2px;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px var(--ink)}
.badge{border:3px solid var(--ink);border-radius:12px;background:#fff;box-shadow:var(--shadow-sm);padding:12px;text-align:center}
.badge.locked{filter:grayscale(1);opacity:.55}
.link-card{display:flex;align-items:center;gap:10px;padding:11px 13px;border:3px solid var(--ink);border-radius:11px;background:#fff;box-shadow:var(--shadow-sm);cursor:pointer;text-decoration:none;color:inherit}
.link-card:hover{transform:translateY(-1px)}
.co-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.co-split{display:grid;grid-template-columns:280px 1fr;gap:14px;align-items:start}
.dash{display:grid;grid-template-columns:1.65fr 0.9fr;gap:16px;align-items:start}
.spark{color:var(--yellow)}
.tabbar{display:none}
@media(max-width:860px){
  .shell{grid-template-columns:1fr}.side{display:none}.main{padding:16px 13px 90px}
  .two{grid-template-columns:1fr}.dash{grid-template-columns:1fr}.co-split{grid-template-columns:1fr}
  .plot{height:76px}
  .tabbar{display:flex;position:fixed;bottom:0;left:0;right:0;background:rgba(255,255,255,.96);border-top:3px solid var(--ink);padding:6px 4px calc(6px + env(safe-area-inset-bottom));justify-content:space-around;z-index:40}
  .tabbar button{display:flex;flex-direction:column;align-items:center;gap:2px;font-family:'Pixelify Sans';font-weight:600;font-size:9.5px;color:var(--ink-faint)}
  .tabbar button.on{color:var(--grape)}
}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;
