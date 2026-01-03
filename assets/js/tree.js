// ===== CONFIG =====
const CONFIG = {
  dataFile: '/roots-and-branches/people.json',
  imageRoot: '/roots-and-branches/assets/images/people/',
  id: 'id',
  label: 'name',
  parent: 'parents',
  spouse: 'spouses'
};

// ===== PEOPLE DATA =====
let PEOPLE = {};
let CHILDREN = {};
let ROOT = null;

// ===== MODAL SCHEMA =====
const MODAL_SCHEMA = {
  born: v => `Born on ${prettyDate(v)}`,
  born_place: v => `at ${v}`,
  died: v => `Died on ${prettyDate(v)}`,
  died_place: v => `at ${v}`,
//  gender: v => `Gender: ${capitalize(v)}`,
  aliases: v => `Also known as ${v.join(', ')}`
};

// ===== HELPER FUNCTIONS =====
function prettyDate(d) {
  const x = new Date(d);
  return x.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ===== FETCH DATA =====
fetch(CONFIG.dataFile)
  .then(r => r.json())
  .then(data => {
    data.forEach(p => {
      PEOPLE[p.id] = p;
      // build child lookup table
      if (p.parents) {
        p.parents.forEach(pr => {
          if (!CHILDREN[pr.id]) CHILDREN[pr.id] = [];
          CHILDREN[pr.id].push(p.id);
        });
      }
    });
    buildPicker(data);
  });

// ===== ROOT SELECTOR =====
function buildPicker(list) {
  const sel = document.getElementById('rootPicker');
  list.forEach(p => {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.name;
    sel.appendChild(o);
  });
  sel.onchange = () => renderTree(sel.value);
  renderTree(list[0].id);
}

// ===== TREE RENDERING =====
function renderTree(rootId) {
  ROOT = rootId;
  const tree = document.getElementById('tree');
  tree.innerHTML = '';

  const generations = buildGenerations(rootId, 3);

  generations.forEach(gen => {
    const row = document.createElement('div');
    row.className = 'generation';
    gen.forEach(id => row.appendChild(node(PEOPLE[id])));
    tree.appendChild(row);
  });
}

// ===== BUILD GENERATIONS (LEVEL ORDER) =====
function buildGenerations(rootId, depth) {
  const gens = [];
  const seen = new Set([rootId]);

  // root + spouses
  const rootGen = new Set([rootId]);
  (PEOPLE[rootId].spouses || []).forEach(s => rootGen.add(s));
  gens.push([...rootGen]);

  // ancestors
  let prev = [rootId];
  for (let d = 1; d <= depth; d++) {
    const layer = new Set();
    prev.forEach(id => {
      (PEOPLE[id].parents || []).forEach(p => {
        if (!seen.has(p.id)) {
          layer.add(p.id);
          seen.add(p.id);
        }
      });
    });
    if (!layer.size) break;
    gens.unshift([...layer]); // add at top
    prev = [...layer];
  }

  // descendants
  prev = [rootId];
  for (let d = 1; d <= depth; d++) {
    const layer = new Set();
    prev.forEach(id => {
      (CHILDREN[id] || []).forEach(c => {
        if (!seen.has(c)) {
          layer.add(c);
          seen.add(c);
        }
      });
    });
    if (!layer.size) break;
    gens.push([...layer]);
    prev = [...layer];
  }

  return gens;
}

// ===== CREATE PERSON NODE =====
function node(p) {
  const d = document.createElement('div');
  d.className = 'person-node';
  d.dataset.pid = p.id;

  // portrait
  const portrait = document.createElement('div');
  portrait.className = 'portrait';
  if (p.photo) {
    const im = document.createElement('img');
    im.src = CONFIG.imageRoot + p.photo;
    portrait.appendChild(im);
  }
  d.appendChild(portrait);

  // name
  const nm = document.createElement('div');
  nm.className = 'person-name';
  nm.textContent = p.name;
  d.appendChild(nm);

  // expand button
  const b = document.createElement('button');
  b.className = 'expand-btn';
  b.textContent = '+';
  b.onclick = e => {
    e.stopPropagation();
    renderTree(p.id);
  };
  d.appendChild(b);

  // click opens modal
  d.onclick = () => openModal(p);

  return d;
}

// ===== OPEN MODAL =====
function openModal(p) {
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modal-name').textContent = p.name;

  document.getElementById('modal-details').innerHTML =
    Object.entries(MODAL_SCHEMA)
      .filter(([k]) => p[k])
      .map(([k, fmt]) => `<p>${fmt(p[k])}</p>`)
      .join('');
}

// ===== CLOSE MODAL =====
document.getElementById('modal-close').onclick =
  () => document.getElementById('modal').classList.add('hidden');
