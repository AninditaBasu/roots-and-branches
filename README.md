# Roots and branches

---

Organise and explore structured content as interactive trees.

`Roots and branches` is a schema-driven tree-viewer that separates data, layout, and presentation logic. Each unit is a Markdown file with metadata; relationships and hierarchy are rendered dynamically with client-side JavaScript, and displayed as interactive HTML on a static website.

It can be used for any parent-child knowledge domain. This repo contains an example from genealogy (a family tree with ancestors and descendants up to a specified level).

> Design principle: Markdown + YAML metadata + static JSON + client-side visualisation.

This model is generic enough to be adapted for other hierarchical structures such as technical publications (collections and topics), learning platforms (courses and modules), concept maps (glossaries and terms), or project management (projects and tasks).

- [How this works](#how-this-works)
- [Implementation details](#implementation-details)
- [Repo structure](#repo-structure)
- [Other usage scenarios](#other-usage-scenarios)
- [License](#license)

---

## How this works

Think of it as a Markdown-native graph database with visual reasoning. Nodes are stored as Markdown, edges are stored as IDs, materialisation is through JSON, and semantics is through client-side graphs.

The common schema is:

```
---
id: NODE_ID
title: "Human readable name"
type: topic | term | person | task | module
relations:
  - id: OTHER_NODE_ID
    type: prerequisite | depends_on | | spouse
tags: []
---
```

Everything else is ~UI~ presentation.

> Just a note: The generic `relations[]` in that example is to show how the model generalises. The current implementation in this repo uses field-specific relationship arrays. 

You're now free to mix and match as you want to:

- Ontology packs: `genealogy.json`, `docs.json`, `recipes.json`
- Layout engines: tree, force-graph, radial
- Validation rules: controlled vocabulary

| Layer       | Purpose             |
| ----------- | ------------------- |
| Frontmatter | Truth               |
| JSON        | Knowledge substrate |
| GUI display | Human comfort       |


## Implementation details

**Data structure**

- Each collection (`_people`, `_topics`, `_recipes`) contains Markdown files.
- Each Markdown file has frontmatter (YAML) and optional content.
- Every frontmatter necessarily contains a unique ID.
- Other keys can be text, list, array; null values are preserved in JSON.
- Some frontmatter fields use controlled vocabularies (JSON).
- Relationships (parents, spouses, related_topics) are defined in frontmatter; children are inferred where needed.

**Schema and relationships**

- Every schema (genealogy, topics, recipes) has one or more relationship fields.
- Relationships can be one-to-many (parent to children) or many-to-many.
- Children are computed dynamically; they aren't explicitly listed.

**Generated artifacts**

- For each collection, a JSON file is generated from frontmatter (`people.json`, `topics.json`).
- Controlled vocabularies are stored as separate JSON files (`places.json`, `vocabulary.json`).

**Rendering and interactivity**

- Nodes: Each Markdown file becomes a node. The label field is from the schema (`name`, `title`).
- Tree view: Starts at a designated root node. Is positioned vertically (top-down).
- Depth: Render 3 ancestors and 3 descendants.
- Computation of relationship: Build the tree breadth-first by generation, not depth-first, to get a level-ordered generation matrix.
- Node click action: 
   - On clicking the node itself, open a modal to show all frontmatter info plus Markdown content. Click X to close the modal.
   - On clicking an Expand button, show the node's own ancestors and descendants.

**ID management**

- IDs are unique in a collection.
- A control CSV file maintains IDs with `ID`, `name`, `date_assigned`. IDs are intentionally not auto-generated, to preserve referential stability across years of content evolution.

You get a RAG-ready structure and an MCP-ready entity graph.

## Repo structure

```
roots-and-branches/
├─ _layouts/
│  ├─ default.html          # Main layout; includes header, footer, CSS, JS, and modal container
│  └─ null.html             # Minimal layout; used for JSON generation
│
├─ _people/
│  ├─ _template.md          # Template Markdown file for adding people; copy for new entries
│  ├─ P0001.md              # Individual person Markdown file; YAML frontmatter and optional content
│  ├─ P0002.md              # Another person file
│  └─ ...                   # All other person files follow the same pattern
│
├─ assets/
│  ├─ css/
│  │  └─ style.css          # Styles
│  │
│  ├─ data/
│  │   ├─ places.json      	# IDs, names, optional coordinates; used for displaying place info
│  │   ├─ vocabulary.json   # Controlled vocabulary for tags, categories, or other metadata filtering
│  │
│  ├─ images/          		# Pictures
│  │	├─ people/ 
│  │	│   ├─ P0001.png
│  │	│   ├─ P0002.png
│  │	│	└─ ...
│  │
│  └─ js/
│      ├─ tree.js           # Main client-side script; computes ancestors and descendants
│
├─ _config.yml              # Jekyll config file for GitHub Pages
├─ index.md                 # Home page of the GitHub Pages website
├─ people.json              # Generated JSON from the _people/ collection
├─ README.md                # Project documentation (this file)
├─ tree.md                  # Page containing the rendered tree

```

**`_people/`**

The source of truth. A Jekyll collection that contains Markdown files, where each Markdown file is one atomic person record with structured metadata (YAML front matter) and narrative content (Markdown body). 

**people.json**

The compiled dataset. A Jekyll-generated JSON feed that merges all `_people/` front matter and Markdown content for the rendering tree engine to use.

**tree.js**

The engine that turns raw, boring data into an interesting, interactive tree. It is the brain of the system. It loads data, computes relationships dynamically (the children, ascendant, and descendant logic is not stored explicitly anywhere), and renders the interactive tree.

| Component      | Task                                                          |
| -------------- | ------------------------------------------------------------- |
| `_people/*.md` | Source of truth (frontmatter and Markdown body)               |
| Jekyll build   | Converts Markdown to HTML                                     |
| `people.json`  | Contains both metadata (frontmatter) and HTML (Markdown body) |
| `tree.js`      | Renders the tree, with the derived relationships              |
| `style.css`    | Controls only the presentation                                |

## Other usage scenarios

The pattern is:

-   Atomic Markdown units
-   Structured metadata for filtering and search
-   Relationships through IDs
-   Static JSON for client-side rendering
-   Visualisations for insight

### Topics and collections

-   Unit: Each topic = one Markdown file
-   Metadata: `id`, `title`, `product`, `version`, `tags`, `related_topics` (IDs)
-   Relationships: Link topics to parent concepts or related topics
-   Visualisation: Dependency graph of topics, or navigation map
-   Use case: API docs, user guides, modular help systems

### Courses and modules

-   Unit: Each module = one Markdown file.
-   Metadata: `id`, `title`, `prerequisites` (IDs), `tags`
-   Relationships: Learning dependency graph
-   Visualisation: Interactive roadmap
-   Use case: Self-paced learning platform

### Glossary and terms

-   Unit: Each term = one Markdown file.
-   Metadata: `id`, `term`, `definition`, `related_terms` (IDs)
-   Relationships: Concept map
-   Visualisation: Semantic network
-   Use case: Knowledge base or ontology

### Projects and tasks

-   Unit: Each task = one Markdown file
-   Metadata: `id`, `title`, `status`, `dependencies` (IDs), `tags`
-   Relationships: Task dependency graph
-   Visualisation: Gantt chart or dependency map
-   Use case: Lightweight project management without databases

## License

MIT