// Comprueba que todos los niveles de index.html tienen solución: node tools/check-levels.js
const fs = require('fs'), path = require('path');
const { solve } = require('./solver');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const js = html.split('<script>')[1].split('</script>')[0];
const LEVELS = eval(js.match(/const LEVELS = (\[[\s\S]*?\n  \]);/)[1]);
let bad = 0;
LEVELS.forEach((l, i) => {
  const r = solve(l.rows, 400000);
  console.log(`${String(i + 1).padStart(2)} ${l.name.padEnd(18)} soluciones: ${r.sols}  callejones: ${r.deadEnds}`);
  if (!r.sols) bad++;
});
process.exit(bad ? 1 : 0);
