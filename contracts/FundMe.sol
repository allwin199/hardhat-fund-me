//Get funds from users
//withdraw funds
//set a minimum value in usd

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error FundMe__NotOwner();

contract FundMe {

    using PriceConverter for uint256;

    // state variables
    address private immutable i_owner; //i_ defines immutable
    AggregatorV3Interface private s_priceFeed;
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    //tracking people who are sending money to this contract
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded; //s_ defines as storage variable
    // starting the variable with s_ or i_ define gas spent

    constructor(address priceFeedAddress) { 
        i_owner = msg.sender;
        // whomever is deploying the contract will be taken as the owner.
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    // only owner is allowed to call withdraw fn, modifier makes it happen
    function withdraw() public onlyOwner{

        //Remove funds from mapping
        for(uint256 funderIndex = 0; funderIndex < s_funders.length; funderIndex++){
            //everytime we are going to storage in blockchain and reading from funder to get the length
            //which is costly gas operation.
           address funder = s_funders[funderIndex];
            // again reading funders address from the blockchain, costly operation 
           s_addressToAmountFunded[funder] = 0;
        }

        //Resetting the array.
        s_funders = new address[](0);

        //call
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call Failed");
    }

    function cheaperWithdraw() public payable onlyOwner{
        //Here instead of reading everytime from the storage, 
        // we will read one time from the storage and store the values in memory and we will read from the memory, memory is cheaper
        // mapping is not allowed in memory, so we have to use storage
        address[] memory funders = s_funders; 
        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        //Resetting the array.
        s_funders = new address[](0);

        //call
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call Failed");
    }

    modifier onlyOwner {
        if(msg.sender != i_owner)
            revert FundMe__NotOwner();
        
        // if the above line passes, underneath will work, that's why _ is mentioned. 
        _;
    }

    //what happens if someone send eth without calling fund fn
    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

    //getOwner
    function getOwner() public view returns(address){
        return i_owner;
    }

    // getFunders
    function getFunder(uint256 index) public view returns(address){
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns(uint256){
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns(AggregatorV3Interface){
        return s_priceFeed;
    }

}