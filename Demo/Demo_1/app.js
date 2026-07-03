// Created by Yezid — Twinvault
// State
let cookieConsent = null;
let modalCount = 0;
let totalPoints = 0;

// Bot detection telemetry variables
let lastMouseX = null;
let lastMouseY = null;
let lastMouseTime = null;
let velocities = [];
let deviationCount = 0;
let moveEvents = 0;

// DOM Elements
const cookieBanner = document.getElementById("vibe-cookie-banner");
const incognitoBtn = document.getElementById("cookie-incognito");
const trackBtn = document.getElementById("cookie-track");

const buyButtons = document.querySelectorAll(".buy-btn");
const modalStack = document.getElementById("modal-stack");

const wafVelocityEl = document.getElementById("waf-velocity");
const wafDevEl = document.getElementById("waf-dev");
const wafProbabilityEl = document.getElementById("waf-probability");
const wafBarEl = document.getElementById("waf-bar");

const vaultToggles = document.querySelectorAll(".vault-toggle");
const ptsCountEl = document.getElementById("pts-count");

// Symmetrical Split Cookie Banner Actions
function handleCookieSelection(choice) {
  cookieConsent = choice;
  localStorage.setItem("vibe_cookie_consent", choice);
  localStorage.setItem("vibe_cookie_timestamp", Date.now());
  cookieBanner.style.transition = "transform 0.5s ease-in, opacity 0.5s ease-in";
  cookieBanner.style.transform = "scale(0.95)";
  cookieBanner.style.opacity = "0";
  setTimeout(() => {
    cookieBanner.classList.add("hidden");
  }, 500);

  console.log(`[Twinvault] Cookie decision recorded: ${choice}. Preference locked for 6 months (until Dec 2026).`);
}

// Check existing cookie lock
window.addEventListener("DOMContentLoaded", () => {
  const savedConsent = localStorage.getItem("vibe_cookie_consent");
  const savedTimestamp = localStorage.getItem("vibe_cookie_timestamp");
  
  if (savedConsent && savedTimestamp) {
    const elapsed = Date.now() - parseInt(savedTimestamp);
    const sixMonthsMs = 6 * 30 * 24 * 60 * 60 * 1000;
    if (elapsed < sixMonthsMs) {
      // Keep banner hidden, decision locked
      cookieBanner.classList.add("hidden");
      console.log(`[Twinvault] Cookie decision lock is ACTIVE. Locked choice: ${savedConsent}`);
    }
  }
});

incognitoBtn.addEventListener("click", () => handleCookieSelection("incognito"));
trackBtn.addEventListener("click", () => handleCookieSelection("track"));

// Cascading Modals Logic
const products = {
  "1": {
    name: "CryptoKitty Vault",
    desc: "A secure digital wallet hidden inside a nostalgic retro pet overlay. It translates complex blockchain signing processes into cute pet interactions (feeding, petting) that sign transactions using local hardware-bound keys. Fully open-source and sandboxed from browser extensions.",
    price: "$4.99"
  },
  "2": {
    name: "PixelPurr Firewall",
    desc: "A game-inspired local firewall that monitors and blocks unauthorized outgoing trackers. When a site tries to leak your analytical data, the WAF displays a retro shooter mini-popup allowing you to 'zap' the tracker or auto-shred it. Extremely satisfying data safety.",
    price: "FREE"
  },
  "3": {
    name: "NeonGrid VPN",
    desc: "A high-performance virtual private network styled as a classic 80s synthesizer. Shift your geographic location, select your data routing bandwidth, and listen to low-fi cybersecurity synthwave tracks streamed directly from decentralized server relays.",
    price: "$2.00"
  }
};

buyButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    const productId = card.getAttribute("data-id");
    createCascadingModal(productId);
  });
});

