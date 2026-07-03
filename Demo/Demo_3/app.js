// Created by Yezid — Twinvault
// State
let trackingCookiesActive = false;
let selectedNode = null;

// DOM Elements
const ambientTrigger = document.getElementById("ambient-trigger");
const ambientExpanded = document.getElementById("ambient-expanded");
const cookieGeoToggle = document.getElementById("cookie-geo-toggle");
const badgeDot = ambientTrigger.querySelector("span");
const statusNote = ambientExpanded.querySelector(".status-note");

const mapNodes = document.querySelectorAll(".map-node");
const mapInfoBox = document.getElementById("map-info-box");
const mapNodeCoords = document.getElementById("map-node-coords");

const didUsernameInput = document.getElementById("did-username");
const generateDidBtn = document.getElementById("generate-did-btn");
const didOutputPanel = document.getElementById("did-output-panel");
const didIdString = document.getElementById("did-id-string");
const exportDidBtn = document.getElementById("export-did-btn");

// 1. Ambient Cookie Floating Indicator Actions
ambientTrigger.addEventListener("click", () => {
  ambientExpanded.classList.toggle("hidden");
});

// Close expanded card if clicked outside
document.addEventListener("click", (e) => {
  if (!ambientTrigger.contains(e.target) && !ambientExpanded.contains(e.target)) {
    ambientExpanded.classList.add("hidden");
  }
});

cookieGeoToggle.addEventListener("change", (e) => {
  trackingCookiesActive = e.target.checked;
  
  if (trackingCookiesActive) {
    badgeDot.className = "badge-dot-on";
    statusNote.innerText = "Status: Geo-Mapping Active";
    statusNote.style.color = "var(--accent-olive)";
    console.log("[Twinvault] Mapping cookies accepted. Temporary coordinate tracking active.");
  } else {
    badgeDot.className = "badge-dot-off";
    statusNote.innerText = "Status: Cookie-Free Browsing";
    statusNote.style.color = "var(--accent-terracotta)";
    console.log("[Twinvault] Mapping cookies revoked. Coordinates locked.");
  }

  // Refresh coordinate text on current selection if any
  if (selectedNode) {
    updateMapCoordsText(selectedNode);
  }
});

// 2. Vector Map Interaction
mapNodes.forEach(node => {
  node.addEventListener("click", () => {
    selectedNode = node;
    const name = node.getAttribute("data-name");
    
    mapInfoBox.querySelector("h4").innerText = name;
    mapInfoBox.classList.remove("hidden");
    
    updateMapCoordsText(node);
  });
});

function updateMapCoordsText(node) {
  const loc = node.getAttribute("data-loc");
  if (trackingCookiesActive) {
    mapNodeCoords.innerText = `GPS Location: ${loc}`;
    mapNodeCoords.style.color = "var(--accent-olive)";
  } else {
    mapNodeCoords.innerText = "GPS Location: Locked (Geomapping Cookies Off)";
    mapNodeCoords.style.color = "var(--text-muted)";
  }
}

// 3. Decentralized Identity (DID) keypair simulator
generateDidBtn.addEventListener("click", () => {
  const username = didUsernameInput.value.trim();
  if (!username) {
    alert("Please enter a username to sign the identity card.");
    return;
  }

  // Simulate generating keys
  const randomHex = Array.from({length: 12}, () => Math.floor(Math.random()*16).toString(16)).join('');
  const didURI = `did:human:${username.toLowerCase()}:${randomHex}`;
  const mockPublicKey = `ed25519:pub_${Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;

  // Store in LocalStorage representing device storage (IndexedDB mock)
  const profile = {
    username,
    didURI,
    publicKey: mockPublicKey,
    created: "June, 2026",
    issuer: "twinvault.peer.v0"
  };

  localStorage.setItem("did_coop_profile", JSON.stringify(profile));

  didIdString.innerText = didURI;
  didOutputPanel.classList.remove("hidden");
  console.log(`[Twinvault] Cryptographic DID profile generated for ${username}. Keypair cached on device.`);
});

// Load existing DID card if present
window.addEventListener("DOMContentLoaded", () => {
  const savedProfile = localStorage.getItem("did_coop_profile");
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    didUsernameInput.value = profile.username;
    didIdString.innerText = profile.didURI;
    didOutputPanel.classList.remove("hidden");
  }
});

exportDidBtn.addEventListener("click", () => {
  const savedProfile = localStorage.getItem("did_coop_profile");
  if (!savedProfile) return;

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(savedProfile);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `did_coop_profile_june_2026.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});
