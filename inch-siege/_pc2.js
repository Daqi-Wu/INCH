const fs = require("fs");
let s = fs.readFileSync("index.html", "utf8");
function nl(x) { return x.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n"); }
function cut(a0, b0, text) {
  const a = nl(a0), b = nl(b0);
  const i = s.indexOf(a), j = s.indexOf(b);
  if (i < 0 || j < 0 || j < i) { console.log("CUT MISS: " + a0.slice(0, 40)); process.exit(1); }
  s = s.slice(0, i) + nl(text) + s.slice(j);
}
function rep(a0, b0) {
  const a = nl(a0), b = nl(b0);
  if (!s.includes(a)) { console.log("MISS: " + a0.slice(0, 60).replace(/\r?\n/g, " | ")); process.exit(1); }
  s = s.replace(a, b);
}

const loop = `    // 敌人
    var px = p.x, py = p.y;
    if (game.mode === "solo") updateField();

    // 小队先更新状态：谁在推进、要不要后撤
    for (var sid in game.squads) squadTick(game.squads[sid], dt);

    for (var j = game.enemies.length - 1; j >= 0; j--) {
      var e = game.enemies[j];
      if (!e) continue;
      e.hurt = Math.max(0, e.hurt - dt);
      e.hitCd = Math.max(0, e.hitCd - dt);
      e.wobble += dt * 6;
      if (e.emerge > 0) e.emerge = Math.max(0, e.emerge - dt);

      // 谁在视野里：玩家优先，其次是士兵。看不见就只是"搜索前进"
      var tgt = pickTarget(e, p);
      e.aware = !!tgt;

      if (e.type === "soldier") {
        soldierThink(e, dt, p, tgt);
      } else {
        var nt = navTarget(e);
        var gx2 = nt ? nt.x : px, gy2 = nt ? nt.y : py;
        if (tgt && tgt.kind === "soldier") { gx2 = tgt.x; gy2 = tgt.y; }
        var dx = gx2 - e.x, dy = gy2 - e.y;
        var d = Math.hypot(dx, dy) || 1;
        var nx = dx / d, ny = dy / d;

        var sepX = 0, sepY = 0;
        for (var k2 = 0; k2 < game.enemies.length; k2++) {
          if (k2 === j) continue;
          var o = game.enemies[k2];
          var ddx = e.x - o.x, ddy = e.y - o.y;
          var dd = Math.hypot(ddx, ddy);
          if (dd > 0 && dd < e.r + o.r) {
            sepX += (ddx / dd) * (e.r + o.r - dd) * 2.2;
            sepY += (ddy / dd) * (e.r + o.r - dd) * 2.2;
          }
        }

        var mvx, mvy;
        if (e.type === "gunner") {
          // 距离带按到玩家的直线距离算：d 是到寻路路点的距离，不能拿来判距
          var pd = Math.hypot(p.x - e.x, p.y - e.y) || 1;
          gunnerThink(e, p, dt, pd, nx, ny);
          var slow = e.charge >= 0 ? 0.25 : 1;
          var ax2 = 0, ay2 = 0;
          if (pd > GUNNER.far) { ax2 = nx; ay2 = ny; }
          else if (pd < GUNNER.near) { ax2 = -nx; ay2 = -ny; }
          else { ax2 = -ny * e.strafe; ay2 = nx * e.strafe; }
          mvx = ax2 * e.speed * slow + sepX + e.vx;
          mvy = ay2 * e.speed * slow + sepY + e.vy;
        } else {
          var wob = Math.sin(e.wobble) * 0.28;
          var spd = e.aware ? e.speed : e.speed * 0.7;   // 没发现：70% 速度搜索前进
          mvx = nx * spd + sepX + (-ny) * wob * spd * 0.5 + e.vx;
          mvy = ny * spd + sepY + (nx) * wob * spd * 0.5 + e.vy;
        }

        if (e.emerge > 0) { mvx *= 0.35; mvy *= 0.35; }
        moveCircle(e, mvx * dt, mvy * dt, game.mode !== "solo");

        // 横移撞墙就换个方向绕，不然它会贴着墙左右抖
        e.strafeCd = Math.max(0, e.strafeCd - dt);
        if (e.type === "gunner" && e.charge < 0 && e.strafeCd <= 0 && (e.blockX || e.blockY)) {
          e.strafe = -e.strafe;
          e.strafeCd = 0.4;
        }

        e.vx *= Math.pow(0.0025, dt);
        e.vy *= Math.pow(0.0025, dt);
      }

      // 接触伤害：对玩家（还没发现你的时候不咬人）
      var rr = e.r + p.r;
      var pdd = dist2(e.x, e.y, px, py);
      if (e.emerge <= 0 && e.aware && pdd < rr * rr) {
        var pdx = Math.sqrt(pdd) || 1;
        var kx = (e.x - px) / pdx, ky = (e.y - py) / pdx;
        moveCircle(e, kx * (rr - pdx), ky * (rr - pdx), game.mode !== "solo");
        if (e.hitCd <= 0 && p.invuln <= 0 && p.dashTime <= 0) {
          p.hp -= e.dmg;
          p.invuln = 0.55;
          e.hitCd = 0.7;
          game.shake = Math.min(game.shake + 8, 16);
          game.hitFlash = 0.6;
          e.vx = kx * 320;
          e.vy = ky * 320;
          moveCircle(p, kx * 14, ky * 14);
          burst(px, py, "#ff5b5b", 14, 220);
          if (p.hp <= 0) { die(); return; }
        }
      }

      // 接触伤害：对士兵（围城敌人打士兵，护甲 0.6）
      if (e.type !== "soldier" && e.emerge <= 0 && e.hitCd <= 0) {
        for (var m2 = 0; m2 < game.enemies.length; m2++) {
          var s3 = game.enemies[m2];
          if (s3.type !== "soldier") continue;
          var r2 = e.r + s3.r;
          if (dist2(e.x, e.y, s3.x, s3.y) < r2 * r2) {
            s3.hp -= e.dmg * SOLDIER.armor;
            s3.hurt = 0.12;
            e.hitCd = 0.7;
            burst(s3.x, s3.y, s3.color, 5, 130);
            if (s3.hp <= 0) {
              burst(s3.x, s3.y, s3.color, 18, 260);
              game.enemies.splice(m2, 1);
            }
            break;
          }
        }
      }
    }

`;

cut("    // 敌人\n    var px = p.x, py = p.y;", "    // 补给", loop);

// 士兵子弹也能打死围城敌人（不给玩家分）
rep(
`        var fr = fo.r + p.r;
        if (p.invuln <= 0 && p.dashTime <= 0 &&`,
`        if (fo.side === "soldier") {
          for (var m4 = 0; m4 < game.enemies.length; m4++) {
            var s4 = game.enemies[m4];
            if (s4.type === "soldier") continue;
            var hr2 = s4.r + fo.r;
            if (dist2(fo.x, fo.y, s4.x, s4.y) < hr2 * hr2) {
              hurtEnemy(m4, fo, true);
              foeDone = true;
              break;
            }
          }
          if (foeDone) break;
        }

        var fr = fo.r + p.r;
        if (p.invuln <= 0 && p.dashTime <= 0 &&`
);

fs.writeFileSync("index.html", s);
console.log("patch C2 ok");
