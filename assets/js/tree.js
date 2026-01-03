const base = window.location.pathname.replace(/\/[^\/]*$/, "");

fetch(`${base}/people.json`)
  .then(r => r.json())
  .then(people => initTree(people))
  .catch(err => console.error("LOAD ERROR:", err));

function initTree(people) {

  const width = 1200;
  const height = 800;

  const svg = d3.select("#tree-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(40,40)");

  // Index by id
  const byId = {};
  people.forEach(p => byId[p.id] = p);

  // Build children lookup
  const children = {};
  people.forEach(p => children[p.id] = []);
  people.forEach(p => {
    (p.parents || []).forEach(par => {
      if (children[par.id]) children[par.id].push(p.id);
    });
  });

  // HARD ROOT
  const ROOT_ID = "P0002";
  const rootPerson = byId[ROOT_ID];

  function buildTree(id) {
    const p = byId[id];
    return {
      id: p.id,
      name: p.name,
      children: (children[id] || []).map(cid => buildTree(cid))
    };
  }

  const data = buildTree(ROOT_ID);

  const root = d3.hierarchy(data);

  const treeLayout = d3.tree().size([height - 80, width - 200]);
  treeLayout(root);

  svg.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#888")
    .attr("d", d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x)
    );

  const node = svg.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle")
    .attr("r", 6)
    .attr("fill", "#69b");

  node.append("text")
    .attr("dx", 10)
    .attr("dy", 4)
    .text(d => d.data.name);
}
