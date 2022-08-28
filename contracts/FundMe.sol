// Get funds from users
// Withdraw funds
// Set a minimum funding value in USD

// SPDX-License-Identifier: MIT
// pragma
pragma solidity ^0.8.8;
// import
import "./PriceConverter.sol";
// Error Codes
error FundMe_NotOwner();

// Interface, Libraries, Contracts

/** @title A contract for crowd funding
 *  @author Mohammad Taghian
 *  @notice this contract is to demo a sample funding contract
 *  @dev this implements price feeds as our library
 */

contract FundMe {
    // Type declaration
    using PriceConverter for uint256;

    // constant - immutable : mean the vriable not changing more than 1 time.
    // and will save some gass

    // State Variables
    uint256 public constant MINIMUM_USD = 5 * 1e18;
    // 21,393 gas : constant
    // 23,493 gas : non-constant

    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFounder;

    address private immutable i_owner;

    // 21,486 gas : immutable
    // 23,622 gas : non-immutable

    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        //require(msg.sender == i_owner, "Sender is not owner!");
        if (msg.sender != i_owner) {
            revert FundMe_NotOwner();
        }
        _;
    }

    // Function Order;
    /// constructor
    /// receive
    /// fallback
    /// external
    /// public
    /// internal
    /// private
    /// view / pure

    constructor(address priceFeedAddress) {
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender;
    }

    // what happen when someone send this contract ETH without calling fund function ?
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     *  @notice this function funds this contract
     *  @dev this implements price feeds as our library
     */
    function fund() public payable {
        // we want to able to set a minimum fund amount in usd
        require(
            msg.value.getCoversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didnt send enough!"
        ); // 1e18 = 1* 10 ** 18 = 1000000000000000000
        // masg.value have 18 decimals
        s_funders.push(msg.sender);
        s_addressToAmountFounder[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        //require(msg.sender == i_owner, "Sender is not owner!");
        // for-loop
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFounder[funder] = 0;
        }

        // reset the array
        s_funders = new address[](0);

        //actually withdraw the fund

        //transfer
        //msg.sender = address
        //payable(msg.sender) = payable address
        /* payable(msg.sender).transfer(address(this).balance); */

        //send
        /* bool sendSuccess = payable(msg.sender).send(address(this).balance);
        require(sendSuccess, "Send failed"); */

        //call
        /* (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
 */
        (bool seccess, ) = i_owner.call{value: address(this).balance}("");
        require(seccess);
    }

    // View / Pure

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFinder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFounded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFounder[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    // function chaperWithdraw() public payable onlyOwner {
    //     address[] memory funders = s_funders;
    //     // mapping cat be in memory, sorry!
    //     for (
    //         uint256 funderIndex = 0;
    //         funderIndex < funders.length;
    //         funderIndex++
    //     ) {
    //         address funder = funders[funderIndex];
    //         s_addressToAmountFounder[funder] = 0;
    //     }
    //     s_funders = new address[](0);
    //     (bool seccess, ) = i_owner.call{value: address(this).balance}("");
    //     require(seccess, "Call failed");
    // }
}
