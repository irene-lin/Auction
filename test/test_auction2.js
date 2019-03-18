// const Web3 = require('web3');
// const web3 = new Web3(currentProvider);
// const toWei = eth => web3.eth.toWei(eth, 'ether');

const time = require('./time');
const increaseTime = time.increaseTime;
const takeSnapshot = time.takeSnapshot;
const revertToSnapshot = time.revertToSnapshot;
const catchRevert = require('./error').catchRevert;

const AuctionContract = artifacts.require('Auction');

let toWei =
    function(a, b) {
  return parseFloat(a) * 10000;
}

contract('Auction2', async(accounts) => {

  let auction;
  let owner;
  let bidder1;
  let bidder2;
  let expiryDuration;

  before(async() => {
    owner = accounts[0];
    bidder1 = accounts[1];
    bidder2 = accounts[2];
    const startingBid = toWei(0.1);  // Ether
    const duration = 24 * 60;        // Hours * Minutes
    expiryDuration = (duration + 10) * 60;
    auction = await AuctionContract.new(duration, startingBid);
    return;
  });

  it('places a bid', async() => {
    const snapId = await takeSnapshot();
    const bid = toWei('0.2', 'ether');
    await auction.place_bid({from: bidder1, value: bid});
    const maxBidder = await auction.max_bidder.call();
    assert.equal(bidder1, maxBidder);
    const maxBidValue = await auction.max_bid_value.call();
    assert.equal(bid, maxBidValue);
    await revertToSnapshot(snapId);
  });

  it('places a higher bid', async() => {
    const snapId = await takeSnapshot();
    await auction.place_bid({from: bidder1, value: toWei('0.2', 'ether')});
    const bid = toWei('0.3', 'ether');
    await auction.place_bid({from: bidder2, value: bid});
    const maxBidder = await auction.max_bidder.call();
    assert.equal(bidder2, maxBidder);
    const maxBidValue = await auction.max_bid_value.call();
    assert.equal(bid, maxBidValue);
    await revertToSnapshot(snapId);
  });

  it('places a low bid', async() => {
    const snapId = await takeSnapshot();
    const bid = toWei('0.3', 'ether');
    await auction.place_bid({from: bidder1, value: bid});
    const maxBidder = await auction.max_bidder.call();
    await catchRevert(
        auction.place_bid({from: bidder2, value: toWei('0.2', 'ether')}));
    assert.equal(bidder1, maxBidder);
    const maxBidValue = await auction.max_bid_value.call();
    assert.equal(bid, maxBidValue);
    await revertToSnapshot(snapId);
  });

  it('places a bid after expired', async() => {
    const snapId = await takeSnapshot();
    await increaseTime(expiryDuration);
    await catchRevert(
        auction.place_bid({from: bidder1, value: toWei('0.2', 'ether')}));
    await revertToSnapshot(snapId);
  });

  it('withdraw if not highest', async() => {
    const snapId = await takeSnapshot();
    await auction.place_bid({from: bidder1, value: toWei('0.2', 'ether')});
    await auction.place_bid({from: bidder2, value: toWei('0.3', 'ether')});
    await auction.withdraw({from: bidder1});
    await revertToSnapshot(snapId);
  });

  it('withdraw if highest', async() => {
    const snapId = await takeSnapshot();
    await auction.place_bid({from: bidder1, value: toWei('0.2', 'ether')});
    await catchRevert(auction.withdraw({from: bidder1}));
    await revertToSnapshot(snapId);
  });


  it('withdraw if no bid', async() => {
    const snapId = await takeSnapshot();
    await catchRevert(auction.withdraw({from: bidder1}));
    await revertToSnapshot(snapId);
  });

  it('raises a bid if highest', async() => {
    const snapId = await takeSnapshot();
    const bid = toWei('0.2', 'ether');
    const raise = toWei('0.1', 'ether');
    await auction.place_bid({from: bidder1, value: bid});
    await auction.raise({from: bidder1, value: raise});
    const maxBidder = await auction.max_bidder.call();
    assert.equal(bidder1, maxBidder);
    const maxBidValue = await auction.max_bid_value.call();
    assert.equal(bid + raise, maxBidValue);
    await revertToSnapshot(snapId);
  });

  it('raises a bid if highest after expiryDuration', async() => {
    const snapId = await takeSnapshot();
    await auction.place_bid({from: bidder1, value: toWei('0.2', 'ether')});
    await increaseTime(expiryDuration);
    await catchRevert(
        auction.raise({from: bidder1, value: toWei('0.3', 'ether')}));
    await revertToSnapshot(snapId);
  });

  it('raises a bid if not highest', async() => {
    const snapId = await takeSnapshot();
    await auction.place_bid({from: bidder1, value: toWei('0.2', 'ether')});
    const maxBidder1 = await auction.max_bidder.call();
    assert.equal(bidder1, maxBidder1);
    await auction.place_bid({from: bidder2, value: toWei('0.3', 'ether')});
    const maxBidder = await auction.max_bidder.call();
    assert.equal(bidder2, maxBidder);
    await catchRevert(
        auction.raise({from: bidder1, value: toWei('0.4', 'ether')}));
    await revertToSnapshot(snapId);
  });

  it('raises a bid if no bid', async() => {
    const snapId = await takeSnapshot();
    await catchRevert(
        auction.raise({from: bidder1, value: toWei('0.2', 'ether')}));
    await revertToSnapshot(snapId);
  });

  it('gets winner after expiryDuration', async() => {
    const snapId = await takeSnapshot();
    const bid = toWei('0.2', 'ether');
    await auction.place_bid({from: bidder1, value: bid});
    await increaseTime(expiryDuration);
    const winner = await auction.get_winner({from: owner});
    assert.equal(winner, bidder1);
    const maxBidder = await auction.max_bidder.call();
    assert.equal(bidder1, maxBidder);
    const maxBidValue = await auction.max_bid_value.call();
    assert.equal(bid, maxBidValue);
    await revertToSnapshot(snapId);
  });

  it('gets winner after expiryDuration multiple bidders', async() => {
    const snapId = await takeSnapshot();
    await auction.place_bid({from: bidder1, value: toWei('0.2', 'ether')});
    await auction.place_bid({from: bidder2, value: toWei('0.3', 'ether')});
    await increaseTime(expiryDuration);
    const winner = await auction.get_winner({from: owner});
    assert.equal(winner, bidder2);
    await revertToSnapshot(snapId);
  });

  it('gets winner before expiryDuration', async() => {
    const snapId = await takeSnapshot();
    await auction.place_bid({from: bidder1, value: toWei('0.2', 'ether')});
    await catchRevert(auction.get_winner({from: owner}));
    await revertToSnapshot(snapId);
  });

  it('auction', async() => {
    const snapId = await takeSnapshot();
    let maxBidder;
    let maxBidValue;
    let bid;
    let raise;

    bid = toWei('0.2', 'ether');
    await auction.place_bid({from: bidder1, value: bid});
    maxBidder = await auction.max_bidder.call();
    assert.equal(bidder1, maxBidder);
    maxBidValue = await auction.max_bid_value.call();
    assert.equal(bid, maxBidValue);

    raise = toWei('0.3', 'ether');
    await auction.raise({from: bidder1, value: raise});
    maxBidder = await auction.max_bidder.call();
    assert.equal(bidder1, maxBidder);
    maxBidValue = await auction.max_bid_value.call();
    assert.equal(bid + raise, maxBidValue);

    bid = toWei('0.7', 'ether');
    await auction.place_bid({from: bidder2, value: bid});
    maxBidder = await auction.max_bidder.call();
    assert.equal(bidder2, maxBidder);
    maxBidValue = await auction.max_bid_value.call();
    assert.equal(bid, maxBidValue);

    await auction.withdraw({from: bidder1});

    await increaseTime(expiryDuration);
    const winner = await auction.get_winner({from: owner});
    assert.equal(bidder2, winner);
    maxBidder = await auction.max_bidder.call();
    assert.equal(bidder2, maxBidder);
    maxBidValue = await auction.max_bid_value.call();
    assert.equal(bid, maxBidValue);

    await revertToSnapshot(snapId);
  });
});
