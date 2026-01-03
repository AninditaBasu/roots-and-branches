const CONFIG = {
  dataFile: '/roots-and-branches/people.json',
  imageRoot: '/roots-and-branches/assets/images/people/'
};

let PEOPLE = {};
let CHILDREN = {};
let ROOT = null;

// -------- Modal display schema --------
const MODAL_SCHEMA = [
  p => {
    if (!p.born) return null;
    let t = `Born on ${prettyDate(p.born)}`;
    if (p.born_place) t += ` at ${p.born_place}`;
    if (p.died) {
      t += `; died on ${prettyDate(p.died)}`;
      if (p.died_place) t += ` at ${p.died_place}`;
    }
    return t + '.';
  },
  p => p.aliases?.length ? `Also known as ${p.aliases.join(', ')}.` : null,
  p => p.spouses?.length
    ? `Spouse of ${p.spouses.map(id => PEOPLE[id]?.name).filter(Boolean).join(', ')}.`
    : null
];

// -------- Helpers --------
function prettyDate(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

// -------- Load data --------
fetch(CONFIG.dataFile)
  .then(r => r.json())
  .then(data => {
    data.forEach(p => {
      PEOPLE[p.id] = p;
      if (p.parents) {
        p.parents.forEach(pr => {
          if (!CHILDREN[pr.id]) CHILDREN[pr.id] = [];
          CHILDREN[pr.id].push(p.id);
        });
      }
    });
    buildPicker(data);
  });

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

// -------- Tree rendering --------
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

function buildGenerations(rootId, depth) {
  const gens = [[rootId]];
  const seen = new Set([rootId]);

  // ancestors
  let prev = [rootId];
  for (let d = 1; d <= depth; d++) {
    const layer = [];
    prev.forEach(id => {
      (PEOPLE[id].parents || []).forEach(p => {
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

  // descendants
  prev = [rootId];
  for (let d = 1; d <= depth; d++) {
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

// -------- Node --------
function node(p) {
  const d = document.createElement('div');
  d.className = 'person-node';

  const portrait = document.createElement('div');
  portrait.className = 'portrait';
  if (p.photo) {
    const im = document.createElement('img');
    im.src = CONFIG.imageRoot + p.photo;
    portrait.appendChild(im);
  }
  d.appendChild(portrait);

  const nm = document.createElement('div');
  nm.className = 'person-name';
  nm.textContent = p.name;
  d.appendChild(nm);

  const b = document.createElement('button');
  b.className = 'expand-btn';
  b.textContent = '+';
  b.onclick = e => {
    e.stopPropagation();
    renderTree(p.id);
  };
  d.appendChild(b);

  d.onclick = () => openModal(p);
  return d;
}

// -------- Modal --------
function openModal(p) {
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modal-name').textContent = p.name;

  const facts = MODAL_SCHEMA.map(f => f(p)).filter(Boolean);
  const body =
    facts.map(t => `<p>${t}</p>`).join('') +
    (p.content ? `<hr>${p.content}` : '');

  document.getElementById('modal-details').innerHTML = body;
}

document.getElementById('modal-close').onclick =
  () => document.getElementById('modal').classList.add('hidden');
