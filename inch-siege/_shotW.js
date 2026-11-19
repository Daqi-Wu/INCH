const fs = require("fs"), { execSync } = require("child_process"), path = require("path");
const EDGE = "C://Program Files (x86)//Microsoft//Edge//Application//msedge.exe";
const root = process.cwd(), src = fs.readFileSync("index.html", "utf8");
const stamp = Date.now();
function build(name, inject) {
  const out = src.replace(/\n\}\)\(\);\s*<\/script>/, "\n" + inject + "\n})();\n</script>");
  const p = path.join(root, "_shots", name + "-" + stamp + ".html");
  fs.writeFileSync(p, out); return p;
}
function shot(file, w, h, out) {
  const abs = path.join(root, "_shots", out + ".png");
  execSync(`"${EDGE}" --headless --disable-gpu --hide-scrollbars --window-size=${w},${h} --virtual-time-budget=4000 --screenshot="${abs}" "${file}"`, { stdio: "ignore" });
  console.log(out + ".png");
}
fs.mkdirSync("_shots", { recursive: true });

const equip = build("eq3", `
  (function () {
    var f = render;
    render = function (t) {
      if (game.screen !== "equip") { game.screen = "equip"; menuLayout(); game.pageT = 1; }
      mouse.x = W * 0.5; mouse.y = H * 0.16;
      f(t);
    };
  })();
`);

const home = build("home3", `
  (function () {
    var f = drawMenu;
    drawMenu = function (t) {
      mouse.x = W * 0.72; mouse.y = H * 0.30;
      var it = hitUi(mouse.x, mouse.y); game.hoverId = it ? it.id : null;
      f(t);
    };
  })();
`);

// 三把枪分别进对局，各截一张（r=14 放大的样子最难看，所以看实机）
function playShot(idx) {
  return build("play" + idx, `
    (function () {
      game.mode = "solo"; game.screen = "mode";
      game.weapon = ${idx};
      startRun();
      game.level = 7; game.bannerTime = 0; game.spawnQueue = [];
      var p = game.player;
      spawnEnemy("chaser", { x: p.x + 150, y: p.y - 40 });
      spawnEnemy("fast", { x: p.x - 160, y: p.y + 60 });
      mouse.x = W * 0.66; mouse.y = H * 0.36;
      for (var i = 0; i < 40; i++) { update(1 / 60); }
      game.player.combat = 0.2;
      game.player.muzzle = 0.07;
    })();
  `);
}

shot(equip, 1440, 900, "20-equip3");
shot(home, 1440, 900, "21-home3");
shot(playShot(1), 1440, 900, "22-play-al15");
