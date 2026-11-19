const fs = require("fs");
let s = fs.readFileSync("index.html", "utf8");
function rep(a, b) {
  if (!s.includes(a)) { console.log("MISS: " + a.slice(0, 60).replace(/\n/g, " | ")); process.exit(1); }
  s = s.replace(a, b);
}

// ---- 1. AL-08 开放给玩家（仅三连发，按住自动接下一轮） ----
rep(
`  var WEAPONS = [
    { id: "al10", cn: "AL-10", en: "LASER PISTOL",`,
`  var WEAPONS = [
    { id: "al08", cn: "AL-08", en: "LASER RIFLE",
      dmg: 25, cd: 0.20, spread: 0.0227, speed: 950, range: 800, r: 3.2, kick: 1.6,
      holdBurst: true,                     // 只有三连发一种模式，按住就一轮接一轮
      modes: [
        { id: "burst", cn: "三连发", spread: 0.0227, burst: 3, gap: 0.4 / 3 }
      ] },
    { id: "al10", cn: "AL-10", en: "LASER PISTOL",`
);

// 默认武器后移一位（AL-11 现在是第 3 个）
rep(`    weapon: 1,          // 默认 AL-11；AL-10 是最弱的那把，别让人一上来就拿它`,
    `    weapon: 2,          // 默认 AL-11（下标 2）；前面是 AL-08 / AL-10，别让人一上来就拿弱枪`);
rep(`    fireMode: [0, 0, 0, 0],  // 每把枪各自记住上次选的模式`,
    `    fireMode: [0, 0, 0, 0, 0],  // 每把枪各自记住上次选的模式`);

// 三连发的"按住连发"开关
rep(
`      if (mNow.burst > 1) {
        if (p.trigger) {`,
`      if (mNow.burst > 1) {
        if (p.trigger || wNow.holdBurst) {`
);

// ---- 2. 卡片缩小 ----
rep(`  var EQ_MAXW = 250, EQ_H = 344;`, `  var EQ_MAXW = 210, EQ_H = 288;`);
rep(
`    var cw = clamp((W - 96 - gap * (n - 1)) / n, 178, EQ_MAXW);
    var x0 = W / 2 - (cw * n + gap * (n - 1)) / 2;`,
`    var cw = clamp((W - 96 - gap * (n - 1)) / n, 150, EQ_MAXW);
    var x0 = W / 2 - (cw * n + gap * (n - 1)) / 2;`
);
rep(`      g.cw = clamp((W - 96 - gap * (n - 1)) / n, 178, EQ_MAXW);`,
    `      g.cw = clamp((W - 96 - gap * (n - 1)) / n, 150, EQ_MAXW);`);
rep(`    return W < n * 250 + (n - 1) * gap + 96;`, `    return W < n * 210 + (n - 1) * gap + 96;`);

// 卡片内部：整体压缩
rep(
`    var r = 42, sc = 2.35;
    var sp = gunSpan(r, wp.id, sc);
    ctx.save();
    ctx.translate(u.x + u.w / 2 - (sp.min + sp.max) / 2, u.y + 74);`,
`    var r = 34, sc = 1.85;
    var sp = gunSpan(r, wp.id, sc);
    ctx.save();
    ctx.translate(u.x + u.w / 2 - (sp.min + sp.max) / 2, u.y + 62);`
);
rep(
`    ctx.font = "700 20px " + C.mono;
    ctx.fillStyle = C.text;
    ctx.fillText(wp.cn, u.x + 22, u.y + 146);
    ctx.font = "500 10px " + C.mono;
    ctx.fillStyle = on ? C.player : C.text2;
    ctx.letterSpacing = "0.18em";
    ctx.fillText(wp.en, u.x + 23, u.y + 165);
    ctx.letterSpacing = "0px";

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(u.x + 22, u.y + 180, u.w - 44, 1);`,
`    ctx.font = "700 17px " + C.mono;
    ctx.fillStyle = C.text;
    ctx.fillText(wp.cn, u.x + 18, u.y + 118);
    ctx.font = "500 9px " + C.mono;
    ctx.fillStyle = on ? C.player : C.text2;
    ctx.letterSpacing = "0.16em";
    ctx.fillText(wp.en, u.x + 19, u.y + 133);
    ctx.letterSpacing = "0px";

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(u.x + 18, u.y + 145, u.w - 36, 1);`
);
rep(
`      var ry = u.y + 206 + i * 27;
      ctx.textAlign = "left";
      ctx.font = "500 13px " + C.mono;
      ctx.fillStyle = "rgba(160,190,215,0.78)";
      ctx.fillText(rows[i][0], u.x + 22, ry);
      ctx.textAlign = "right";
      ctx.font = "600 13px " + C.mono;
      ctx.fillStyle = on ? C.player : C.text;
      ctx.fillText(rows[i][1], u.x + u.w - 22, ry);`,
`      var ry = u.y + 166 + i * 22;
      ctx.textAlign = "left";
      ctx.font = "500 11px " + C.mono;
      ctx.fillStyle = "rgba(160,190,215,0.78)";
      ctx.fillText(rows[i][0], u.x + 18, ry);
      ctx.textAlign = "right";
      ctx.font = "600 11px " + C.mono;
      ctx.fillStyle = on ? C.player : C.text;
      ctx.fillText(rows[i][1], u.x + u.w - 18, ry);`
);
rep(
`    ctx.arc(u.x + u.w - 26, u.y + 26, 5, 0, Math.PI * 2);`,
`    ctx.arc(u.x + u.w - 22, u.y + 22, 4.5, 0, Math.PI * 2);`
);

fs.writeFileSync("index.html", s);
console.log("patch ok");
