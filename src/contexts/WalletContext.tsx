import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import modxTokenAbi from '../../modxToken.json';

// TypeScript için window.ethereum tipini genişletiyoruz
declare global {
  interface Window {
    ethereum?: any;
  }
}

const MODX_TOKEN_ADDRESS = '0xb6322ed8561604ca2a1b9c17e4d02b957eb242fe';
const CHAIN_ID = '0x61'; // BSC Testnet
const CHAIN_NAME = 'BSC Testnet';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  modxBalance: string | null;
  network: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  addBSCTestnet: () => Promise<void>;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [modxBalance, setModxBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);

  const getProvider = () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return null;
    }
    return new ethers.providers.Web3Provider(window.ethereum);
  };

  const updateBalances = useCallback(async (account: string, provider: ethers.providers.Web3Provider) => {
    try {
      const balanceWei = await provider.getBalance(account);
      const balanceEth = ethers.utils.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4));

      const modxContract = new ethers.Contract(MODX_TOKEN_ADDRESS, modxTokenAbi, provider);
      const modxBalanceWei = await modxContract.balanceOf(account);
      const modxBalanceEth = ethers.utils.formatUnits(modxBalanceWei, 18);
      setModxBalance(parseFloat(modxBalanceEth).toFixed(2));
    } catch (error) {
      console.error("Failed to update balances:", error);
      setModxBalance('0.00'); // Hata durumunda bakiyeyi sıfırla
    }
  }, []);

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    const provider = getProvider();
    if (accounts.length === 0 || !provider) {
      disconnectWallet();
    } else {
      const newAddress = ethers.utils.getAddress(accounts[0]);
      setAddress(newAddress);
      await updateBalances(newAddress, provider);
    }
  }, [updateBalances]);

  const addBSCTestnet = async () => {
    const provider = getProvider();
    if (provider) {
      try {
        await provider.send('wallet_addEthereumChain', [{
          chainId: CHAIN_ID,
          chainName: 'BNB Smart Chain Testnet',
          nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
          rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
          blockExplorerUrls: ['https://testnet.bscscan.com']
        }]);
      } catch (addError) {
        console.error("Failed to add BSC Testnet:", addError);
      }
    }
  };

  const connectWallet = async () => {
    const provider = getProvider();
    if (provider) {
      try {
        const accounts = await provider.send("eth_requestAccounts", []);
        await handleAccountsChanged(accounts);
        
        const network = await provider.getNetwork();
        if (network.chainId !== 97) {
          await addBSCTestnet();
          // Tekrar kontrol et veya kullanıcıya sayfayı yenilemesini söyle
          const newProvider = getProvider();
          if(newProvider) {
            const newNetwork = await newProvider.getNetwork();
            if(newNetwork.chainId === 97) {
              setNetwork(CHAIN_NAME);
              await handleAccountsChanged(accounts);
            }
          }
        } else {
          setNetwork(CHAIN_NAME);
          await handleAccountsChanged(accounts);
        }

      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setBalance(null);
    setModxBalance(null);
    setNetwork(null);
  };

  useEffect(() => {
    const provider = getProvider();
    if (provider) {
      provider.listAccounts().then(handleAccountsChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
      }
    };
  }, [handleAccountsChanged]);

  const value = {
    isConnected: !!address,
    address,
    balance,
    modxBalance,
    network,
    connectWallet,
    disconnectWallet,
    addBSCTestnet,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
