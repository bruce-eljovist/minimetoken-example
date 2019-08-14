pragma solidity ^0.4.22;

import "minimetoken/contracts/MiniMeToken.sol";

/*
MMT token is example implemention of MiniMe token.
It does not allow generate or destroy any user's token even by super user.
*/
contract MMT is MiniMeToken {
    uint256 constant MINT_AMOUNT = (10**3) * (10**18);

    constructor (
        address _tokenFactory,
        address initialOwner

    ) public MiniMeToken(
        _tokenFactory,
        address(0),             // no parent token
        0,                      // new token
        "MiniMeToken Example",   // Token name
        18,                     // Decimals
        "MMT",                  // Symbol
        true                    // Enable transfers
    ) {
        // only initial minting is possible. More mintings are not allowed.
        require(super.generateTokens(initialOwner, MINT_AMOUNT), "initial minting failed");
    }

    function burnTokens(uint256 _amount
    ) public onlyController returns (bool) {
        return super.destroyTokens(address(controller), _amount);
    }

    function generateTokens(address _owner, uint256 _amount
    ) public onlyController returns (bool) {
        revert("generateTokens is not supported");
    }

    function destroyTokens(address _owner, uint256 _amount
    ) public onlyController returns (bool) {
        revert("destroyTokens is not supported");
    }
}


