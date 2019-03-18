const AuctionContract = artifacts.require('Auction');
var duration_minutes = 3;
var starting_bid = 3;

contract('Auction', (accounts) => {

    // increases time
    async function increaseTime(seconds) {
        return new Promise((resolve, reject) => {
            return ethRPC.sendAsync({
                method: 'evm_increaseTime',
                params: [seconds]
            }, (err) => {
                if (err) reject(err)
                resolve()
            })
        }) .then(() => {
            return new Promise((resolve, reject) => {
                return ethRPC.sendAsync({
                    method: 'evm_mine',
                    params: []
                }, (err) => {
                    if (err) reject(err)
                    resolve()
                })
            })
        })
    }

    async function tryCatch(promise, message) {
     try {
       await promise;
       throw null;
     } catch (error) {
       assert(error, "Expected an error but did not get one");
     }
    }

    //test placing first bid
    it("Place bid", async() => {
        let bid = starting_bid + 1;
        let auction = await AuctionContract.deployed();
        await auction.place_bid({from: accounts[1], value: bid});
        //check max bidder address
        let max_bidder = await auction.max_bidder.call();
        assert.equal(max_bidder, accounts[1], "Incorrect max bidder address");
        //check max bid value
        let max_bid_value = await auction.max_bid_value.call();
        assert.equal(max_bid_value, bid, "Incorrect max bid value");
    });

    //test placing an equal bid
    it("Place bid", async() => {
        let auction = await AuctionContract.deployed();
        let bid = await auction.max_bid_value.call();;
        try {
            await auction.place_bid({from: accounts[2], value: bid});
        }
        catch (error) {
           assert(error, "Expected an error but did not get one");
        }
        //check max bidder address
        let max_bidder = await auction.max_bidder.call();
        assert.equal(max_bidder, accounts[1], "Max bidder addr should not have changed");
    });

    //test withdraw
    it("Place bid", async() => {
        let auction = await AuctionContract.deployed();
        
    });

    //test withdraw with max bidder


});
