// Handle Drag-and-Drop for Components
const components = document.querySelectorAll(".component");
const canvas = document.getElementById("wiring-canvas");

// Updated Compatibility Map with New Components
const compatibilityMap = {
    "solenoid": ["ignition-key", "stator", "starter-motor"],
    "ignition-key": ["solenoid", "starter-motor"],
    "stator": ["voltage-regulator", "coil"],
    "coil": ["cdi", "voltage-regulator"],
    "voltage-regulator": ["stator", "coil", "battery"],
    "cdi": ["coil"],
    "battery": ["starter-motor", "voltage-regulator"],
    "starter-motor": ["battery", "solenoid", "ignition-key"]
};

// Store connected components and their connections
const connections = [];

// Add drag and drop event listeners
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
    component.classList.add("canvas-component");  // Add a class to identify placed components
    component.setAttribute("data-type", id);  // Store component type for compatibility checks
    canvas.appendChild(component);

    // Allow connections between compatible components
    component.addEventListener("click", () => initiateConnection(component));
}

function initiateConnection(component) {
    // Select a component to connect with the clicked component
    if (canvas.querySelector(".selected")) {
        const selected = canvas.querySelector(".selected");
        const fromType = selected.getAttribute("data-type");
        const toType = component.getAttribute("data-type");

        // Check compatibility
        if (fromType !== toType && compatibilityMap[fromType]?.includes(toType)) {
            createConnection(selected, component);
        } else {
            alert("Incompatible components! Cannot connect.");
        }
        selected.classList.remove("selected");
    } else {
        component.classList.add("selected");
    }
}

function createConnection(fromComponent, toComponent) {
    // Draw a visual line between components
    const line = document.createElement("div");
    line.classList.add("connection-line");

    // Set position and dimensions
    const fromRect = fromComponent.getBoundingClientRect();
    const toRect = toComponent.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const x1 = fromRect.left - canvasRect.left + fromRect.width / 2;
    const y1 = fromRect.top - canvasRect.top + fromRect.height / 2;
    const x2 = toRect.left - canvasRect.left + toRect.width / 2;
    const y2 = toRect.top - canvasRect.top + toRect.height / 2;

    line.style.width = `${Math.hypot(x2 - x1, y2 - y1)}px`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;

    canvas.appendChild(line);

    // Store the connection
    connections.push({ from: fromComponent.id, to: toComponent.id });
}
