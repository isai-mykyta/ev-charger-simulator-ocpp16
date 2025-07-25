
# ⚡ OCPP 1.6 EV Charger Simulator

A basic EV charger simulator written in TypeScript that communicates using the OCPP 1.6 JSON protocol. Designed for testing or prototyping charge point management systems (CPMS).

## ✅ Supported OCPP Messages

This simulator currently supports the following OCPP 1.6 messages:

- BootNotification
- ChangeConfiguration
- GetConfiguration
- StatusNotification
- Reset
- Authorize
- StartTransaction
- StopTransaction

## 🚀 Getting Started

Prerequisites
Node.js (v18+ recommended)

Yarn

### Installation

```
git clone https://github.com/your-name/ocpp16-ev-charger-simulator.git
cd ocpp16-ev-charger-simulator
yarn install
```

### ⚙️ Environment Configuration

Before running the simulator, you must create a .env file in the root directory with the  variables provided in .env.example
🛑 The app will throw an error on startup if required variables are missing or invalid.

### Running the Simulator
```
yarn start
```