console.log("TREE.JS LOADED");

const CONFIG = {
  dataFile: document.body.dataset.baseurl + "/people.json",
  imageRoot: document.body.dataset.baseurl + "/assets/images/people/",
  id: "id",
  label: "name",
  parent: "parents",
  spouse: "spouses"
};

let PEOPLE = {};
let ROOT = null;

/* -------------------- LOAD DATA -------------------- */

fetch(CONFIG.dataFile)
  .then(r => r.json())
  .then(data => {
    data.forEach(p => PEOPLE[p.id] = p);
    buildPicker(data);
  });

function buildPicker(list){
  const sel = document.getElementById("rootPicker");
  sel.innerHTML = "";
  list.forEach(p=>{
    const o=document.createElement("option");
    o.value=p.id; 
    o.textContent=p.name;
    sel.appendChild(o);
  });
  sel.onchange=()=>renderTree(sel.value);
  renderTree(list[0].id);
}

/* -------------------- TREE BUILD -------------------- */

function renderTree(rootId){
  ROOT=rootId;
  const tree=document.getElementById("tree");
  tree.innerHTML="";

  const gens = [
    getAncestors(rootId,2).reverse(),
    [PEOPLE[rootId]],
    getDescendants(rootId,2)
  ];

  gens.forEach(g=>{
    const row=document.createElement("div");
    row.className="generation";
    g.forEach(p=>row.appendChild(node(p)));
    tree.appendChild(row);
  });
}

function getAncestors(id,depth){
  if(depth===0) return [];
  const p=PEOPLE[id];
  if(!p || !p.parents) return [];
  return p.parents.flatMap(r=>{
    const parent=PEOPLE[r.id];
    return parent ? [parent,...getAncestors(parent.id,depth-1)] : [];
  });
}

function getDescendants(id,depth){
  if(depth===0) return [];
  const kids = Object.values(PEOPLE).filter(p=>
    p.parents?.some(r=>r.id===id)
  );
  return kids.flatMap(k=>[k,...getDescendants(k.id,depth-1)]);
}

/* -------------------- NODE -------------------- */

function node(p){
  const d=document.createElement("div");
  d.className="person-node";

  const wrap=document.createElement("div");
  wrap.className="portrait";

  if(p.photo){
    const im=document.createElement("img");
    im.src=CONFIG.imageRoot+p.photo;
    wrap.appendChild(im);
  }
  d.appendChild(wrap);

  const nm=document.createElement("div");
  nm.className="person-name";
  nm.textContent=p.name;
  d.appendChild(nm);

  const b=document.createElement("button");
  b.className="expand-btn";
  b.textContent="+";
  b.onclick=e=>{
    e.stopPropagation();
    renderTree(p.id);
  };
  d.appendChild(b);

  d.onclick=()=>openModal(p);
  return d;
}

/* -------------------- MODAL -------------------- */

function openModal(p){
  const modal=document.getElementById("modal");
  const body=document.getElementById("modal-details");
  const title=document.getElementById("modal-name");
  const closeBtn=document.getElementById("modal-close");

  title.textContent=p.name;

  let html="";

  if(p.born){
    html+=`<p><b>Born:</b> ${prettyDate(p.born)}${p.born_place?" at "+p.born_place:""}</p>`;
  }
  if(p.died){
    html+=`<p><b>Died:</b> ${prettyDate(p.died)}${p.died_place?" at "+p.died_place:""}</p>`;
  }
  if(p.aliases?.length){
    html+=`<p><b>Also known as:</b> ${p.aliases.join(", ")}</p>`;
  }

  if(p.content){
    html+=`<hr>${p.content}`;
  }

  body.innerHTML=html;
  modal.classList.remove("hidden");
  closeBtn.onclick=()=>modal.classList.add("hidden");
}

function prettyDate(d){
  const [y,m,day]=d.split("-");
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${day} ${months[m-1]} ${y}`;
}
