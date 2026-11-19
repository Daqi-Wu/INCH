const fs = require("fs");
let s = fs.readFileSync("index.html", "utf8");
function nl(x) { return x.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n"); }
function rep(a0, b0) {
  const a = nl(a0), b = nl(b0);
  if (!s.includes(a)) { console.log("MISS: " + a0.slice(0, 60).replace(/\r?\n/g, " | ")); process.exit(1); }
  s = s.replace(a, b);
}

rep(
`      dmg: 13, cd: 0.060, spread: 0.0649, speed: 1500, range: 700, r: 2.8, kick: 1.7 },`,
`      dmg: 13, cd: 0.052, spread: 0.0611, speed: 1500, range: 800, r: 2.8, kick: 1.6 },`
);
rep(
`      dmg: 32, cd: 0.15, spread: 0.020, speed: 1100, range: 935, r: 3.2, kick: 1.6 }`,
`      dmg: 32, cd: 0.15, spread: 0.020, speed: 1100, range: 935, r: 3.2, kick: 1.4 }`
);

fs.writeFileSync("index.html", s);
console.log("code ok");
