// Code by Moiz Arfeen Khan

// Importing necessary libraries and components
import { useState, useEffect } from "react";
import contractABI from "./ABI.json";
import { BrowserProvider, Contract } from "ethers";
import { keccak256 } from "ethers";
import { MerkleTree } from "merkletreejs";
import Mint from "./Components/mint";
import Whitelist from "./Account.json";
import dimension from "./5thdimension.png"
import "./App.css";

// Main App function
function App() {

  // Initializing state using React's useState hook
  const [state, setstate] = useState({
    provider: null,
    signer: null,
  });
  const [functions, setfunctions] = useState({
    contract: null,
    merkleProof: null,
    checkWL: false,
    isPublicMintActive: false,
    isWLMintActive: false,
    totalMintedWL: 0,
    totalMintedPublic: 0,
    whitelistMintedAmount: 0,
    publicMintedAmount: 0,
    totalSupply: 0,
    maxSupply: 0
  });
  const [account, setaccount] = useState("none");
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Contract address
  const contractAddress = "0x533130b7d02E545e1e9e3e1e0BeF81D0cc776E37";

  // Function to connect to the wallet
  const connectWallet = async () => {
    try {

      // Checking if window.ethereum is available
      if (window.ethereum) {
        
        // Creating a new provider and signer using ethers.js
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Getting the account address
        const account = await signer.getAddress();
        setaccount(account);

        // Updating the state with the new values
        setstate({
          provider,
          signer
        });
      } else {
        // If window.ethereum is not available, show an error message
        setErrorMessage("Please install Metamask wallet");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const updateContract = async ()=>{

    setLoading(true);

    // Creating a new contract instance
    const contract = new Contract(contractAddress, contractABI, state.signer);

    // Creating a Merkle Tree for the whitelist
    const leafNodes = Whitelist.map((addr) => keccak256(addr));
    const merkleTree = new MerkleTree(leafNodes, keccak256, {
      sortPairs: true,
    });
    const leaf = keccak256(account);
    const merkleProof = merkleTree.getHexProof(leaf);

    // Checking if whitelist and public minting are active
    const isWLMintActive = await contract.isWhitelistMintActive();
    const isPublicMintActive = await contract.isPublicMintActive();

    // Checking if the account is in the whitelist address or not
    const checkWL = await contract.isValidWhiteList(merkleProof, leaf);

    // Getting the total minted tokens by connected wallet
    const totalMintedWL = await contract.totalMintedWhitelist(account);
    const totalMintedPublic = await contract.totalMintedPublic(account);

    const whitelistMintedAmount = await contract.whitelistMintedAmount();
    const publicMintedAmount = await contract.publicMintedAmount()

    const totalSupply = await contract.totalSupply();

    setfunctions({
      contract,
      merkleProof,
      checkWL,
      isWLMintActive,
      isPublicMintActive,
      totalMintedWL,
      totalMintedPublic,
      whitelistMintedAmount,
      publicMintedAmount,
      totalSupply
    });
    setLoading(false);
  }

  useEffect(() => {
  if(state.provider, state.signer){
    updateContract();
  }
    
  }, [state.provider, state.signer]);

  // Rendering the component
  return (
    <>
      <div className="wallet-container">
      <img src={dimension} className="img-fluid" alt=".." width="50%" />
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <button className="wallet-button" onClick={connectWallet}>
          {account === "none" ? "Connect Wallet" : "Connected"}
        </button>
        <div className="wallet-address">Connected Address: {account}</div>
        
        {/* Passing state as a prop to the Mint component */}
        <Mint functions={functions}/>
        {loading && <div>Loading...</div>}
      </div>
    </>
  );
}

// Exporting the App component as default
export default App;
