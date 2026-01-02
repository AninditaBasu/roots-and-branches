# Roots and branches

The design principle is Markdown + YAML metadata + static JSON + client-side visualisation. The model is:

-   Atomic content units (Markdown files)
-   Structured metadata (YAML front matter)
-   Relationships (links between units)
-   Static publishing (GitHub Pages)
-   Client-side enhancements (visualisations, filters)

## Repo structure

    roots-and-branches-repo/
    ├─ README.md
    ├─ _config.yml
    ├─ index.html
    ├─ people.json                # Liquid page: generates JSON index
    ├─ _layouts/
    │  ├─ default.html
    │  └─ person.html
    ├─ _people/
    │  ├─ TEMPLATE.md             # Copy this for new people
    │  ├─ P0001.md                # Sample: Anindita Basu
    │  ├─ P0002.md                # Sample: Mugdha Bapat
    │  ├─ P0003.md                # Placeholder parent 1
    │  ├─ P0004.md                # Placeholder parent 2
    │  ├─ P0005.md                # Placeholder parent 3
    │  └─ P0006.md                # Placeholder parent 4
    ├─ assets/
    │  ├─ css/
    │  │  └─ styles.css
    │  └─ data/
    │     ├─ controls.json        # Controlled vocabularies
    │     ├─ id-index.csv         # ID assignment log
    │     ├─ places.json          # Place registry with coordinates
    │     └─ sample-people.json   # Static sample (optional local test)
    └─ viz/
       ├─ tree.html               # D3 (ancestors & descendants)
       └─ map.html                # Leaflet (births & migrations)

## How this works

-   Each person = one Markdown file in `_people/` with YAML front matter.
-   Relationships are only from `parents` and `spouses` (IDs). Children are computed on the fly by scanning everyone's `parents`.
-   Jekyll builds `people.json` from the collection, which the visualisations load client-side. No server or database required.
-   D3 v7 powers the family tree visual; Leaflet powers the migration map.

## Other usage scenarios

The (Markdown + YAML metadata + static JSON + client-side visualisation) pattern is extensible to the following scenarios as well. The common thread is:

-   Atomic Markdown units
-   Structured metadata for filtering and search
-   Relationships through IDs
-   Static JSON for client-side rendering
-   Visualisations for insight

### Topics and collections

-   Unit: Each topic = one Markdown file.
-   Metadata: `id`, `title`, `product`, `version`, `tags`, `related_topics`.
-   Relationships: Link topics to parent concepts or related topics.
-   Visualization: Dependency graph of topics, or navigation map.
-   Use case: API docs, user guides, modular help systems.

### Glossary and terms

-   Unit: Each term = one Markdown file.
-   Metadata: `id`, `term`, `definition`, `related_terms`.
-   Relationships: Concept map.
-   Visualization: Semantic network.
-   Use case: Knowledge base or ontology.

### Books and characters

-   Unit: Each character = one Markdown file.
-   Metadata: `id`, `name`, `book`, `relationships` (friend, enemy, mentor).
-   Relationships: Character interaction graph.
-   Visualization: Social network of characters.
-   Use case: Literary analysis or fan wiki.

### Events and people

-   Unit: Each event = one Markdown file.
-   Metadata: `id`, `title`, `date`, `place_id`, `participants` (IDs).
-   Relationships: Event-person graph.
-   Visualization: Timeline or map of events.
-   Use case: Conference archive or historical timeline.

### Projects and tasks

-   Unit: Each task = one Markdown file.
-   Metadata: `id`, `title`, `status`, `dependencies` (IDs), `tags`.
-   Relationships: Task dependency graph.
-   Visualization: Gantt chart or dependency map.
-   Use case: Lightweight project management without databases.

### Courses and modules

-   Unit: Each module = one Markdown file.
-   Metadata: `id`, `title`, `prerequisites` (IDs), `tags`.
-   Relationships: Learning dependency graph.
-   Visualization: Interactive roadmap.
-   Use case: Self-paced learning platform.

### Recipes and ingredients

-   Unit: Each recipe = one Markdown file.
-   Metadata: `id`, `title`, `ingredients` (IDs), `tags` (cuisine, meal type).
-   Relationships: Ingredient → recipe links.
-   Visualization: Ingredient dependency graph or seasonal availability map.
-   Use case: Family cookbook or food blog.

