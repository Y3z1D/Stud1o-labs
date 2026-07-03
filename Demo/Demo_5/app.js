// Mock Ledger Data
const rawLedgerData = [
  { time: "00:43:16", sender: "ACC-5521-8890", route: "RT-US-88029", amount: "1,250,000.00", status: "Settled" },
  { time: "00:43:30", sender: "ACC-9128-4412", route: "RT-EU-99211", amount: "840,500.00", status: "Settled" },
  { time: "00:44:02", sender: "ACC-1049-7623", route: "RT-US-10294", amount: "3,100,000.00", status: "Settled" },
  { time: "00:44:45", sender: "ACC-3329-8809", route: "RT-SG-77319", amount: "420,000.00", status: "Settled" }
];

const encryptedLedgerData = [
  { time: "00:43:16", sender: "aes256:gcm:9f2a8c7b6d5e...", route: "aes256:gcm:3a4b5c6d7e8f...", amount: "1,250,000.00", status: "Settled" },
  { time: "00:43:30", sender: "aes256:gcm:8e7d6c5b4a3f...", route: "aes256:gcm:2b3c4d5e6f7a...", amount: "840,500.00", status: "Settled" },
  { time: "00:44:02", sender: "aes256:gcm:1a2b3c4d5e6f...", route: "aes256:gcm:7f8e9d0c1b2a...", amount: "3,100,000.00", status: "Settled" },
  { time: "00:44:45", sender: "aes256:gcm:5f6e7d8c9b0a...", route: "aes256:gcm:8b9c0d1e2f3a...", amount: "420,000.00", status: "Settled" }
];

// State variables
let isAuthenticated = false;
let isEncrypted = true;
let activeResidencyZone = "us";
let siemInterval = null;

// DOM Elements
const bodyEl = document.body;
const themeToggleBtn = document.getElementById("theme-toggle");
const cmpBanner = document.getElementById("cmp-banner");
const cmpAccept = document.getElementById("cmp-accept");
const cmpReject = document.getElementById("cmp-reject");

const authModal = document.getElementById("auth-modal");
const cancelAuthBtn = document.getElementById("cancel-auth");
const keySensor = document.querySelector(".key-sensor");
const attestationStatus = document.getElementById("attestation-status");
const attestationProgress = document.getElementById("attestation-progress");

const publicView = document.getElementById("public-view");
const portalView = document.getElementById("portal-view");
const navPortalBtn = document.getElementById("nav-portal-btn");
const heroEnterBtn = document.getElementById("hero-enter-btn");
const logoutBtn = document.getElementById("logout-btn");

const ledgerBody = document.getElementById("ledger-body");
const encryptionToggle = document.getElementById("encryption-toggle");
const siemLogsContainer = document.getElementById("siem-logs");
const residencySelect = document.getElementById("residency-select");

const dsarDownloadBtn = document.getElementById("dsar-download");
const dsarForgetBtn = document.getElementById("dsar-forget");

// Cookies banner compliance actions (Accept and Reject behave identically)
cmpAccept.addEventListener("click", () => {
  cmpBanner.classList.add("hidden");
  addSiemLog("CMP cookies session updated. Permissions accepted.", "info");
});
cmpReject.addEventListener("click", () => {
  cmpBanner.classList.add("hidden");
  addSiemLog("CMP cookies session updated. Non-essential tracking declined.", "info");
});

// Theme Toggle
themeToggleBtn.addEventListener("click", () => {
  if (bodyEl.classList.contains("dark-mode")) {
    bodyEl.classList.remove("dark-mode");
    bodyEl.classList.add("light-mode");
  } else {
    bodyEl.classList.remove("light-mode");
    bodyEl.classList.add("dark-mode");
  }
});

// Authentication Flow (WebAuthn hardware attestation simulation)
function showAuthModal() {
  authModal.classList.remove("hidden");
  attestationProgress.style.width = "0%";
  attestationStatus.innerText = "Waiting for security token or Passkey touch...";
}

function hideAuthModal() {
  authModal.classList.add("hidden");
}

cancelAuthBtn.addEventListener("click", hideAuthModal);

keySensor.addEventListener("click", () => {
  attestationStatus.innerText = "Communicating with hardware authenticator...";
  attestationProgress.style.transition = "width 2.5s cubic-bezier(0.4, 0, 0.2, 1)";
  attestationProgress.style.width = "100%";

  setTimeout(() => {
    attestationStatus.innerText = "Credential verified. Loading secure silo container...";
    addSiemLog("WebAuthn API: Received FIDO2 attestation signature.", "info");
    addSiemLog("WebAuthn API: Hardware key validated against Twinvault KDF.", "info");
    
    setTimeout(() => {
      hideAuthModal();
      authenticateUser();
    }, 800);
  }, 2500);
});

navPortalBtn.addEventListener("click", () => {
  if (isAuthenticated) {
    disconnectUser();
  } else {
    showAuthModal();
  }
});

heroEnterBtn.addEventListener("click", () => {
  showAuthModal();
});

logoutBtn.addEventListener("click", disconnectUser);

