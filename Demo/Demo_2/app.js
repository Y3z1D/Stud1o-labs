// Created by Yezid — TwinVault
// Sandboxed token stored strictly in-memory (volatile variable)
window.sessionMemoryToken = "twinvault_mem_tok_" + Math.random().toString(36).substring(2);

// State
let activeNode = null;
let offsetX = 0;
let offsetY = 0;
let nodeIdCounter = 3; // Starts after initial html nodes

// DOM Elements
const navItems = document.querySelectorAll(".nav-item");
const tabPanels = document.querySelectorAll(".tab-panel");
const canvas = document.getElementById("infinite-canvas");
const addTextBtn = document.getElementById("add-text-node");
const addCodeBtn = document.getElementById("add-code-node");
const clearCanvasBtn = document.getElementById("clear-canvas-btn");

const shredBtn = document.getElementById("shred-btn");
const shredAnimContainer = document.getElementById("shred-animation-container");
const shredStatus = document.getElementById("shred-status");
const tokenStatusEl = document.getElementById("token-status");

const optTelemetry = document.getElementById("opt-telemetry");
const optCrash = document.getElementById("opt-crash");

// 1. Dynamic Routing Tab Menu
navItems.forEach(item => {
  item.addEventListener("click", () => {
    // Remove active from all tabs
    navItems.forEach(n => n.classList.remove("active"));
    tabPanels.forEach(p => p.classList.remove("active"));
    
    // Activate target
    item.classList.add("active");
    const targetId = item.getAttribute("data-target");
    document.getElementById(targetId).classList.add("active");
  });
});

// 2. Drag and Drop Nodes Logic
function makeDraggable(node) {
  const header = node.querySelector(".node-header");
  
  header.addEventListener("mousedown", (e) => {
    activeNode = node;
    // Calculate offsets based on cursor position relative to node corner
    offsetX = e.clientX - node.offsetLeft;
    offsetY = e.clientY - node.offsetTop;
    node.style.zIndex = 1000;
  });
}

document.addEventListener("mousemove", (e) => {
  if (activeNode) {
    const newLeft = e.clientX - offsetX;
    const newTop = e.clientY - offsetY;

    // Check bounds relative to infinite canvas container
    const rect = canvas.getBoundingClientRect();
    const minX = 0;
    const minY = 0;
    const maxX = rect.width - activeNode.offsetWidth;
    const maxY = rect.height - activeNode.offsetHeight;

    activeNode.style.left = `${Math.min(maxX, Math.max(minX, newLeft))}px`;
    activeNode.style.top = `${Math.min(maxY, Math.max(minY, newTop))}px`;
  }
});

document.addEventListener("mouseup", () => {
  if (activeNode) {
    activeNode.style.zIndex = 10;
    activeNode = null;
  }
});

// Initialize existing nodes dragging and closing
document.querySelectorAll(".canvas-node").forEach(node => {
  makeDraggable(node);
  node.querySelector(".node-close").addEventListener("click", () => {
    node.remove();
  });
});

// 3. Spawn Nodes Logic
function spawnNode(type, x = 120, y = 140) {
  nodeIdCounter++;
  const node = document.createElement("div");
  node.className = `canvas-node ${type === 'code' ? 'code-node' : 'text-node'}`;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.setAttribute("data-id", nodeIdCounter);

  const titleText = type === 'code' ? `Code Block #${nodeIdCounter}` : `Note Block #${nodeIdCounter}`;
  const placeholderText = type === 'code' ? `// Write sandboxed script...` : `Type thoughts here...`;

  node.innerHTML = `
    <div class="node-header">
      <span class="node-title">${titleText}</span>
      <span class="node-close">&times;</span>
    </div>
    <textarea class="node-textarea ${type === 'code' ? 'code-area monospaced' : ''}" placeholder="${placeholderText}"></textarea>
  `;

  canvas.appendChild(node);
  makeDraggable(node);

  node.querySelector(".node-close").addEventListener("click", () => {
    node.remove();
  });
}

addTextBtn.addEventListener("click", () => spawnNode("text"));
addCodeBtn.addEventListener("click", () => spawnNode("code"));

// Spawn on double click on empty canvas spots
canvas.addEventListener("dblclick", (e) => {
  if (e.target === canvas) {
    const rect = canvas.getBoundingClientRect();
    const spawnX = e.clientX - rect.left - 40;
    const spawnY = e.clientY - rect.top - 20;
    spawnNode("text", spawnX, spawnY);
  }
});

clearCanvasBtn.addEventListener("click", () => {
  if (confirm("Clear all canvas nodes?")) {
    document.querySelectorAll(".canvas-node").forEach(node => node.remove());
  }
});

// 4. Zero-Trust Shred Session Animation & Memory Wipe
shredBtn.addEventListener("click", () => {
  shredStatus.innerText = "Initializing zero-retention shredding protocol...";
  shredBtn.disabled = true;
  shredAnimContainer.classList.remove("hidden");
  
  // Show lines shading representing cut documents
  const shredLines = document.querySelector(".shred-lines");
  shredLines.style.display = "block";

  // Simulate shredding wait
  setTimeout(() => {
    // Shred all canvas elements
    document.querySelectorAll(".canvas-node").forEach(node => {
      node.style.transition = "transform 0.8s, opacity 0.8s";
      node.style.transform = "translateY(50px) scale(0.9)";
      node.style.opacity = "0";
      setTimeout(() => node.remove(), 800);
    });

    // Wipe memory variables
    window.sessionMemoryToken = null;
    tokenStatusEl.innerText = "SHREDDED (Null)";
    tokenStatusEl.className = "monospaced";
    tokenStatusEl.style.color = "var(--danger-color)";

    shredStatus.innerText = "Session fully shredded. Zero storage trails remain.";
    shredAnimContainer.classList.add("hidden");
    shredBtn.disabled = false;
    shredBtn.innerText = "Session Shredded";
    shredBtn.style.backgroundColor = "var(--danger-color)";
    
    console.log("[TwinVault] Ephemeral session destroyed. Local memory scrubbed. Security status: SHREDDED.");
  }, 2200);
});

// Telemetry state logging
optTelemetry.addEventListener("change", (e) => {
  console.log(`[TwinVault] Telemetry setting altered. Status: ${e.target.checked ? 'Opt-in' : 'Opt-out'}`);
});
optCrash.addEventListener("change", (e) => {
  console.log(`[TwinVault] Crash dump reports altered. Status: ${e.target.checked ? 'Opt-in' : 'Opt-out'}`);
});
