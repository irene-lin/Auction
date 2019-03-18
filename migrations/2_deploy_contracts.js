var Auction = artifacts.require("Auction");

var duration_minutes = 3;
var starting_bid = 3;
module.exports = function(deployer) {
  deployer.deploy(Auction, duration_minutes, starting_bid);
};
