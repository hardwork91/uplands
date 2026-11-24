// Builds levels from a valid walk (so they are always solvable), then ranks them with the solver.
const {solve}=require('./solver');
const D={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]}, AR={N:'^',S:'v',E:'>',W:'<'};
function mkRng(seed){return()=>((seed=(seed*16807)%2147483647)/2147483647);}
function gen(o,rnd){
  const {W,H}=o; const g={}; const k=(x,z)=>x+','+z; const inb=(x,z)=>x>=0&&z>=0&&x<W&&z<H;
  let x=Math.floor(rnd()*W), z=Math.floor(rnd()*H);
  g[k(x,z)]={t:'S',v:0,e:[]}; const banned=new Set([k(x,z)]);
  const cnt={ice:0,portal:0,key:0,lock:0}; const pressed=[]; const lockOf={};
  const len=o.len[0]+Math.floor(rnd()*(o.len[1]-o.len[0]+1));
  const ok=(a,b)=>inb(a,b)&&!banned.has(k(a,b))&&(!g[k(a,b)]||(g[k(a,b)].v<o.maxV&&g[k(a,b)].t!=='key'));
  for(let steps=0;steps<len;steps++){
    const opts=Object.entries(D).filter(([d,[dx,dz]])=>ok(x+dx,z+dz));
    if(!opts.length) return null;
    const [d,[dx,dz]]=opts[Math.floor(rnd()*opts.length)];
    const nx=x+dx,nz=z+dz,nk=k(nx,nz),fx=nx+dx,fz=nz+dz;
    if(cnt.ice<o.ice && !g[nk] && steps>1 && ok(fx,fz) && rnd()<0.3){
      g[nk]={t:'+',v:0,e:[]}; banned.add(nk);
      if(!g[k(fx,fz)]) g[k(fx,fz)]={t:'n',v:0,e:[]};
      g[k(fx,fz)].v++; g[k(fx,fz)].e.push(d); x=fx; z=fz; cnt.ice++; continue;
    }
    if(cnt.portal<o.portal && !g[nk] && steps>2 && rnd()<0.2){
      const free=[];for(let a=0;a<W;a++)for(let b=0;b<H;b++)if(!g[k(a,b)]&&k(a,b)!==nk&&Math.abs(a-nx)+Math.abs(b-nz)>2)free.push([a,b]);
      if(free.length){const [px,pz]=free[Math.floor(rnd()*free.length)]; const c='ab'[cnt.portal];
        g[nk]={t:'p',c,v:0,e:[]}; g[k(px,pz)]={t:'p',c,v:0,e:[]}; banned.add(nk); banned.add(k(px,pz));
        x=px; z=pz; cnt.portal++; continue;}
    }
    if(!g[nk]){
      if(cnt.key<o.key && steps>0 && rnd()<0.18){ const col=String(cnt.key+1); g[nk]={t:'K',c:col,v:0,e:[]}; banned.add(nk); pressed.push(col); cnt.key++; x=nx; z=nz; continue; }
      const open=pressed.filter(c=>(lockOf[c]||0)<o.locksPerKey);
      if(open.length && rnd()<0.3){ const col=open[Math.floor(rnd()*open.length)]; g[nk]={t:'L',c:col,v:0,e:[]}; lockOf[col]=(lockOf[col]||0)+1; cnt.lock++; }
      else g[nk]={t:'n',v:0,e:[]};
    }
    g[nk].v++; g[nk].e.push(d); x=nx; z=nz;
  }
  if(cnt.ice<o.ice||cnt.portal<o.portal||cnt.key<o.key) return null;
  for(const col of pressed) if(!lockOf[col]) return null;
  let ow=0; for(const c of Object.values(g)) if(c.t==='n'&&c.v===1&&ow<o.oneway&&rnd()<0.35){c.t='o';c.v=0;ow++;}
  if(ow<o.oneway) return null;
  if(Object.values(g).filter(c=>c.t==='n'&&c.v>=2).length<o.twos) return null;
  const rows=[];
  for(let b=0;b<H;b++){const r=[];for(let a=0;a<W;a++){const c=g[k(a,b)];
    r.push(!c?'.':c.t==='S'?'S':c.t==='+'?'+':c.t==='p'?c.c:c.t==='o'?AR[c.e[0]]:c.t==='K'?'K'+c.c:c.t==='L'?('L'+c.c+(c.v>1?':'+c.v:'')):String(c.v));}
    rows.push(r.join(' '));}
  // trim empty rows/cols
  let R=rows.map(r=>r.split(' ')); while(R.length&&R[0].every(t=>t==='.'))R.shift(); while(R.length&&R[R.length-1].every(t=>t==='.'))R.pop();
  while(R[0].length&&R.every(r=>r[0]==='.'))R.forEach(r=>r.shift()); while(R[0].length&&R.every(r=>r[r.length-1]==='.'))R.forEach(r=>r.pop());
  return R.map(r=>r.join(' '));
}
const o=JSON.parse(process.argv[2]); const rnd=mkRng(+process.argv[3]||7);
const out=[],seen=new Set();
for(let i=0;i<(o.tries||6000);i++){const r=gen(o,rnd); if(!r) continue; const key=r.join('|'); if(seen.has(key)) continue; seen.add(key);
  const s=solve(r,o.limit||150000); if(s.sols<1||s.nodes>(o.limit||150000)) continue; out.push({r,s});}
out.sort((a,b)=>(a.s.sols-b.s.sols)||(b.s.deadEnds-a.s.deadEnds));
console.log(JSON.stringify(out.slice(0,3).map(b=>({rows:b.r,sols:b.s.sols,dead:b.s.deadEnds,first:b.s.first}))));
