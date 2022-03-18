// SPDX license identifier
 pragma solidity >=0.4.21;

import "./Token.sol";

contract JenzSwap{
    string public name = "Jenz Swap Cryptocurrency Exchange";
    Token public token;
    uint public rate = 100;

    event TokenPurchased(
        address account,
        address token,
        uint256 amount,
        uint256 rate
        );

    event TokenSold(
        address seller,
        address token,
        uint256 amount,
        uint256 rate
    );

    constructor(Token _token) {
        token = _token;
    }

    function buyTokens() public payable{

        // Calculate amount with rate
        uint amount = msg.value * rate;

        // Check if jenzswap has enough token to process this
        require(token.balanceOf(address(this)) >= amount);


        // Transfer token to buyer address
        token.transfer(msg.sender, amount);

        // Emit
        emit TokenPurchased(msg.sender, address(token), amount, rate);
    }

    function sellTokens(uint256 _value) public{
        require(token.balanceOf(msg.sender) >= _value);

        // Calculate the amount base on the rate
        uint256 etherAmount = _value / rate;

        // Check if jenzswap has amount of ether
        require(address(this).balance >= etherAmount);

       

        // Transfer token back to jenzswap
        token.transferFrom(msg.sender, address(this), _value);

         // Send ether to sender
        payable(msg.sender).transfer(etherAmount);
        
        // Emit event
        emit TokenSold(msg.sender, address(token), _value, rate);
    }
}