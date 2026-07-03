// Created by Yezid — Twinvault
// Particle Canvas Logic
const canvas = document.getElementById("interactive-particles");
const ctx = canvas.getContext("2d");

let particles = [];
let mouse = { x: null, y: null, radius: 100 };

// Resize Canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Handle Mouse Coordinates
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener("mouseout", () => {
  mouse.x = null;
  mouse.y = null;
});

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.density = (Math.random() * 20) + 10;
  }
  update() {
    // Check mouse interaction
    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx*dx + dy*dy);
      
      if (distance < mouse.radius) {
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let force = (mouse.radius - distance) / mouse.radius;
        let directionX = forceDirectionX * force * this.density * 0.4;
        let directionY = forceDirectionY * force * this.density * 0.4;
        
        // Pull particles slowly towards mouse (attractor)
        this.x += directionX;
        this.y += directionY;
      }
    }
    
    // Constant slow float
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Bounds wrap
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }
  draw() {
    ctx.fillStyle = "rgba(138, 43, 226, 0.4)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
  }
}

// Populate Particles
function initParticles() {
  particles = [];
  const count = Math.floor((canvas.width * canvas.height) / 18000);
  for (let i = 0; i < Math.min(count, 120); i++) {
    particles.push(new Particle());
  }
}
initParticles();

// Connect Particles with lines
function connectParticles() {
  let maxDistance = 120;
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let distance = Math.sqrt(dx*dx + dy*dy);
      
      if (distance < maxDistance) {
        // Line transparency based on distance
        let opacity = 1 - (distance / maxDistance);
        ctx.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.15})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

// Particle Loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  connectParticles();
  requestAnimationFrame(animate);
}
animate();

// 2. Linear Narrative Scroll Observer
const slides = document.querySelectorAll(".narrative-slide");
const slideProgressBar = document.getElementById("slide-progress");

const observerOptions = {
  root: null, // Viewport
  threshold: 0.4 // Trigger when 40% of slide is in viewport
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Deactivate all
      slides.forEach(s => s.classList.remove("active-slide"));
      // Activate this slide
      entry.target.classList.add("active-slide");
      
      // Calculate progress indicator percentage
      const totalSlides = slides.length;
      let activeIndex = 0;
      slides.forEach((s, idx) => {
        if (s.id === entry.target.id) activeIndex = idx;
      });
      
      const percentage = ((activeIndex + 1) / totalSlides) * 100;
      slideProgressBar.style.width = `${percentage}%`;
    }
  });
}, observerOptions);

slides.forEach(slide => observer.observe(slide));

// 3. Web3 Wallet Connection Simulator
let walletConnected = false;
const connectBtn = document.getElementById("wallet-connect-btn");
const statusTextEl = document.getElementById("wallet-status-text");
const addressValEl = document.getElementById("wallet-address-val");

connectBtn.addEventListener("click", () => {
  if (walletConnected) {
    disconnectWallet();
    return;
  }

  connectBtn.innerText = "Authorizing...";
  connectBtn.disabled = true;

  setTimeout(() => {
    // Simulate Metamask confirmation modal
    const mockAddress = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    walletConnected = true;
    
    connectBtn.innerText = "Disconnect Wallet";
    connectBtn.disabled = false;
    connectBtn.style.borderColor = "var(--neon-emerald)";
    connectBtn.style.color = "var(--neon-emerald)";

    statusTextEl.innerText = "Connected";
    statusTextEl.className = "text-success";
    addressValEl.innerText = mockAddress;
    
    logWebhookEvent("Web3 Node: Cryptographic Handshake successful.");
    logWebhookEvent(`Active Wallet Public Key bound: ${mockAddress.substring(0, 8)}...${mockAddress.substring(34)}`);
  }, 1200);
});

function disconnectWallet() {
  walletConnected = false;
  connectBtn.innerText = "Connect Web3 ID";
  connectBtn.style.borderColor = "var(--neon-cyan)";
  connectBtn.style.color = "var(--neon-cyan)";
  
  statusTextEl.innerText = "Disconnected";
  statusTextEl.className = "text-alert";
  addressValEl.innerText = "None";

  logWebhookEvent("Web3 Node: Wallet connection severed by user.");
}

// 4. Hardened Webhooks Simulator
const webhookConsole = document.getElementById("webhook-console");
const testWebhookBtn = document.getElementById("test-webhook-btn");

function logWebhookEvent(message, type = "info") {
  const time = new Date().toLocaleTimeString();
  const line = document.createElement("div");
  line.className = "webhook-log-line";
  
  if (type === "sig") {
    line.innerHTML = `[${time}] <span class="webhook-log-sig">${message}</span>`;
  } else {
    line.innerText = `[${time}] ${message}`;
  }
  
  webhookConsole.appendChild(line);
  webhookConsole.scrollTop = webhookConsole.scrollHeight;
}

// Initial logs
logWebhookEvent("CORS Rules: Sandbox configured to accept requests strictly from local nodes.");
logWebhookEvent("Origin Isolation Status: Shield Verified. WebGL canvas sandboxed.");

testWebhookBtn.addEventListener("click", () => {
  logWebhookEvent("Outgoing Webhook Event Triggered...");
  
  // Simulate payload data
  const payload = {
    event: "TEST_HEARTBEAT",
    timestamp: "June, 2026",
    network: "NEXUS_WEB3_ROUTER"
  };

  logWebhookEvent("Encrypting payload hash...");
  
  setTimeout(() => {
    // Generate a mock SHA256 HMAC hash
    const mockHmac = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    
    logWebhookEvent(`Header signed -> X-Signature: sha256=${mockHmac}`, "sig");
    logWebhookEvent("Transmission complete. Target server response: 200 OK (CORS Approved)");
  }, 800);
});
