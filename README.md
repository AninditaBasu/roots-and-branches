# Roots and branches

The design principle is Markdown + YAML metadata + static JSON + client-side visualisation. The model is:

-   Atomic content units (Markdown files)
-   Structured metadata (YAML front matter)
-   Relationships (links between units)
-   Static publishing (GitHub Pages)
-   Client-side enhancements (visualisations, filters)

## Repo structure

```
    roots-and-branches-repo/
    ├─ _layouts/
    │  ├─ default.html
    │  └─ null.html
    ├─ _people/
    │  ├─ _template.md          # Copy this for new people
    │  ├─ P0001.md
    │  ├─ P0002.md
    │  └─ ...
    ├─ assets/
    │  ├─ css/
    │  │  └─ style.css
    │  ├─ data/
    │  │   ├─ places.json      	# Place registry with coordinates
    │  │   ├─ vocabulary.json   # Controlled vocabulary
    │  └─ js/
    │      ├─ tree.js	
	├─ _config.yml
	├─ index.md
	├─ people.json
	├─ README.md
    ├─ tree.html
```

## How this works

-   Each person = one Markdown file in `_people/` with YAML front matter.
-   Relationships are only from `parents` and `spouses` (IDs). Children are computed on the fly by scanning everyone's `parents`.
-   Jekyll builds `people.json` from the collection, which the visualisations load client-side. No server or database required.
-   D3 v7 powers the family tree visual.

## Other usage scenarios

The (Markdown + YAML metadata + static JSON + client-side visualisation) pattern is extensible to the following scenarios as well. The common thread is:

-   Atomic Markdown units
-   Structured metadata for filtering and search
-   Relationships through IDs
-   Static JSON for client-side rendering
-   Visualisations for insight

### Topics and collections

-   Unit: Each topic = one Markdown file
-   Metadata: `id`, `title`, `product`, `version`, `tags`, `related_topics`
-   Relationships: Link topics to parent concepts or related topics
-   Visualisation: Dependency graph of topics, or navigation map
-   Use case: API docs, user guides, modular help systems

### Glossary and terms

-   Unit: Each term = one Markdown file.
-   Metadata: `id`, `term`, `definition`, `related_terms`
-   Relationships: Concept map
-   Visualisation: Semantic network
-   Use case: Knowledge base or ontology

### Books and characters

-   Unit: Each character = one Markdown file
-   Metadata: `id`, `name`, `book`, `relationships`
-   Relationships: Character interaction graph
-   Visualisation: Social network of characters
-   Use case: Literary analysis or fan wiki

### Projects and tasks

-   Unit: Each task = one Markdown file
-   Metadata: `id`, `title`, `status`, `dependencies` (IDs), `tags`
-   Relationships: Task dependency graph
-   Visualisation: Gantt chart or dependency map
-   Use case: Lightweight project management without databases

### Courses and modules

-   Unit: Each module = one Markdown file.
-   Metadata: `id`, `title`, `prerequisites` (IDs), `tags`
-   Relationships: Learning dependency graph
-   Visualisation: Interactive roadmap
-   Use case: Self-paced learning platform

### Recipes and ingredients

-   Unit: Each recipe = one Markdown file
-   Metadata: `id`, `title`, `ingredients` (IDs), `tags` (cuisine, meal type)
-   Relationships: Ingredient-recipe links
-   Visualisation: Ingredient dependency graph or seasonal availability map
-   Use case: Family cookbook

