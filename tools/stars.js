const fs=require('fs');const {solve}=require('./solver');
const s=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');const js=s.split('<script>')[1].split('</script>')[0];
const L=eval(js.match(/const LEVELS = (\[[\s\S]*?\n  \]);/)[1]);
const D={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]};const AR={'^':'N','v':'S','>':'E','<':'W'};
L.forEach((l,i)=>{
  const grid=l.rows.map(r=>r.trim().split(/\s+/));const g={};let pos;
  grid.forEach((r,z)=>r.forEach((t,x)=>{if(t==='.')return;g[x+','+z]=t;if(t==='S')pos=[x,z];}));
  const sol=solve(l.rows).first; const seen=new Set(); const cand=[];
  let [x,z]=pos;
  [...sol].forEach((d,step)=>{
    const [dx,dz]=D[d]; x+=dx; z+=dz;
    while(g[x+','+z]==='+'){ delete g[x+','+z]; x+=dx; z+=dz; }
    const k=x+','+z, t=g[k];
    if(!AR[t]&&/^[a-z]$/.test(t)){ const other=Object.keys(g).find(o=>o!==k&&g[o]===t); delete g[k]; g[other]='0'; [x,z]=other.split(',').map(Number); return; }
    if(t==='1'&&!seen.has(k)) cand.push({k,step:step+1});
    seen.add(k);
  });
  const picks=[0.3,0.6,0.9].map(f=>cand[Math.min(cand.length-1,Math.floor(f*cand.length))]);
  const uniq=[...new Map(picks.map(p=>[p.k,p])).values()];
  console.log(i+1,l.name,sol.length,'moves', JSON.stringify(uniq.map(p=>{const [a,b]=p.k.split(',').map(Number);return [a,b,Math.round((3+p.step*0.8)*2)/2];})));
});
