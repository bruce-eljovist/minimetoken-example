pragma solidity ^0.4.22;

import "./MiniMeTokenController.sol";
import "./Owned.sol";

contract WhiteListController is MiniMeTokenController {
    mapping(address => bool) public whiteList;

    constructor (
        address _tokenAddress
    ) public MiniMeTokenController(_tokenAddress) {
    }

    function addToWhiteList(address _target) public onlyOwner {
        whiteList[_target] = true;
    }

    function removeFromWhiteList(address _target) public onlyOwner {
        whiteList[_target] = false;
    }

    function onTransfer(address _from, address _to, uint256 _amount) public returns(bool) {
        return whiteList[_from] && whiteList[_to];
    }

    function generateTokens(address _tokenOwner, uint _amount) public onlyOwner returns (bool) {
        require(whiteList[_tokenOwner]);
        return super.generateTokens(_tokenOwner, _amount);
    }

    function destroyTokens(address _tokenOwner, uint _amount) public onlyOwner returns (bool) {
        require(whiteList[_tokenOwner]);
        return super.destroyTokens(_tokenOwner, _amount);
    }
}

