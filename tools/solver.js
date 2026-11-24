// Same rules as the game: 4-dir moves, collect 1 per entry, tile falls when you leave it at 0,
// oneway tiles (1 coin) only enterable moving in their arrow dir, portal pairs teleport.
const DIRS = { N:[0,-1], S:[0,1], E:[1,0], W:[-1,0] };
const ARROW = { '^':'N', 'v':'S', '>':'E', '<':'W' };
function parse(rows){
  const cells = {}; let start;
  rows.forEach((r,z)=> r.trim().split(/\s+/).forEach((t,x)=>{
    if (t==='.') return;
    const k = x+','+z;
    if (t==='S'){ cells[k]={kind:'normal',coins:0}; start=[x,z]; }
    else if (/^\d$/.test(t)) cells[k]={kind:'normal',coins:+t};
    else if (ARROW[t]) cells[k]={kind:'oneway',coins:0,dir:ARROW[t]};
    else if (/^[a-z]$/.test(t)) cells[k]={kind:'portal',coins:0,color:t};
    else if (t==='+') cells[k]={kind:'ice',coins:0};
    else if (/^K\d$/.test(t)) cells[k]={kind:'key',coins:0,color:t[1]};
    else if (/^L\d(:\d)?$/.test(t)) cells[k]={kind:'lock',coins:t[3]?+t[3]:1,color:t[1]};
    else throw new Error('bad token '+t);
  }));
  for (const [k,c] of Object.entries(cells)) if (c.kind==='portal')
    c.pair = Object.keys(cells).find(o=>o!==k && cells[o].kind==='portal' && cells[o].color===c.color);
  return {cells,start};
}
function solve(rows, limit=1e6){
  const {cells,start}=parse(rows);
  const keys=Object.keys(cells);
  let sols=0, first=null, nodes=0, deadEnds=0;
  const st = {}; keys.forEach(k=>st[k]={...cells[k]});
  function total(){ let t=0; for(const k in st) if(st[k]) t+=st[k].coins; return t; }
  function rec(pos, path){
    if (++nodes>limit) return;
    if (total()===0){ sols++; if(!first) first=path.join(''); return; }
    let moved=false;
    for (const [d,[dx,dz]] of Object.entries(DIRS)){
      const [x,z]=pos.split(',').map(Number);
      let cx=x+dx, cz=z+dz; const ices=[]; let t, tk, ok=true;
      for(;;){ tk=cx+','+cz; t=st[tk]; if(!t||(t.kind==='oneway'&&t.dir!==d)||t.kind==='lock'){ok=false;break;}
        if(t.kind!=='ice') break; ices.push(tk); cx+=dx; cz+=dz; }
      if(!ok) continue;
      moved=true;
      const cur=st[pos]; const fellCur = cur.coins===0;
      if (fellCur) st[pos]=null;
      const iceSave=ices.map(k=>st[k]); ices.forEach(k=>st[k]=null);
      if (t.kind==='portal'){
        const pk=t.pair, saveP=st[pk];
        st[tk]=null; st[pk]={kind:'normal',coins:0};
        rec(pk, path.concat(d));
        st[tk]=t; st[pk]=saveP;
      } else {
        const had=t.coins>0; if(had) t.coins--;
        const opened=[]; if(t.kind==='key') for(const kk in st){const o=st[kk]; if(o&&o.kind==='lock'&&o.color===t.color){o.kind='open';opened.push(o);}}
        rec(tk, path.concat(d));
        opened.forEach(o=>o.kind='lock');
        if(had) t.coins++;
      }
      ices.forEach((k,i)=>st[k]=iceSave[i]);
      if (fellCur) st[pos]=cur;
    }
    if(!moved) deadEnds++;
  }
  rec(start.join(','), []);
  return {sols, first, deadEnds, nodes};
}
module.exports={solve,parse};
