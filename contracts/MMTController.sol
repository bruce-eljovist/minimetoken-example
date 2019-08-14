pragma solidity ^0.4.22;

import "minimetoken/contracts/MiniMeToken.sol";
import "./MiniMeTokenController.sol";
import "./MMT.sol";
import "./Owned.sol";

contract MMTController is TokenController, Owned {
    MMT public tokenContract;

    constructor (
        address _tokenAddress
    ) public {
        tokenContract = MMT(_tokenAddress);
    }

    function burnTokens(uint256 _amount) public onlyOwner returns (bool) {
        return tokenContract.burnTokens(_amount);
    }

    function generateTokens(address _tokenOwner, uint _amount) public onlyOwner returns (bool) {
        revert("generateTokens is not supported");
    }

    function destroyTokens(address _tokenOwner, uint _amount) public onlyOwner returns (bool) {
        revert("destroyTokens is not supported");
    }

    function proxyPayment(address _sender) public payable returns(bool) {
        return false;
    }

    function onTransfer(address _from, address _to, uint256 _amount) public returns(bool) {
        return true;
    }

    function onApprove(address _owner, address _spender, uint256 _amount) public returns(bool) {
        return true;
    }

}


