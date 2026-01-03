// ================== CONFIG ==================
const CONFIG = {
  dataFile: '/roots-and-branches/people.json',   // JSON source
  imageRoot: '/roots-and-branches/assets/images/people/',  // Image folder
  id: 'id',                // ID field
  label: 'name',           // Field to display in node
  parent: 'parents',       // Field pointing to parent IDs
  modalSchema: [           // Functions returning strings for modal
    item => {
      if (!item.born) return null;
      let t = `Born on ${prettyDate(item.born)}`;
      if (item.born_place) t += ` at ${item.born_place}`;
      if (item.died) {
        t += `; died on ${prettyDate(item.died)}`;
        if (item.died_place) t += ` at ${item.died_place}`;
      }
      return t + '.';
    },
    item => item.aliases?.length ? `Also known as ${item.aliases.join(', ')}.` : null,
    item => {
      // Safe reference: only include related names that exist in ITEMS
      if (!item.spouses?.length) return null;
      const names = item.spouses
        .map(id => ITEMS[id]?.[CONFIG.label])
        .filter(Boolean);
      return names.length ? `Spouse of ${names.join(', ')}.` : null;
    }
  ],
  generationDepth: 3       // How many ancestor/descendant levels to show
};

// ================== DATA STRUCTURES ==================
let ITEMS = {};      // Generic replacement for PEOPLE
let CHILDREN = {};   // Maps parent ID → child IDs
let ROOT = null;

// ================== HELPERS ==================
function prettyDate(d){
  if(!d) return '';
  const [y,m,day] = d.split('-');
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${day} ${months[m-1]} ${y}`;
}

// ================== LOAD DATA ==================
fetch(CONFIG.dataFile)
  .then(r => r.json())
  .then(data => {
    // Build ITEMS and CHILDREN maps fully
    data.forEach(item => {
      ITEMS[item[CONFIG.id]] = item;
    });

    // Build CHILDREN map safely
    data.forEach(item => {
      (item[CONFIG.parent] || []).forEach(pr => {
        if (!CHILDREN[pr.id]) CHILDREN[pr.id] = [];
        CHILDREN[pr.id].push(item[CONFIG.id]);
      });
    });

    // Now everything is fully built
    buildPicker(data);
  });

// ================== PICKER ==================
function buildPicker(list){
  const sel = document.getElementById('rootPicker');
  sel.innerHTML = '';
  list.forEach(item => {
    const o = document.createElement('option');
    o.value = item[CONFIG.id];
    o.textContent = item[CONFIG.label];
    sel.appendChild(o);
  });
  sel.onchange = () => renderTree(sel.value);
  renderTree(list[0][CONFIG.id]);
}

// ================== TREE ==================
function renderTree(rootId){
  ROOT = rootId;
  const tree = document.getElementById('tree');
  tree.innerHTML = '';

  const generations = buildGenerations(rootId, CONFIG.generationDepth);

  generations.forEach(gen => {
    const row = document.createElement('div');
    row.className = 'generation';
    gen.forEach(id => {
      if (ITEMS[id]) row.appendChild(node(ITEMS[id]));
    });
    tree.appendChild(row);
  });
}

// Build generations (ancestors + root + descendants)
function buildGenerations(rootId, depth){
  const gens = [[rootId]];
  const seen = new Set([rootId]);

  // Ancestors
  let prev = [rootId];
  for(let d=1; d<=depth; d++){
    const layer = [];
    prev.forEach(id => {
      (ITEMS[id][CONFIG.parent] || []).forEach(p => {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          layer.push(p.id);
        }
      });
    });
    if (!layer.length) break;
    gens.unshift(layer);
    prev = layer;
  }

  // Descendants
  prev = [rootId];
  for(let d=1; d<=depth; d++){
    const layer = [];
    prev.forEach(id => {
      (CHILDREN[id] || []).forEach(c => {
        if (!seen.has(c)) {
          seen.add(c);
          layer.push(c);
        }
      });
    });
    if (!layer.length) break;
    gens.push(layer);
    prev = layer;
  }

  return gens;
}

// ================== NODE ==================
function node(item){
  const d = document.createElement('div');
  d.className = 'person-node';
  d.style.position = 'relative'; // for expand button

  // Portrait
  const portrait = document.createElement('div');
  portrait.className = 'portrait';
  if(item.photo){
    const img = document.createElement('img');
    img.src = CONFIG.imageRoot + item.photo;
    portrait.appendChild(img);
  }
  d.appendChild(portrait);

  // Label
  const nm = document.createElement('div');
  nm.className = 'person-name';
  nm.textContent = item[CONFIG.label];
  d.appendChild(nm);

  // Expand button
  const b = document.createElement('button');
  b.className = 'expand-btn';
  b.textContent = '+';
  b.onclick = e => { e.stopPropagation(); renderTree(item[CONFIG.id]); };
  d.appendChild(b);

  // Click opens modal
  d.onclick = () => openModal(item);

  return d;
}

// ================== MODAL ==================
function openModal(item){
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-details');
  const title = document.getElementById('modal-name');
  const closeBtn = document.getElementById('modal-close');

  title.textContent = item[CONFIG.label];

  const facts = CONFIG.modalSchema.map(f => f(item)).filter(Boolean);
  const bodyHTML = facts.map(t => `<p>${t}</p>`).join('') +
                   (item.content ? `<hr>${item.content}` : '');
  body.innerHTML = bodyHTML;

  modal.classList.remove('hidden');
  closeBtn.onclick = () => modal.classList.add('hidden');
}
