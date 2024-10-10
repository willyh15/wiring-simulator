// Store the existing connections
const components = document.querySelectorAll(".component");
const canvas = document.getElementById("wiring-canvas");
const wireButtons = document.querySelectorAll(".wire-type");

// Store selected wire type (default: red)
let selectedWireType = "red";

// Track selected paths and circuits
let highlightedPaths = [];

// Set up wire type selection
wireButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedWireType = button.id.split("-")[0];
        wireButtons.forEach(btn => btn.style.outline = "none");
        button.style.outline = "2px solid blue";  // Highlight selected button
    });
});

// Compatibility Map and Connections
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

const connections = [];

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
    component.classList.add("canvas-component");
    component.setAttribute("data-type", id);
    canvas.appendChild(component);

    const terminals = component.querySelectorAll(".terminal");
    terminals.forEach(terminal => {
        terminal.addEventListener("click", () => initiateConnection(terminal));
    });

    // Add path highlighting for the newly placed component
    component.addEventListener("click", () => highlightPaths(component));
}

function initiateConnection(terminal) {
    if (canvas.querySelector(".selected-terminal")) {
        const selected = canvas.querySelector(".selected-terminal");
        const fromType = selected.parentElement.getAttribute("data-type");
        const toType = terminal.parentElement.getAttribute("data-type");

        if (fromType !== toType && compatibilityMap[fromType]?.includes(toType)) {
            createConnection(selected, terminal);
        } else {
            alert("Incompatible components! Cannot connect.");
        }
        selected.classList.remove("selected-terminal");
    } else {
        terminal.classList.add("selected-terminal");
    }
}

function createConnection(fromTerminal, toTerminal) {
    const line = document.createElement("div");
    line.classList.add("connection-line", selectedWireType);  // Apply wire type

    const fromRect = fromTerminal.getBoundingClientRect();
    const toRect = toTerminal.getBoundingClientRect();
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

    connections.push({ from: fromTerminal.id, to: toTerminal.id, wireType: selectedWireType });

    // Validate the circuit after each connection
    validateCircuit();
}

function highlightPaths(component) {
    // Clear previous highlights
    clearHighlights();

    // Find all connections starting from this component
    const componentId = component.id;
    const connectedPaths = connections.filter(conn => conn.from.includes(componentId) || conn.to.includes(componentId));

    // Highlight all connected paths
    connectedPaths.forEach(path => {
        const line = document.querySelector(`.connection-line[data-id="${path.from}-${path.to}"]`);
        if (line) {
            line.style.outline = "3px solid blue";
            highlightedPaths.push(line);
        }
    });
}

function clearHighlights() {
    highlightedPaths.forEach(path => path.style.outline = "none");
    highlightedPaths = [];
}

function validateCircuit() {
    // Check if there are any completed circuits (battery connected to a motor, for example)
    const battery = connections.find(conn => conn.from.includes("battery") || conn.to.includes("battery"));
    const motor = connections.find(conn => conn.from.includes("starter-motor") || conn.to.includes("starter-motor"));

    if (battery && motor) {
        alert("Complete Circuit Detected!");
    }
}