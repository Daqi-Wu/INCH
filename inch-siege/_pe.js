const fs = require("fs");
let s = fs.readFileSync("index.html", "utf8");
function rep(a, b) {
  if (!s.includes(a)) { console.log("MISS: " + a.slice(0, 60).replace(/\n/g, " | ")); process.exit(1); }
  s = s.replace(a, b);
}
function cut(a, b, text) {
  const i = s.indexOf(a), j = s.indexOf(b);
  if (i < 0 || j < 0 || j < i) { console.log("CUT MISS: " + a.slice(0, 40)); process.exit(1); }
  s = s.slice(0, i) + text + s.slice(j);
}

// 状态
rep(`    squads: Object.create(null),`, `    equipScroll: 0,          // 装备页纵向滚动量（窗口窄时启用）
    squads: Object.create(null),`);

// 几何 + 布局
cut(`  function layoutEquip(list) {`, `  // ---------- 菜单绘制 ----------`, `  // 装备页有两种排法：
  //  - 够宽就横排四张（原样）
  //  - 窄到每张卡放不下 250px，就改成纵向一列，靠滚轮翻
  function equipVertical() {
    var gap = 18, n = WEAPONS.length;
    return W < n * 250 + (n - 1) * gap + 96;
  }

  function equipViewTop() { return 150; }
  function equipViewH() { return Math.max(160, H - 84 - equipViewTop()); }
  function equipContentH() {
    var gap = 18, n = WEAPONS.length;
    return n * (EQ_H + gap) - gap;
  }
  function equipScrollMax() {
    return equipVertical() ? Math.max(0, equipContentH() - equipViewH()) : 0;
  }

  function equipGeom() {
    var gap = 18, n = WEAPONS.length, v = equipVertical();
    var g = { gap: gap, n: n, vertical: v, top: equipViewTop(), viewH: equipViewH() };
    g.bottom = g.top + g.viewH;
    if (v) {
      g.cw = clamp(W - 96, 220, 460);
      g.x0 = (W - g.cw) / 2;
      g.step = EQ_H + gap;
      g.contentH = equipContentH();
      g.y0 = g.top - game.equipScroll;
    } else {
      g.cw = clamp((W - 96 - gap * (n - 1)) / n, 178, EQ_MAXW);
      g.x0 = W / 2 - (g.cw * n + gap * (n - 1)) / 2;
      g.y0 = clamp(H * 0.52 - EQ_H / 2, 178, Math.max(178, H - EQ_H - 80));
      g.step = g.cw + gap;
      g.contentH = 0;
    }
    return g;
  }

  function equipRect(g, i) {
    return g.vertical
      ? { x: g.x0, y: g.y0 + i * g.step, w: g.cw, h: EQ_H }
      : { x: g.x0 + i * g.step, y: g.y0, w: g.cw, h: EQ_H };
  }

  function layoutEquip(list) {
    var g = equipGeom();
    list.push({ id: "backHome", kind: "nav", target: "home", x: W - 48 - 104, y: 40, w: 104, h: 42 });
    for (var i = 0; i < WEAPONS.length; i++) {
      var r = equipRect(g, i);
      var y1 = Math.max(r.y, g.top), y2 = Math.min(r.y + r.h, g.bottom);
      if (y2 - y1 <= 0) continue;   // 滚出视野的卡片不参与命中
      list.push({ id: "weapon" + i, kind: "weapon", idx: i, x: r.x, y: y1, w: r.w, h: y2 - y1 });
    }
  }

  function drawEquipScrollbar(g) {
    var x = W - 22, h = g.viewH, frac = g.viewH / g.contentH;
    var barH = Math.max(46, h * frac);
    var maxS = g.contentH - g.viewH;
    var y = g.top + (h - barH) * (maxS > 0 ? game.equipScroll / maxS : 0);
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(x, g.top, 3, h);
    ctx.fillStyle = "rgba(140,235,255,0.55)";
    ctx.fillRect(x, y, 3, barH);
  }

`);

// 绘制
cut(`  function drawEquip() {`, `  function drawWeaponCard(u, wp, idx) {`, `  function drawEquip() {
    game.equipScroll = clamp(game.equipScroll, 0, equipScrollMax());
    drawPageTitle("装备选择", "EQUIPMENT");
    drawBackBtn();

    var g = equipGeom();
    if (g.vertical) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, g.top, W, g.viewH);
      ctx.clip();
    }
    for (var i = 0; i < WEAPONS.length; i++) {
      var r = equipRect(g, i);
      if (r.y > g.bottom || r.y + r.h < g.top) continue;
      drawWeaponCard({ x: r.x, y: r.y, w: r.w, h: r.h, id: "weapon" + i }, WEAPONS[i], i);
    }
    if (g.vertical) ctx.restore();

    if (g.vertical && g.contentH > g.viewH) drawEquipScrollbar(g);
    drawFooter(g.vertical ? "滚轮翻看 · 点击卡片切换 · Esc 返回" : "点击卡片切换装备 · Esc 返回");
  }

`);

// 进入装备页重置滚动
rep(`    if (u.kind === "nav") {
      game.screen = u.target;`,
`    if (u.kind === "nav") {
      game.screen = u.target;
      if (u.target === "equip") game.equipScroll = 0;`);

// 滚轮
rep(`  canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });`,
`  canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  // 装备页纵向滚动（只在窄屏的纵向排法下有效）
  canvas.addEventListener("wheel", function (e) {
    if (game.state !== "menu" || game.screen !== "equip") return;
    var max = equipScrollMax();
    if (max <= 0) return;
    e.preventDefault();
    game.equipScroll = clamp(game.equipScroll + e.deltaY, 0, max);
    menuLayout();
  }, { passive: false });`);

fs.writeFileSync("index.html", s);
console.log("equip scroll ok");
