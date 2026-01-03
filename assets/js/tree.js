// ================================
// tree.js for Roots and Branches
// ================================

// Register dagre layout
cytoscape.use(cytoscapeDagre);

// Fetch people data
fetch('people.json')
  .then(r => r.json())
  .then(people => {
    if (!people || people.length === 0) {
      console.error('No people data found.');
      return;
    }

    // Map people by ID for easy lookup
    const peopleById = {};
    people.forEach(p => { peopleById[p.id] = p; });

    // Create nodes
    const nodes = people.map(p => ({
      data: {
        id: p.id,
        label: p.name,
        gender: p.gender,
        born: p.born,
        died: p.died
      }
    }));

    // Create edges: parents -> children
    const edges = [];
    people.forEach(child => {
      if (child.parents && child.parents.length > 0) {
        child.parents.forEach(parentRef => {
          const parentId = parentRef.id;
          if (peopleById[parentId]) {
            edges.push({
              data: {
                id: `${parentId}->${child.id}`,
                source: parentId,
                target: child.id,
                label: parentRef.type && parentRef.type !== 'biological' ? parentRef.type : ''
              }
            });
          }
        });
      }
    });

    // Create edges: spouses
    people.forEach(p => {
      if (p.spouses && p.spouses.length > 0) {
        p.spouses.forEach(sid => {
          if (peopleById[sid]) {
            // To avoid duplicate spouse edges, only add if source < target
            if (p.id < sid) {
              edges.push({
                data: {
                  id: `${p.id}-spouse-${sid}`,
                  source: p.id,
                  target: sid,
                  label: 'spouse'
                }
              });
            }
          }
        });
      }
    });

    // Initialize Cytoscape
    const cy = cytoscape({
      container: document.getElementById('tree-container'),
      elements: { nodes, edges },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'color': '#222',
            'background-color': '#99ccff',
            'width': 50,
            'height': 50,
            'font-size': 12,
            'text-wrap': 'wrap'
          }
        },
        {
          selector: 'edge',
          style: {
            'label': 'data(label)',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'line-color': '#999',
            'target-arrow-color': '#999',
            'font-size': 10,
            'text-background-color': '#fff',
            'text-background-opacity': 0.7,
            'text-rotation': 'autorotate'
          }
        }
      ],
      layout: {
        name: 'dagre',
        rankDir: 'TB', // top-bottom
        nodeSep: 50,
        edgeSep: 10,
        rankSep: 100
      },
      userZoomingEnabled: true,
      userPanningEnabled: true
    });

    // Click handler to show basic info
    cy.on('tap', 'node', evt => {
      const node = evt.target.data();
      const info = `
        Name: ${node.label}
        Gender: ${node.gender || 'unknown'}
        Born: ${node.born || 'unknown'}
        Died: ${node.died || 'unknown'}
      `;
      alert(info);
    });

  })
  .catch(err => console.error('Failed to load people.json', err));