function createCascadingModal(id) {
  const p = products[id];
  if (!p) return;

  modalCount++;
  // Calculate cascading offset
  const offset = (modalCount - 1) * 30; // 30px offset for cascading stack

  const modal = document.createElement("div");
  modal.className = "cascading-modal border-box";
  modal.style.marginTop = `${offset}px`;
  modal.style.marginLeft = `${offset}px`;
  modal.style.zIndex = 100 + modalCount;
  modal.style.position = "relative";
  modal.style.backgroundColor = modalCount % 2 === 0 ? "#ccff00" : "#ffffff"; // Neon yellow alternate

  modal.innerHTML = `
    <div class="modal-header-row">
      <h3 style="font-family: 'Outfit', sans-serif; font-weight: 900; text-transform: uppercase;">${p.name}</h3>
      <button class="modal-close-btn">&times;</button>
    </div>
    <p class="modal-desc">${p.desc}</p>
    <div class="price-row">
      <span class="price" style="font-size: 1.5rem; font-weight: 900;">${p.price}</span>
      <button class="modal-buy-action">ADD TO BASKET</button>
    </div>
  `;

  // Close button functionality
  modal.querySelector(".modal-close-btn").addEventListener("click", () => {
    modal.remove();
    modalCount = Math.max(0, modalCount - 1);
  });

  modal.querySelector(".modal-buy-action").addEventListener("click", () => {
    alert(`Added ${p.name} to security bundle!`);
    modal.remove();
    modalCount = Math.max(0, modalCount - 1);
  });

  modalStack.appendChild(modal);
}

// Behavioral WAF Bot Mitigation Tracker (analyzing cursor speed & velocity)
window.addEventListener("mousemove", (e) => {
  const now = Date.now();
  const currentX = e.clientX;
  const currentY = e.clientY;

  moveEvents++;

  if (lastMouseX !== null && lastMouseY !== null && lastMouseTime !== null) {
    const dx = currentX - lastMouseX;
    const dy = currentY - lastMouseY;
    const dt = now - lastMouseTime;

    if (dt > 0) {
      // Calculate instantaneous velocity (px/ms to px/s)
      const distance = Math.sqrt(dx * dx + dy * dy);
      const velocity = Math.round((distance / dt) * 1000);
      velocities.push(velocity);

      // Keep last 30 readings
      if (velocities.length > 30) velocities.shift();

      // Average velocity
      const avgVelocity = Math.round(velocities.reduce((a, b) => a + b, 0) / velocities.length);
      wafVelocityEl.innerText = `${avgVelocity} px/s`;

      // Track trajectory shifts (sudden angle deviations represent human behavior, strictly straight represents bots)
      if (Math.abs(dx) > 2 && Math.abs(dy) > 2) {
        deviationCount++;
        wafDevEl.innerText = deviationCount;
      }
    }
  }

  lastMouseX = currentX;
  lastMouseY = currentY;
  lastMouseTime = now;

  // Compute Human confidence
  // Human score improves based on number of moves, variation in speed, and direction changes
  if (moveEvents < 15) {
    wafProbabilityEl.innerText = "Analyzing Pattern...";
    wafBarEl.style.width = "80%";
    wafBarEl.style.backgroundColor = "orange";
  } else {
    // Check variation of velocities (bots move at constant speed or instantly)
    const uniqueVelocities = new Set(velocities);
    const variationScore = uniqueVelocities.size / velocities.length; // Close to 1 means high variability

    // Calculate final probability (100% means bot, 0% means human)
    let botProb = 100;

    // Humans make variable speeds and multiple direction turns
    if (variationScore > 0.4 && deviationCount > 8) {
      botProb = Math.max(2, Math.round(100 - (deviationCount * 3.5) - (variationScore * 40)));
    } else if (variationScore > 0.2) {
      botProb = 50;
    }

    wafProbabilityEl.innerText = `${botProb}% (Verified Human)`;
    wafBarEl.style.width = `${botProb}%`;
    
    if (botProb > 60) {
      wafBarEl.style.backgroundColor = "red";
      wafProbabilityEl.innerText = `${botProb}% (Bot Suspicion)`;
    } else if (botProb > 25) {
      wafBarEl.style.backgroundColor = "orange";
    } else {
      wafBarEl.style.backgroundColor = "var(--neon-green)";
    }
  }
});

// Gamified Data Vault logic
vaultToggles.forEach(toggle => {
  toggle.addEventListener("change", () => {
    let earned = 0;
    if (document.getElementById("vault-style").checked) earned += 30;
    if (document.getElementById("vault-purchase").checked) earned += 50;
    if (document.getElementById("vault-search").checked) earned += 20;

    totalPoints = earned;
    ptsCountEl.innerText = `${totalPoints} PTS`;
    
    // Add active animation bounce to point indicator
    const container = document.querySelector(".points-indicator");
    container.style.transform = "scale(1.05)";
    container.style.backgroundColor = totalPoints > 0 ? "var(--neon-green)" : "#fff";
    
    setTimeout(() => {
      container.style.transform = "scale(1)";
    }, 150);
  });
});
