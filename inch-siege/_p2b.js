const fs = require("fs");
let s = fs.readFileSync("index.html", "utf8");
function nl(x) { return x.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n"); }
function rep(a, b) {
  a = nl(a); b = nl(b);
  if (!s.includes(a)) { console.log("MISS: " + a.slice(0, 60).replace(/\r?\n/g, " | ")); process.exit(1); }
  s = s.replace(a, b);
}

rep(
`  function gunGeom(r, id, sc, x0) {
    var isR = id === "rifle";
    var k = r * sc;
    var len = (isR ? 1.66 : 1.06) * k;
    return {
      k: k, isR: isR, x0: x0, len: len,
      H: (isR ? 0.26 : 0.30) * k,       // 机匣高度
      gw: k * 0.15,                      // 握把宽
      gh: k * (isR ? 0.36 : 0.33),       // 握把长（约等于机匣高，再长就像站在一根棍上）
      gx: x0 + len * 0.17
    };
  }`,
`  // 三把枪是同一个家族的三种口径：长度、机匣厚度，加一块附属件
  // AL-11 手枪（最短，光板） / AL-15 冲锋枪（中段挂弹匣） / AL-18 步枪（最长，背上一条瞄轨）
  var GUNART = {
    al11: { len: 1.06, H: 0.30, gh: 0.33, rail: false, mag: false },
    al15: { len: 1.26, H: 0.28, gh: 0.34, rail: false, mag: true },
    al18: { len: 1.66, H: 0.26, gh: 0.36, rail: true, mag: false }
  };

  function gunGeom(r, id, sc, x0) {
    var a = GUNART[id] || GUNART.al18;
    var k = r * sc;
    var len = a.len * k;
    return {
      k: k, art: a, x0: x0, len: len,
      H: a.H * k,                        // 机匣高度
      gw: k * 0.15,                      // 握把宽
      gh: a.gh * k,                      // 握把长（约等于机匣高，再长就像站在一根棍上）
      gx: x0 + len * 0.17
    };
  }`
);

rep(
`    ctx.lineTo(x0 + L * 0.34, H * 0.5);
    ctx.lineTo(x0 + L * 0.05, H * 0.5);`,
`    ctx.lineTo(x0 + L * 0.34, H * 0.5);
    if (g.art.mag) {                     // 冲锋枪：机匣前下方挂一只弹匣
      ctx.lineTo(x0 + L * 0.38, H * 0.5);
      ctx.lineTo(x0 + L * 0.39, H * 1.02);
      ctx.lineTo(x0 + L * 0.50, H * 1.02);
      ctx.lineTo(x0 + L * 0.51, H * 0.5);
    }
    ctx.lineTo(x0 + L * 0.05, H * 0.5);`
);

rep(
`    // 瞄轨：只有步枪有，一根贴在顶上的细梁——两把枪的差别就靠它
    if (g.isR) {`,
`    // 瞄轨：只有步枪有，一根贴在顶上的细梁
    if (g.art.rail) {`
);

fs.writeFileSync("index.html", s);
console.log("gun art ok");
