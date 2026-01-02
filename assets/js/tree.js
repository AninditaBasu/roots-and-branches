const width = window.innerWidth;
const height = window.innerHeight - 60;

const svg = d3.select("#tree-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(40,40)");

Promise.all([
  fetch("/people.json").then(r => r.json()),
  fetch("/assets/data/places.json").then(r => r.json()),
  fetch("/assets/data/vocabulary.json").then(r => r.json())
]).then(initTree);


function initTree([people, places, vocab]) {

  const peopleById = {};
  people.forEach(p => peopleById[p.id] = p);

  // compute children
  people.forEach(p => p.children = []);
  people.forEach(p => {
    (p.parents || []).forEach(par => {
      const pid = par.id || par;
      if (peopleById[pid]) peopleById[pid].children.push(p.id);
    });
  });

  const root = people[0];

  const tree = d3.tree().nodeSize([80, 180]);

  let hierarchy = d3.hierarchy(root, d => d.children.map(id => peopleById[id]));

  update(hierarchy);

  function update(source) {
    tree(hierarchy);

    const nodes = svg.selectAll(".node")
      .data(hierarchy.descendants(), d => d.data.id);

    const nodeEnter = nodes.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .on("click", (_, d) => showModal(d.data, places));

    nodeEnter.append("rect")
      .attr("width", 120)
      .attr("height", 30)
      .attr("x", -60)
      .attr("y", -15);

    nodeEnter.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text(d => d.data.privacy === "private" ? "Private" : d.data.name);

    nodes.merge(nodeEnter)
      .transition()
      .attr("transform", d => `translate(${d.y},${d.x})`);

    const links = svg.selectAll(".link")
      .data(hierarchy.links(), d => d.target.data.id);

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

  body.innerHTML = `
    <h2>${p.privacy === "private" ? "Private" : p.name}</h2>
    <p><b>Born:</b> ${p.born || ""} ${places[p.born_place_id]?.name || ""}</p>
    <p><b>Died:</b> ${p.died || ""}</p>
  `;

  modal.classList.remove("hidden");
}

document.getElementById("modal-close").onclick = () =>
  document.getElementById("person-modal").classList.add("hidden");
