// tree.js

// Compute path to people.json relative to current page
const basePath = window.location.pathname.replace(/\/[^/]*$/, '/') + 'people.json';

fetch(basePath)
  .then(r => r.json())
  .then(people => {

    if (!people || people.length === 0) {
      console.error('No people data found.');
      return;
    }

    // Build nodes
    const nodes = people.map(p => ({
      data: { id: p.id, label: p.name, gender: p.gender }
    }));

    // Build edges
    const edges = [];
    people.forEach(p => {
      // Parent -> Child edges
      (p.parents || []).forEach(par => {
        if (par.id) {
          edges.push({ data: { source: par.id, target: p.id, type: 'parent' } });
        }
      });

      // Spouse edges (undirected)
      (p.spouses || []).forEach(sid => {
        if (p.id < sid) {
          edges.push({ data: { source: p.id, target: sid, type: 'spouse' } });
        }
      });
    });

    // Initialize Cytoscape
    const cy = cytoscape({
      container: document.getElementById('tree-container'),
      elements: { nodes, edges },
      style: [
        {
          selector: 'node',
          style: {
            'content': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': '#6FB1FC',
            'color': '#000',
            'font-size': 12,
            'width': 50,
            'height': 50,
            'border-width': 1,
            'border-color': '#555',
            'overlay-padding': 6
          }
        },
        {
          selector: 'edge[type="parent"]',
          style: {
            'width': 2,
            'line-color': '#888',
            'target-arrow-color': '#888',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        },
        {
          selector: 'edge[type="spouse"]',
          style: {
            'width': 2,
            'line-color': '#c44',
            'line-style': 'dashed',
            'curve-style': 'bezier'
          }
        }
      ],
      layout: {
        name: 'dagre',
        rankDir: 'TB', // top-to-bottom
        nodeSep: 60,
        edgeSep: 10,
        rankSep: 80
      }
    });

    // Node click popup
    cy.on('tap', 'node', evt => {
      const node = evt.target.data();
      const person = people.find(p => p.id === node.id);
      if (!person) return;

      const birth = person.born ? `${person.born}${person.born_place ? ' in ' + person.born_place : ''}` : 'Unknown';
      const death = person.died ? `${person.died}${person.died_place ? ' in ' + person.died_place : ''}` : 'Unknown';

      const spouses = (person.spouses || [])
        .map(id => people.find(p => p.id === id)?.name || id)
        .join(', ') || 'None';

      alert(`Name: ${person.name}
Born: ${birth}
Died: ${death}
Spouses: ${spouses}`);
    });

  })
  .catch(err => console.error('Failed to load people.json', err));
