const MAX_DEPTH = 3;
const SVG_NS = "http://www.w3.org/2000/svg";

let PEOPLE = [];
let PEOPLE_BY_ID = {};
let SCHEMA = null;

fetch('/roots-and-branches/people.json')
  .then(r => r.json())
  .then(data => {
    PEOPLE = data;
    PEOPLE.forEach(p => PEOPLE_BY_ID[p.id] = p);
    return fetch('/roots-and-branches/assets/data/schema-people.json');
  })
  .then(r => r.json())
  .then(schema => {
    SCHEMA = schema;
    initUI();
  });

function initUI(){
  const select = document.getElementById("root-select");
  PEOPLE.forEach(p => {
    const o = document.createElement("option");
    o.value = p.id;
    o.textContent = p.name;
    select.appendChild(o);
  });
  select.value = "P0001";
  renderTree(select.value);
  select.onchange = () => renderTree(select.value);
}

function renderTree(rootId){
  const container = document.getElementById("tree-container");
  container.innerHTML = "";

  const svg = document.createElementNS(SVG_NS,"svg");
  svg.setAttribute("width","3000");
  svg.setAttribute("height","2000");
  container.appendChild(svg);

  const nodes = {};
  const levels = {};

  function collect(id,depth,visited){
    if(!PEOPLE_BY_ID[id] || depth > MAX_DEPTH || visited.has(id)) return;
    visited.add(id);

    if(!levels[depth]) levels[depth] = [];
    levels[depth].push(id);

    const p = PEOPLE_BY_ID[id];
    (p.parents||[]).forEach(pr => collect(pr.id,depth-1,new Set(visited)));
    PEOPLE.filter(x => (x.parents||[]).some(pr=>pr.id===id))
          .forEach(c => collect(c.id,depth+1,new Set(visited)));
  }

  collect(rootId,0,new Set());

  const yGap = 160, xGap = 200;

  Object.keys(levels).sort((a,b)=>a-b).forEach((depth,i)=>{
    levels[depth].forEach((id,j)=>{
      nodes[id] = { x: 200 + j*xGap, y: 200 + i*yGap };
    });
  });

  function drawLine(a,b,dotted){
    const l = document.createElementNS(SVG_NS,"line");
    l.setAttribute("x1",nodes[a].x);
    l.setAttribute("y1",nodes[a].y);
    l.setAttribute("x2",nodes[b].x);
    l.setAttribute("y2",nodes[b].y);
    l.setAttribute("stroke","#333");
    if(dotted) l.setAttribute("stroke-dasharray","5,5");
    svg.appendChild(l);
  }

  Object.values(PEOPLE_BY_ID).forEach(p=>{
    (p.parents||[]).forEach(pr=>{
      if(nodes[p.id] && nodes[pr.id]) drawLine(pr.id,p.id,false);
    });
    (p.spouses||[]).forEach(s=>{
      if(nodes[p.id] && nodes[s]) drawLine(p.id,s,true);
    });
  });

  Object.keys(nodes).forEach(id=>{
    const g = document.createElementNS(SVG_NS,"g");
    g.setAttribute("transform",`translate(${nodes[id].x},${nodes[id].y})`);

    const r = document.createElementNS(SVG_NS,"rect");
    r.setAttribute("x",-60); r.setAttribute("y",-20);
    r.setAttribute("width",120); r.setAttribute("height",40);
    r.setAttribute("rx",8); r.setAttribute("fill","#f6f2e8"); r.setAttribute("stroke","#333");

    const t = document.createElementNS(SVG_NS,"text");
    t.setAttribute("text-anchor","middle");
    t.setAttribute("y",5);
    t.textContent = PEOPLE_BY_ID[id].name;

    g.onclick = ()=>openModal(id);

    g.appendChild(r); g.appendChild(t); svg.appendChild(g);
  });
}

function openModal(id){
  const p = PEOPLE_BY_ID[id];
  const modal = document.getElementById("modal");
  const body = document.getElementById("modal-body");
  body.innerHTML = "";

  SCHEMA.displayFields.forEach(f=>{
    if(p[f.key]){
      const div = document.createElement("div");
      div.innerHTML = `<strong>${f.label}:</strong> ${p[f.key]}`;
      body.appendChild(div);
    }
  });

  modal.style.display="block";
}

document.getElementById("modal-close").onclick = ()=>document.getElementById("modal").style.display="none";
