Stud1o‑Labs 🧪
A multi‑demo behavioural tracking and cybersecurity research laboratory.

Built by Y3z1D under the TwinVault Technologies architecture, this repository contains a series of isolated, edge‑deployed testing environments. Each lab is designed to evaluate custom behavioural tracking mechanics, telemetry data collection, and experimental frontend cybersecurity configurations.

🌐 Live Environment
The complete multi‑demo lab is deployed at the edge:

Main Dashboard:  
https://demo.twinvault.ca/

Individual Labs:

https://demo.twinvault.ca/Demo_1/

https://demo.twinvault.ca/Demo_2/

https://demo.twinvault.ca/Demo_3/

https://demo.twinvault.ca/Demo_4/

https://demo.twinvault.ca/Demo_5/

https://demo.twinvault.ca/Demo_6/

https://demo.twinvault.ca/Demo_7/

Each demo is fully isolated and runs independently for controlled behavioural testing.

🏗️ Architecture & Tech Stack
Deployment Engine: Cloudflare Workers (Edge Serverless)
Hosting Model: Static asset routing directly from the /Demo directory
UI/UX Design: High‑contrast dark UI with emerald‑green crystalline cyber aesthetics
Version Control: Standalone Git repository acting as a secure vault, intentionally disconnected from CI/CD to prevent automated overwrites
Security Model: Frontend‑focused behavioural tracking with controlled telemetry capture

📂 Directory Structure

/Demo
│
├── index.html        # Central dashboard and landing page
│
├── Demo_1            # Isolated behavioural tracking lab
├── Demo_2
├── Demo_3
├── Demo_4
├── Demo_5
├── Demo_6
└── Demo_7            # Each lab contains its own HTML/JS environment
