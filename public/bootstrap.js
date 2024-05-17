window.addEventListener("mousemove", (e) => {
  window.parent.postMessage({ type: "mousemove", x: e.pageX, y: e.pageY }, "*");
});
