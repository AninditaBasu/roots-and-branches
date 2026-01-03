// Fetch people.json
fetch('/roots-and-branches/people.json')
  .then(r => r.json())
  .then(people => {
    if (!people || people.length === 0) {
      console.error("No people data found.");
      return;
    }

    // Map people by ID
    const peopleById = {};
    people.forEach(p => { peopleById[p.id] = p; });

    // Build Cytoscape elements
    const nodes = [];
    const edges = [];

    people.forEach(p => {
      // Add node
      nodes.push({
        data: { id: p.id, label: p.name, person: p }
      });

      // Add parent-child edges
      if (p.parents && p.parents.length > 0) {
        p.parents.forEach(par => {
          if (peopleById[par.id]) {
            edges.push({
              data: { id: `${par.id}-${p.id}`, source: par.id, target: p.id, type: 'parent' }
            });
          }
        });
      }

      // Add spouse edges
      if (p.spouses && p.spouses.length > 0) {
        p.spouses.forEach(sp => {
          if (peopleById[sp]) {
            // Avoid duplicate edges
            if (!edges.some(e => e.data.source === sp && e.data.target === p.id)) {
              edges.push({
                data: { id: `${p.id}-${sp}`, source: p.id, target: sp, type: 'spouse' }
              });
            }
          }
        });
      }
    });

    // Create Cytoscape instance
    const cy = cytoscape({
      container: document.getElementById('tree-container'),
      elements: { nodes, edges },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'color': '#fff',
            'background-color': '#0074D9',
            'width': '60px',
            'height': '60px',
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'font-size': '12px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#aaa',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#aaa',
            'curve-style': 'bezier'
          }
        },
        {
          selector: 'edge[type="spouse"]',
          style: {
            'line-style': 'dashed',
            'target-arrow-shape': 'none'
          }
        }
      ],
      layout: {
        name: 'fcose',
        quality: 'default',
        randomize: false,
        animate: true
      }
    });

    // Node click popup
    cy.on('tap', 'node', function(evt){
      const p = evt.target.data('person');
      alert(
        `${p.name}\nBorn: ${p.born} in ${p.born_place}\n` +
        `Died: ${p.died || 'N/A'} in ${p.died_place || 'N/A'}\n` +
        `Parents: ${p.parents.map(x => peopleById[x.id]?.name).join(', ') || 'N/A'}\n` +
        `Spouses: ${p.spouses.map(x => peopleById[x]?.name).join(', ') || 'N/A'}`
      );
    });

  })
  .catch(err => console.error("Failed to load people.json", err));
