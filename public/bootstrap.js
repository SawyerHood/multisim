window.addEventListener("mousemove", (e) => {
  window.parent.postMessage({ type: "mousemove", x: e.pageX, y: e.pageY }, "*");
});

window.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    e.preventDefault();
    window.parent.postMessage({ type: "linkClick", href: e.target.href }, "*");
  }
});
