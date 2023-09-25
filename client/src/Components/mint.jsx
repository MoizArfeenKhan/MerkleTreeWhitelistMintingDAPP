import { parseEther } from "ethers";
import { useState } from "react";
import "./mint.css";

// Define the Mint function component
function Mint({ state }) {
  // Initialize quantity state variable with 1
  const [quantity, setQuantity] = useState(1);

  // Destructure the state object to get necessary variables
  const {
    contract,
    merkleProof,
    checkWL,
    isPublicMintActive,
    isWLMintActive,
    totalMintedPublic,
    totalMintedWL,
    whitelistMintedAmount,
    publicMintedAmount,
    totalSupply,
    maxSupply,
  } = state;

  // Define the Mint function
  const Mint = async () => {
    try {
      // Check if the user is whitelisted
      if (checkWL, 
        isWLMintActive,
        totalMintedWL.toString() < 1,
        whitelistMintedAmount.toString() < 1111,
        totalSupply.toString() < maxSupply.toString()
        ) {
        // Define the amount for whitelist mint
        const amount = { value: parseEther("0.005") };

        // Call the whitelistMint function from the contract
        const tx = await contract.whitelistMint(1, merkleProof, amount);

        // Wait for the transaction to be mined
        await tx.wait();
        alert("Transaction Completed!");
      }
      // Check if public mint is active
      else if (isPublicMintActive,
        totalMintedPublic.toString() < 10,
        publicMintedAmount.toString() + quantity < 7777,
        totalSupply.toString() < maxSupply.toString()
        ) {
        // Define the amount for public mint
        const amount = { value: parseEther((0.01 * quantity).toString()) };

        // Call the publicMint function from the contract
        const tx = await contract.publicMint(quantity, amount);

        // Wait for the transaction to be mined
        await tx.wait();
        alert("Transaction Completed!");
      } else {
        alert("We're Sold Out");
      }
    } catch (error) {
      console.log(error);
      alert("An error occurred while minting: " + error.message);
    }
  };

  return (
    <div className="mint-container">
      {/* Input field for quantity */}
      <div className="quantity-controls">
        <button
          className="quantity-button"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={
            !contract ||
            !isPublicMintActive ||
            isWLMintActive ||
            totalSupply.toString() == maxSupply.toString()
          }
        >
          -
        </button>
        <input
          type="number"
          min="1"
          max={"10" - totalMintedPublic.toString()}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={
            !contract ||
            !isPublicMintActive ||
            isWLMintActive ||
            totalSupply.toString() == maxSupply.toString()
          }
          readOnly
        />

        <button
          className="quantity-button"
          onClick={() =>
            setQuantity(
              Math.min("10" - totalMintedPublic.toString(), quantity + 1)
            )
          }
          disabled={
            !contract ||
            !isPublicMintActive ||
            isWLMintActive ||
            totalSupply.toString() == maxSupply.toString()
          }
        >
          +
        </button>
      </div>

      {/* Button to trigger minting */}
      <button
        className="mint-button"
        onClick={Mint}
        disabled={
          !contract ||
          (!isPublicMintActive && !isWLMintActive) ||
          (!checkWL && !isPublicMintActive) ||
          totalMintedWL.toString() == 1 ||
          totalMintedPublic.toString() == 10 ||
          whitelistMintedAmount.toString() == 1111 ||
          publicMintedAmount.toString() + quantity == 7777 ||
          totalSupply.toString() == maxSupply.toString()
        }
      >
        Mint
        {contract && (
          <>
            {isWLMintActive && " / 0.005 ETH"}
            {isPublicMintActive && ` / ${quantity * 0.01} ETH`}
          </>
        )}
      </button>

      {/* Render input field and button only if contract exists */}
      {contract && (
        <>
          {/* Display total supply and max supply */}
          <p style={{ color: "white" }}>
            {totalSupply.toString()}/{maxSupply.toString()}
          </p>

          {/* Display whitelist status */}
          <div className="mint-status">
            <p style={{ color: "white" }}>
              {totalSupply.toString() != maxSupply.toString() &&
                (!checkWL ? "You are not Whitelisted" : "You are Whitelisted")}
            </p>
          </div>

          {/* Display mint status */}
          <div className="mint-status">
            <p style={{ color: "white" }}>
              {totalSupply.toString() != maxSupply.toString() && (
                <>
                  {isPublicMintActive && "Public Mint is Live"}
                  {isWLMintActive && "Whitelist Mint is Live"}
                  {!isWLMintActive && !isPublicMintActive && "Mint is not Live"}
                </>
              )}
            </p>
          </div>

          {/* Display max per wallet exceeded message */}
          {(totalMintedWL.toString() == 1 ||
            totalMintedPublic.toString() == 10) && (
            <p style={{ color: "red" }}>Max per wallet Exceeded</p>
          )}

          {/* Display sold out messages */}
          <p style={{ color: "red" }}>
            {whitelistMintedAmount.toString() == 1111 &&
              "Whitelist Supply Sold Out"}
            {publicMintedAmount.toString() == 7777 && "Public Supply Sold Out"}
            {totalSupply.toString() == maxSupply.toString() && "We're Sold Out"}
          </p>
        </>
      )}
    </div>
  );
}

export default Mint;
