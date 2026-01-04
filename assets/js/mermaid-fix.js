document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre > code.language-mermaid").forEach(block => {
    const parent = block.parentElement;
    const container = document.createElement("div");
    container.className = "mermaid";
    container.textContent = block.textContent;
    parent.replaceWith(container);
  });
});
