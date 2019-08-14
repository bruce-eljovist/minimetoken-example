pragma solidity ^0.4.22;

import "minimetoken/contracts/MiniMeToken.sol";
import "./Owned.sol";

contract MiniMeTokenController is TokenController, Owned {
    MiniMeToken public tokenContract;

    bool public proxyPaymentEnabled = true;
    bool public transferEnabled = true;
    bool public approveEnabled = true;

    // function MiniMeTokenController(
    //     address _tokenAddress
    // ) public {
    //     tokenContract = MiniMeToken(_tokenAddress);
    // }

    constructor(address _tokenAddress) public {
        tokenContract = MiniMeToken(_tokenAddress);
    }


    function () external payable {
    }

    function changePolicy(bool _proxyPaymentEnabled, bool _transferEnabled, bool _approveEnabled) public onlyOwner {
        proxyPaymentEnabled = _proxyPaymentEnabled;
        transferEnabled = _transferEnabled;
        approveEnabled = _approveEnabled;
    }

    function proxyPayment(address _sender) public payable returns(bool) {
        return proxyPaymentEnabled;
    }

    function onTransfer(address _from, address _to, uint256 _amount) public returns(bool) {
        return transferEnabled;
    }

    function onApprove(address _owner, address _spender, uint256 _amount) public returns(bool) {
        return approveEnabled;
    }

    function changeController(address _newController) public onlyOwner {
        tokenContract.changeController(_newController);
    }

    function enableTransfers(bool _transfersEnabled) public onlyOwner {
        tokenContract.enableTransfers(_transfersEnabled);
    }

    function generateTokens(address _tokenOwner, uint _amount) public onlyOwner returns (bool) {
        return tokenContract.generateTokens(_tokenOwner, _amount);
    }

    function destroyTokens(address _tokenOwner, uint _amount) public onlyOwner returns (bool) {
        return tokenContract.destroyTokens(_tokenOwner, _amount);
    }

    function claimTokens(address _token, address _account) public onlyOwner {
        tokenContract.claimTokens(_token);

        if (_token == address(0)) {
            _account.transfer(address(this).balance);
            return;
        }

        MiniMeToken token = MiniMeToken(_token);
        uint256 balance = token.balanceOf(address(this));
        token.transfer(_account, balance);
    }
}



