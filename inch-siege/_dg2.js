const fs = require("fs"), { execSync } = require("child_process"), path = require("path");
const EDGE = "C://Program Files (x86)//Microsoft//Edge//Application//msedge.exe";
const root = process.cwd(), src = fs.readFileSync("index.html", "utf8");
const stamp = Date.now();

const inject = [
"(function () {",
"  var shots = 0, real = soldierShoot;",
"  soldierShoot = function (e, a, g) { shots++; real(e, a, g); };",
"  game.mode = 'solo'; game.screen = 'mode'; startRun();",
"  game.level = 10; game.enemies = []; game.spawnQueue = []; game.bannerTime = 0;",
"  var p = game.player;",
"  p.x = game.spawns[1].x + 140; p.y = game.spawns[1].y;",
"  spawnSquad(game.spawns[1], 0);",
"  for (var f = 0; f < 90; f++) update(1 / 60);",
"  var s = null;",
"  for (var k = 0; k < game.enemies.length; k++) if (game.enemies[k].type === 'soldier') { s = game.enemies[k]; break; }",
"  var sq = game.squads[s.squad];",
"  var gun = FOEGUN[s.gun];",
"  var d = Math.hypot(p.x - s.x, p.y - s.y);",
"  var O = [",
"    '士兵(' + Math.round(s.x) + ',' + Math.round(s.y) + ')  玩家(' + Math.round(p.x) + ',' + Math.round(p.y) + ')  距离 ' + Math.round(d),",
"    'gun=' + s.gun + ' range=' + gun.range + '  在射程内=' + (d <= gun.range),",
"    'losClear=' + losClear(s.x, s.y, p.x, p.y) + '  aware=' + s.aware,  
"    '小队state=' + (sq ? sq.state : 'none') + '  mover=' + (sq ? sq.mover : '-') + '  uid=' + s.uid,",
"    'raise=' + s.raiseT.toFixed(2) + ' cd=' + s.cd.toFixed(2) + ' gap=' + s.gap.toFixed(2) + ' ammo=' + s.ammo + ' 枪=' + shots",
"  ];",
"  game.state = 'menu'; game.screen = 'home';",
"  drawMenu = function () {",
"    ctx.fillStyle = '#0a0e18'; ctx.fillRect(0, 0, W, H);",
"    ctx.textAlign = 'left';",
"    for (var z = 0; z < O.length; z++) {",
"      ctx.font = '500 13px monospace'; ctx.fillStyle = '#7ce7ff';",
"      ctx.fillText(O[z], 20, 60 + z * 32);",
"    }",
"  };",
"})();"
].join("\n");

const out = src.replace(/\n\}\)\(\);\s*<\/script>/, "\n" + inject + "\n})();\n</script>");
fs.writeFileSync(path.join(root, "_shots", "dg2-" + stamp + ".html"), out);
execSync(`"${EDGE}" --headless --disable-gpu --hide-scrollbars --window-size=1500,260 --virtual-time-budget=3000 --screenshot="${path.join(root, "_shots", "57-diag.png")}" "${path.join(root, "_shots", "dg2-" + stamp + ".html")}"`, { stdio: "ignore" });
console.log("57-diag.png");
