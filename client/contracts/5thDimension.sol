// SPDX-License-Identifier: MIT

// @creator:     5th Dimension 
// @author:      Moiz Arfeen Khan - twitter.com/MoizAfeenKhan

pragma solidity ^0.8.18;

import "./ERC721A.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "operator-filter-registry/src/DefaultOperatorFilterer.sol";

contract Dimension is ERC721A, ReentrancyGuard, Ownable, DefaultOperatorFilterer{
    using Strings for uint256;

    error NoContracts();
    error NotWhitelisted();
    error MaxSupplyExceeded();
    error TotalSupplyExceeded();
    error MaxSupplyWhitelistExceeded();
    error MaxPerWalletExceeded();
    error PublicMintNotActive();
    error WhitelistMintNotActive();
    error InsufficientValue();

    uint256 public maxSupply = 8888;
    uint256 public reservedSupplyPublic = 7777;
    uint256 public reservedSupplyWhitelist = 1111;
    uint256 public maxMintPerWalletWhitelist = 1;
    uint256 public maxMintPerWalletPublic = 10;
    uint256 public mintPriceWhitelist = 0.005 ether;
    uint256 public mintPricePublic = 0.01 ether;
    uint256 private whitelistMintedAmount = 0;
    uint256 private publicMintedAmount = 0; 

    string private baseTokenUri;
    
    bool public isWhitelistMintActive = false;
    bool public isPublicMintActive = false;
    bool public isRevealed = false;

    bytes32 private merkleRoot;

    // Minted count per stage per wallet.
    mapping (address => uint256) private totalMintedPublic;
    mapping (address => uint256) private totalMintedWhitelist;

    constructor() ERC721A("5th Dimension", "5D") {
        merkleRoot = 0x22fb47ac6f683573431643610abd7dc593b557a4fa4e9fa024faf04e74f6667e;
    }

    // ======= SETTING =======
    modifier callerIsUser() {
        if(msg.sender != tx.origin) revert NoContracts();
        _;
    }

    function _startTokenId() internal pure override returns (uint256){
        return 1;
    }

    //======= Set Variables ======= 
    function setPublicMintPrice(uint256 _mintPricePublic) public onlyOwner {
        mintPricePublic = _mintPricePublic;
    }
    
    function setMintPriceWhitelist(uint256 _mintPriceWhitelist) public onlyOwner {
        mintPriceWhitelist = _mintPriceWhitelist;
    }

    function setMaxSupply(uint256 _maxSupply) public onlyOwner {
        if(totalSupply() > _maxSupply) revert TotalSupplyExceeded();
        maxSupply = _maxSupply;
    }

    function setReservedSupplyWhitelist(uint256 _reservedSupplyWhitelist) public onlyOwner {
        reservedSupplyWhitelist = _reservedSupplyWhitelist;
    }

    function setReservedSupplyPublic(uint256 _reservedSupplyPublic) public onlyOwner {
        reservedSupplyPublic = _reservedSupplyPublic;
    }

    function setMaxMintPerWalletWhitelist(uint256 _maxMintPerWalletWhitelist) public onlyOwner {
        maxMintPerWalletWhitelist = _maxMintPerWalletWhitelist;
    }

    function setMaxMintPerWalletPublic(uint256 _maxMintPerWalletPublic) public onlyOwner {
        maxMintPerWalletPublic = _maxMintPerWalletPublic;
    }

    function togglePublicMint() external onlyOwner {
        isPublicMintActive = !isPublicMintActive;
    }

    function toggleWhitelist() external onlyOwner {
        isWhitelistMintActive = !isWhitelistMintActive;
    }

    // ======= Public Mint =======
    function publicMint(uint256 _quantity) external payable callerIsUser {
        if(!isPublicMintActive) revert PublicMintNotActive();
        if(totalMintedPublic[msg.sender] + _quantity > maxMintPerWalletPublic) revert MaxPerWalletExceeded();
        if((publicMintedAmount + _quantity) > reservedSupplyPublic || (totalSupply() + _quantity) > maxSupply) revert MaxSupplyExceeded();
        if(msg.value < mintPricePublic * _quantity) revert InsufficientValue();
        totalMintedPublic[msg.sender] += _quantity;
        _safeMint(msg.sender, _quantity);
        publicMintedAmount += _quantity;
    }

    // ======= Whitelist Mint =======
    function whitelistMint(uint256 _quantity, bytes32[] memory _merkleProof) external payable callerIsUser {
        if(!isWhitelistMintActive) revert WhitelistMintNotActive();
        if(totalMintedWhitelist[msg.sender] + _quantity > maxMintPerWalletWhitelist) revert MaxPerWalletExceeded();
        if(msg.value < mintPriceWhitelist * _quantity) revert InsufficientValue();
        if((totalSupply() + _quantity) > maxSupply) revert MaxSupplyExceeded();
        if((whitelistMintedAmount + _quantity) > reservedSupplyWhitelist) revert MaxSupplyWhitelistExceeded();
        totalMintedWhitelist[msg.sender] += _quantity;
        _safeMint(msg.sender, _quantity);
        whitelistMintedAmount += _quantity;

        if(!MerkleProof.verify(_merkleProof, merkleRoot, keccak256(abi.encodePacked(msg.sender)))) revert NotWhitelisted();
    }


    function ownerMint(uint256 _quantity) external onlyOwner {
        if(totalSupply() + _quantity > maxSupply) revert MaxSupplyExceeded();
        _safeMint(msg.sender, _quantity);
    }

    // ======= Airdrop =======
    function airdrop(address[] calldata _addresses) external onlyOwner {
        if(totalSupply() + _addresses.length > maxSupply) revert MaxSupplyExceeded();
        for (uint256 i = 0; i < _addresses.length; i++) {
            _safeMint(_addresses[i], 1);
        }
    }

    // ======= Metadata =======
    string public unRevealedURI = "https://ipfs.io/ipfs/bafkreigq6zz5smslspcf4v77vtuzcakqfvyrniane6ccw6cszvb37uccji";

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenUri;
    }

    function toggleRevealedState() external onlyOwner {
        isRevealed = !isRevealed;
    }

    function setUnrevealedURI(string calldata _unRevealedURI) external onlyOwner {
        unRevealedURI = _unRevealedURI;
    }

    function setBaseURI(string calldata baseUri) external onlyOwner {
        baseTokenUri = baseUri;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId),"URI query for nonexistent token");

        if (!isRevealed) {
            return unRevealedURI;
        }        
        return bytes(baseTokenUri).length > 0 ? string(abi.encodePacked(baseTokenUri, tokenId.toString(), ".json")) : "";
    }

    // ======= Merkle Root =======
    function getMerkleRoot() external view returns (bytes32) {
        return merkleRoot;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function isValidWhiteList(bytes32[] memory merkleProof, bytes32 leaf) public view returns (bool) {
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }

    // ======= Withdraw to Owner Wallet =======
    function WithdrawFunds() external onlyOwner {
         uint256 balance = address(this).balance;
         payable(owner()).transfer(balance);
    }

    function getOnwer() public view returns (address) 
    {
        return owner();
    }

    // For compliance with opensea
    function setApprovalForAll(address operator, bool approved) public override onlyAllowedOperatorApproval(operator) {
            super.setApprovalForAll(operator, approved);
    }

    function approve(address operator, uint256 tokenId) public payable  override onlyAllowedOperatorApproval(operator) {
        super.approve(operator, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public payable  override onlyAllowedOperator(from) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public payable  override onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data)
        public
        payable 
        override
        onlyAllowedOperator(from)
    {
        super.safeTransferFrom(from, to, tokenId, data);
    }
}