function authenticateUser() {
  isAuthenticated = true;
  publicView.classList.add("hidden");
  portalView.classList.remove("hidden");
  navPortalBtn.innerText = "Disconnect Portal";
  addSiemLog("User Portal connected: Gated relational matrix instantiated.", "info");
  renderLedger();
  startSiemSimulation();
}

function disconnectUser() {
  isAuthenticated = false;
  portalView.classList.add("hidden");
  publicView.classList.remove("hidden");
  navPortalBtn.innerText = "Enterprise Portal";
  clearInterval(siemInterval);
  addSiemLog("User Portal disconnected. Gated session shredded.", "alert");
}

// Ledger Renderer
function renderLedger() {
  ledgerBody.innerHTML = "";
  const dataset = isEncrypted ? encryptedLedgerData : rawLedgerData;
  dataset.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="monospaced">${item.time}</td>
      <td class="monospaced">${item.sender}</td>
      <td class="monospaced">${item.route}</td>
      <td class="monospaced text-highlight">$${item.amount}</td>
      <td><span class="status-pill">${item.status}</span></td>
    `;
    ledgerBody.appendChild(row);
  });
}

encryptionToggle.addEventListener("change", (e) => {
  isEncrypted = e.target.checked;
  renderLedger();
  addSiemLog(`Database query view altered: Column encryption ${isEncrypted ? 'enabled' : 'disabled (Decrypted RAM View)'}`, isEncrypted ? 'info' : 'alert');
});

// SIEM Anomaly Log Stream
function addSiemLog(message, type = "normal") {
  const timestamp = new Date().toLocaleTimeString();
  const logLine = document.createElement("div");
  logLine.className = `log-line ${type === 'alert' ? 'log-alert' : type === 'info' ? 'log-info' : ''}`;
  logLine.innerText = `[${timestamp}] [SYS-AUDIT] ${message}`;
  siemLogsContainer.appendChild(logLine);
  siemLogsContainer.scrollTop = siemLogsContainer.scrollHeight;
}

function startSiemSimulation() {
  // Clear any existing logs
  siemLogsContainer.innerHTML = "";
  addSiemLog("SIEM Telemetry initialized. Node audit stream active.", "info");
  addSiemLog("June 2026 Sovereign Compliance policy checking initialized.", "info");
  
  const mockMessages = [
    { text: "Secure WebSocket connection validated with node US-EAST-5.", type: "normal" },
    { text: "Database column verification check: AES-256-GCM integrity matches signature.", type: "info" },
    { text: "TLS session refreshed: Cipher suite ECDHE-ECDSA-AES256-GCM-SHA384 active.", type: "normal" },
    { text: "AI Threat Engine: Normal transaction volume patterns observed.", type: "normal" },
    { text: "Suspicious API polling detected from IP 184.23.109.11 - WAF auto-throttled rate limit.", type: "alert" },
    { text: "IP 184.23.109.11 client reputation score downgraded. Alert reported to SIEM console.", type: "alert" },
    { text: "DSAR Audit trail generated: Session access tokens registered in zero-trust memory.", type: "info" }
  ];

  siemInterval = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * mockMessages.length);
    const msg = mockMessages[randomIndex];
    addSiemLog(msg.text, msg.type);
  }, 4000);
}

// Sovereign Data Residency Selector
residencySelect.addEventListener("change", (e) => {
  activeResidencyZone = e.target.value;
  addSiemLog(`Sovereign Data Migration Event: Data assets transferring to ${e.target.options[e.target.selectedIndex].text}...`, "alert");
  
  setTimeout(() => {
    addSiemLog(`Data Migration complete. Active residency bound to selected region: ${activeResidencyZone.toUpperCase()}`, "info");
  }, 1500);
});

// Subject Access Requests (DSAR) actions
dsarDownloadBtn.addEventListener("click", () => {
  const dsarPayload = {
    requester: "Twinvault User",
    complianceDate: "June, 2026",
    activeSovereigntyZone: activeResidencyZone.toUpperCase(),
    encryptionMechanism: "AES-256-GCM",
    attestationFido2Signature: "fido2-hardware-token-sha256-signature-registered",
    cookieConsentConsentState: "EssentialOnly",
    retrievedData: {
      ledgerSummary: rawLedgerData,
      auditLogsCount: siemLogsContainer.children.length
    }
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dsarPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `twinvault_demo_dsar_june_2026.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  addSiemLog("DSAR (Data Subject Access Request) report generated and downloaded.", "info");
});

dsarForgetBtn.addEventListener("click", () => {
  if (confirm("Execute 'Right to be Forgotten'? This will shred your gated session, clear transaction history, and remove all localized logs.")) {
    addSiemLog("Executing GDPR Article 17: Right to Be Forgotten. Wiping telemetry & ledger data...", "alert");
    
    // Add visual wipe effect
    portalView.style.transition = "opacity 1.5s ease-out, filter 1.5s ease-out";
    portalView.style.opacity = "0.1";
    portalView.style.filter = "blur(10px)";

    setTimeout(() => {
      // Clear all state
      portalView.style.opacity = "1";
      portalView.style.filter = "none";
      disconnectUser();
      alert("Right to be Forgotten executed. Gated database columns and local telemetry records have been shredded.");
    }, 1800);
  }
});

// Trigger initial welcome log
addSiemLog("Twinvault demo loaded. Active session secured.");
