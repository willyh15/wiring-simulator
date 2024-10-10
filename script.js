// Handle Drag-and-Drop for Components
const components = document.querySelectorAll(".component");
const canvas = document.getElementById("wiring-canvas");

components.forEach(component => {
    component.addEventListener("dragstart", handleDragStart);
});

canvas.addEventListener("dragover", handleDragOver);
canvas.addEventListener("drop", handleDrop);

function handleDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text");
    const component = document.getElementById(id).cloneNode(true);
    component.style.position = "absolute";
    component.style.left = `${event.offsetX}px`;
    component.style.top = `${event.offsetY}px`;
    canvas.appendChild(component);

    // Add functionality to connect wires later
}
