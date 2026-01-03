const container = document.getElementById("tree-container");
const width = container.clientWidth || window.innerWidth;
const height = container.clientHeight || window.innerHeight - 60;

const svg = d3.select("#tree-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(d3.zoom().on("zoom", (event) => {
    g.attr("transform", event.transform);
  }));

const g = svg.append("g").attr("transform", "translate(80,40)");

const base = window.location.pathname.replace(/\/[^\/]*$/, "");

Promise.all([
  fetch(`${base}/people.json`).then(r => r.json()),
  fetch(`${base}/assets/data/places.json`).then(r => r.json()),
  fetch(`${base}/assets/data/vocabulary.json`).then(r => r.json())
])
.then(initTree)
.catch(err => console.error("LOAD ERROR:", err));


function initTree([people, places, vocab]) {

  const peopleById = {};
  people.forEach(p => {
    p.parents = p.parents || [];
    p.spouses = p.spouses || [];
    p.children = [];
    peopleById[p.pid] = p;

  });

  // Compute children (supports both string and object parent formats)
  people.forEach(p => {
    p.parents.forEach(par => {
      const pid = typeof par === "string" ? par : par.id;
      if (peopleById[pid]) {
        peopleById[pid].children.push({
          id: p.id,
          type: typeof par === "string" ? "biological" : (par.type || "biological")
        });
      }
    });
  });

  // Pick root = someone with no parents
  const rootPerson = people.find(p => p.parents.length === 0) || people[0];

  const hierarchy = d3.hierarchy(rootPerson, d =>
    d.children.map(c => peopleById[c.id])
  );

  const treeLayout = d3.tree().nodeSize([90, 200]);
  treeLayout(hierarchy);

  render(hierarchy);

  function render(root) {

    const nodes = g.selectAll(".node")
      .data(root.descendants(), d => d.data.pid
);

    const nodeEnter = nodes.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .on("click", (_, d) => showModal(d.data, places));

    nodeEnter.append("rect")
      .attr("x", -60)
      .attr("y", -15)
      .attr("width", 120)
      .attr("height", 30);

    nodeEnter.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text(d => d.data.privacy === "private" ? "Private" : d.data.name);

    nodes.merge(nodeEnter)
      .transition()
      .attr("transform", d => `translate(${d.y},${d.x})`);

    const links = g.selectAll(".link")
      .data(root.links(), d => d.target.data.id);

    links.enter()
      .append("path")
      .attr("class", "link")
      .merge(links)
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));
  }
}

function showModal(p, places) {
  const modal = document.getElementById("person-modal");
  const body = document.getElementById("modal-body");

  const bornPlace = p.born_place_id && places[p.born_place_id]
    ? places[p.born_place_id].name
    : "";

  body.innerHTML = `
    <h2>${p.privacy === "private" ? "Private" : p.name}</h2>
    <p><b>Born:</b> ${p.born || ""} ${bornPlace}</p>
    <p><b>Died:</b> ${p.died || ""}</p>
  `;

  modal.classList.remove("hidden");
}

document.getElementById("modal-close").onclick = () =>
  document.getElementById("person-modal").classList.add("hidden");
