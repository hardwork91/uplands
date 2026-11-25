// Solver de Uplands con las reglas actuales:
// - Te mueves en 4 direcciones. Cada vez que entras en una casilla gastas un paso; al salir de una
//   casilla sin pasos, cae. Cada casilla lleva como máximo 1 bidón, que se recoge al entrar.
// - Ganas al recoger todos los bidones.
// Notación de los niveles:
//   S inicio (0 pasos) · 1-9 casilla con bidón y ese número de pasos · . hueco
//   ^ v < > sentido único (1 paso, sin bidón; solo se entra moviéndose en esa dirección)
//   + hielo (1 paso) · +2 hielo de 2 pasos: resbalas a la casilla siguiente; si detrás hay hueco, caes
//   a b portales en pares (entras por uno y sales por el otro; los dos desaparecen)
//   K1 interruptor del color 1 (1 paso, sin bidón) · L1 barrera del color 1 (1 paso, con bidón)
const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const ARROW = { '^': 'N', 'v': 'S', '>': 'E', '<': 'W' };

function parse(rows) {
  const cells = {}; let start;
  rows.forEach((r, z) => r.trim().split(/\s+/).forEach((t, x) => {
    if (t === '.') return;
    const k = x + ',' + z;
    if (t === 'S') { cells[k] = { kind: 'normal', fuel: 0, passes: 0 }; start = k; }
    else if (/^\d$/.test(t)) cells[k] = { kind: 'normal', fuel: +t > 0 ? 1 : 0, passes: +t };
    else if (ARROW[t]) cells[k] = { kind: 'oneway', fuel: 0, passes: 1, dir: ARROW[t] };
    else if (/^[a-z]$/.test(t)) cells[k] = { kind: 'portal', fuel: 0, passes: 1, color: t };
    else if (/^\+(2)?$/.test(t)) cells[k] = { kind: 'ice', fuel: 0, passes: t === '+2' ? 2 : 1 };
    else if (/^K\d$/.test(t)) cells[k] = { kind: 'key', fuel: 0, passes: 1, color: t[1] };
    else if (/^L\d(:\d)?$/.test(t)) cells[k] = { kind: 'lock', fuel: 1, passes: 1, color: t[1] };   // barreras: siempre 1 paso
    else throw new Error('ficha desconocida: ' + t);
  }));
  for (const [k, c] of Object.entries(cells)) if (c.kind === 'portal')
    c.pair = Object.keys(cells).find(o => o !== k && cells[o].kind === 'portal' && cells[o].color === c.color);
  return { cells, start };
}

// Aplica un movimiento; devuelve el estado nuevo y la posición, o null si no se puede (o te caes)
function step(s, p, d) {
  const [x, z] = p.split(',').map(Number), [dx, dz] = DIRS[d];
  let cx = x + dx, cz = z + dz; const ices = [];
  let tk, t;
  for (;;) {
    tk = cx + ',' + cz; t = s[tk];
    if (!t || (t.kind === 'oneway' && t.dir !== d) || t.kind === 'lock') return null;
    if (t.kind !== 'ice') break;
    ices.push(tk); cx += dx; cz += dz;
  }
  const n = { ...s };
  if (n[p].passes <= 0) delete n[p];
  for (const k of ices) { const left = n[k].passes - 1; if (left <= 0) delete n[k]; else n[k] = { ...n[k], passes: left }; }
  if (t.kind === 'portal') { delete n[tk]; n[t.pair] = { kind: 'normal', fuel: 0, passes: 0 }; return [n, t.pair]; }
  n[tk] = { ...t, kind: 'normal', fuel: 0, passes: Math.max(0, t.passes - 1) };
  if (t.kind === 'key') for (const k in n) if (n[k].kind === 'lock' && n[k].color === t.color) n[k] = { ...n[k], kind: 'normal' };
  return [n, tk];
}
const fuelLeft = s => { let f = 0; for (const k in s) f += s[k].fuel; return f; };

// Cuenta soluciones (hasta maxSols) y callejones sin salida; first = primera solución encontrada
function solve(rows, limit = 1e6, maxSols = 1e9) {
  const { cells, start } = parse(rows);
  let sols = 0, first = null, nodes = 0, deadEnds = 0;
  function rec(s, p, path) {
    if (++nodes > limit || sols >= maxSols) return;
    if (fuelLeft(s) === 0) { sols++; if (!first) first = path.join(''); return; }
    let moved = false;
    for (const d of Object.keys(DIRS)) {
      const r = step(s, p, d);
      if (!r) continue;
      moved = true;
      rec(r[0], r[1], path.concat(d));
    }
    if (!moved) deadEnds++;
  }
  rec(cells, start, []);
  return { sols, first, deadEnds, nodes };
}
module.exports = { solve, parse, step };
