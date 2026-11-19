const fs = require("fs");
let s = fs.readFileSync("index.html", "utf8");
function nl(x) { return x.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n"); }
function rep(a, b) {
  a = nl(a); b = nl(b);
  if (!s.includes(a)) { console.log("MISS: " + a.slice(0, 60).replace(/\r?\n/g, " | ")); process.exit(1); }
  s = s.replace(a, b);
}

// AL-11 的散布应为 0.90°（0.0157rad）；AL-18 保留旧 AL-11 的 0.020rad
rep(
`      dmg: 52, cd: 0.25, spread: 0.020, speed: 1000, range: 800, r: 2.8, kick: 0.8 },`,
`      dmg: 52, cd: 0.25, spread: 0.0157, speed: 1000, range: 800, r: 2.8, kick: 0.8 },`
);

// 弹匣改成前握把：弹匣挂在枪管下方会与枪身脱开，看着像块浮着的方块
rep(
`    al11: { len: 1.06, H: 0.30, gh: 0.33, rail: false, mag: false },
    al15: { len: 1.26, H: 0.28, gh: 0.34, rail: false, mag: true },
    al18: { len: 1.66, H: 0.26, gh: 0.36, rail: true, mag: false }`,
`    al11: { len: 1.06, H: 0.30, gh: 0.33, rail: false, fore: false },
    al15: { len: 1.26, H: 0.28, gh: 0.34, rail: false, fore: true },
    al18: { len: 1.66, H: 0.26, gh: 0.36, rail: true, fore: false }`
);

rep(
`    ctx.lineTo(x0 + L * 0.34, H * 0.5);          // 台阶回到机匣底
    if (g.art.mag) {                             // 冲锋枪：机匣前下方挂一只弹匣
      ctx.lineTo(x0 + L * 0.38, H * 0.5);
      ctx.lineTo(x0 + L * 0.39, H * 1.02);
      ctx.lineTo(x0 + L * 0.50, H * 1.02);
      ctx.lineTo(x0 + L * 0.51, H * 0.5);
    }
    ctx.lineTo(x0 + L * 0.05, H * 0.5);`,
`    ctx.lineTo(x0 + L * 0.34, H * 0.5);          // 台阶回到机匣底
    ctx.lineTo(x0 + L * 0.05, H * 0.5);`
);

rep(
`  // 握把：一根直角细条，从机匣底向后下方斜插
  function gunGrip(g) {`,
`  // 前握把：冲锋枪才有，从枪管底下垂下来的一小段——"双握把"就是它和手枪的全部差别
  function gunFore(g) {
    var w = g.k * 0.12, h = g.k * 0.24;
    ctx.save();
    ctx.translate(g.x0 + g.len * 0.55, g.H * 0.24);
    ctx.rotate(0.10);
    ctx.rect(-w / 2, 0, w, h);
    ctx.restore();
  }

  // 握把：一根直角细条，从机匣底向后下方斜插
  function gunGrip(g) {`
);

rep(
`    ctx.beginPath();
    gunBody(g);
    gunGrip(g);
    ctx.lineJoin = "miter";`,
`    ctx.beginPath();
    gunBody(g);
    gunGrip(g);
    if (g.art.fore) gunFore(g);
    ctx.lineJoin = "miter";`
);

rep(
`    // 握把压暗一档，不然整把枪是一块白
    ctx.beginPath();
    gunGrip(g);
    ctx.fillStyle = "rgba(112,152,192,1)";
    ctx.fill();`,
`    // 握把压暗一档，不然整把枪是一块白
    ctx.beginPath();
    gunGrip(g);
    if (g.art.fore) gunFore(g);
    ctx.fillStyle = "rgba(112,152,192,1)";
    ctx.fill();`
);

fs.writeFileSync("index.html", s);
console.log("spread + foregrip ok");
