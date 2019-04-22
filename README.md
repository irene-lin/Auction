# Auction

This is an implementation of an auction contract on Ethereum. It is meant to be used for demonstrating purposes in a teaching context. It will allow multiple people to interact with the same contract and see the mechanics of a smart contract.

## Installation

Transactions will be sent through Metamask. See here for instructions to set up [Metamask](https://metamask.io/).

Sending transactions requires testnet ETH. We recommend deploying the contract on Rinkeby. You can acquire testnet ETH [here](https://faucet.rinkeby.io/).

Transactions can be seen in [Etherscan](Etherscan.io).

## Interface & Description

### Public State Variables
* address payable public **owner**: contract and auction owner
* address payable public **max_bidder**: address that placed the highest bid
* uint public **max_bid_value**: current highest bid value
* uint public **endtime**: bids can no longer be placed after this time
* mapping (address => uint) public **bids**: maps bidders to bid values

### Constructor
* The constructor is called each time a contract is deployed. It will set the state variables need for the contract and requires the following parameter:
* Parameter uint **duration_minutes**: amount of time after current time until the auction is closed
* Parameter uint **starting_bid**: Minimum biding value, defined by owner

### place_bid()
* This function, callable from every address, allows everyone to place a bid. The bid amount is attached as the message value.
* The function requires that the message value is higher than max_bid_value and that the current time is smaller than the end of the action.
* It sets the message sender as the max_bidder, the message value as the new max_bid_value and stores the sender/ amount combination in the mapping ‘bids’.
* Update endtime if the bid is placed shortly before endtime.

### withdraw()
* This function allows everyone except the current the highest bidder and the owner to withdraw the funds sent.
* These two exceptions are checked and that the address has enough funds to do this withdraw and still hold the max_bid_value.
* First update the mapping and then call the transfer function to prevent reentrancy attack.

### Owner_withdraw()
* Allows owner to withdraw funds after action is finished, as the end time is reached. 
* Checks that endtime is reached and that there is a highest bid, then transfers funds to owner. Uses the owner state variable to identify owner.

### raise()
* If you are presently the highest bidder, you can rise the bid value by however much is sent as the message value.
* Checks that message sender is current highest bidder.
* Adds message value to the mapping and updates max_bid_value.

### get_winner()
* Allows everyone to get the address of the max_bidder after the auction has ended.

## Usage

### Deploying
The open tool [Remix](https://remix.ethereum.org) can be used to demonstrate the contract. Using the environment 'Javascript VM', everything will be local and the contract is not deployed onto the real Ethereum (testnet) Blockchain.
Choosing the environment 'Injected Web3' allows deploying the contract onto the Ethereum testnet Rinkeby. This requires that an account is set up with testnet Ethereum as explained in Installation. Other users can than interact with the contract using Metamask.

### Creating contract
First, we have to create a contract. Here we specify the duration in minutes and the starting_bid value.
![Creating contract](./images/Creating_contract.PNG)

### Place bid
Everyone is able to place a bid in this contract. When a user places a new highest bid, he becomes the max_bidder, the max_bid_value is his bid and everyone can see his bid.
![Place bid](./images/place_bid.PNG | width=100)
<img src="./images/place_bid.PNG" width="200" height="400" />

### Endtime
The endtime is given in unix timestamp format:
![Endtime](./images/endtime.PNG)


## Contributing
This contract was created by the [CMU Blockchain Group](http://blockchain.cs.cmu.edu/)
