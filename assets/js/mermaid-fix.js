document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre > code").forEach(block => {
    if (!block.textContent.trim().match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram)/)) return;

    const container = document.createElement("div");
    container.className = "mermaid";
    container.textContent = block.textContent;

    block.parentElement.replaceWith(container);
  });
});
