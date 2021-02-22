const ConStakingPool = artifacts.require("StakingPool");
const RishController = require("../RishController.js");

contract('StakingPool', (accounts) => {
    let stakingAmountLimit = web3.utils.toWei("500000","ether"); //500000 USDT
    let in3Ctrl;
    before(async ()=>{
        await RishController.init(web3.currentProvider);
        in3Ctrl = await RishController.getInstance();
    });

    it('init', async () => {
        const productToken = await in3Ctrl.getProduct(0);
        const stakingPool = await ConStakingPool.at(await productToken.contract().stakingPool());
        assert.equal((await stakingPool.stakingAmountLimit()).toString(), stakingAmountLimit.toString());
        assert.equal((await stakingPool.totalStakingAmount()).toNumber(), 0);
        assert(!(await stakingPool._isClosed()));
        assert.equal((await stakingPool.remainingStakingAmount()).toString(), stakingAmountLimit.toString());
    });
  });
  