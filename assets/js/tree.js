const CONFIG = {
  dataFile: '/roots-and-branches/people.json',
  imageRoot: '/roots-and-branches/assets/images/people/',
  id:'id', label:'name', parent:'parents', spouse:'spouses'
};

let PEOPLE={}, ROOT;

fetch(CONFIG.dataFile).then(r=>r.json()).then(data=>{
  data.forEach(p=>PEOPLE[p.id]=p);
  buildPicker(data);
});

function buildPicker(list){
  const sel=document.getElementById('rootPicker');
  list.forEach(p=>{
    const o=document.createElement('option');
    o.value=p.id; o.textContent=p.name; sel.appendChild(o);
  });
  sel.onchange=()=>renderTree(sel.value);
  renderTree(list[0].id);
}

function renderTree(rootId){
  ROOT=rootId;
  const tree=document.getElementById('tree');
  tree.innerHTML='';
  const gens=[ ancestors(rootId,3).reverse(), [PEOPLE[rootId]], descendants(rootId,3) ];
  gens.forEach(g=>{
    const row=document.createElement('div'); row.className='generation';
    g.forEach(p=>row.appendChild(node(p)));
    tree.appendChild(row);
  });
}

function ancestors(id,d){
  if(d==0) return [];
  const p=PEOPLE[id]; if(!p.parents) return [];
  return p.parents.flatMap(r=>[PEOPLE[r.id], ...ancestors(r.id,d-1)]);
}

function descendants(id,d){
  if(d==0) return [];
  const kids=Object.values(PEOPLE).filter(p=>p.parents?.some(r=>r.id===id));
  return kids.flatMap(k=>[k, ...descendants(k.id,d-1)]);
}

function node(p){
  const d=document.createElement('div'); d.className='person-node';
  if(p.photo){
    const im=document.createElement('img');
    im.src=CONFIG.imageRoot+p.photo;
    const wrap=document.createElement('div'); wrap.className='portrait';
    wrap.appendChild(im); d.appendChild(wrap);
  } else d.appendChild(document.createElement('div')).className='portrait';

  d.innerHTML+=`<div class="person-name">${p.name}</div>`;
  const b=document.createElement('button'); b.className='expand-btn'; b.textContent='+';
  b.onclick=e=>{e.stopPropagation();renderTree(p.id)};
  d.appendChild(b);
  d.onclick=()=>openModal(p);
  return d;
}

function openModal(p){
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modal-name').textContent=p.name;
  document.getElementById('modal-details').innerHTML=
    Object.entries(p).map(([k,v])=>`<p><b>${k}</b>: ${JSON.stringify(v)}</p>`).join('');
}
document.getElementById('modal-close').onclick=()=>document.getElementById('modal').classList.add('hidden');
