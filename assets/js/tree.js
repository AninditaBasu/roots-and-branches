const base = window.location.pathname.replace(/\/[^\/]*$/, "");

Promise.all([
  fetch(`${base}/people.json`).then(r => r.json()),
  fetch(`${base}/assets/data/places.json`).then(r => r.json()),
  fetch(`${base}/assets/data/vocabulary.json`).then(r => r.json())
])
.then(initTree)
.catch(err => console.error("LOAD ERROR:", err));

function initTree([people, places, vocab]) {

  const width = 1200;
  const height = 800;

  const svg = d3.select("#tree")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(40,40)");

  // Index people by id
  const peopleById = new Map();
  people.forEach(p => peopleById.set(p.id, p));

  // Build children map
  const childrenMap = new Map();
  people.forEach(p => childrenMap.set(p.id, []));

  people.forEach(p => {
    (p.parents || []).forEach(par => {
      if (peopleById.has(par.id)) {
        childrenMap.get(par.id).push(p);
      }
    });
  });

  // Build synthetic root
  const roots = people.filter(p => !p.parents || p.parents.length === 0);
  childrenMap.set("__ROOT__", roots);

  const superRoot = { id: "__ROOT__", name: "Family" };

  const root = d3.hierarchy(superRoot, d => childrenMap.get(d.id) || []);

  const treeLayout = d3.tree().size([height - 80, width - 200]);
  treeLayout(root);

  // Links
  svg.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "#999")
    .attr("d", d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x)
    );

  // Nodes
  const node = svg.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle")
    .attr("r", 6)
    .attr("fill", d => d.data.id === "__ROOT__" ? "#fff" : "#69b");

  node.append("text")
    .attr("dx", 10)
    .attr("dy", 4)
    .text(d => {
      if (d.data.id === "__ROOT__") return "";
      const p = peopleById.get(d.data.id);
      return p ? p.name : "";
    });
}
