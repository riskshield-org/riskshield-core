const ConPriceMetaInfoDB = artifacts.require("PriceMetaInfoDB");
const ConRishRegister = artifacts.require("RishRegister");
const ConStakingPool = artifacts.require("StakingPool");
const RISHToken = require("../RISHToken.js");
const RishController = require("../RishController.js");
const StakingPoolToken = require("../StakingPoolToken.js");

const utils = require("../lib/utils.js")(web3);
const config=require("../config/config.js")(web3);

const networkConfig = require("../config/blockchain/testNetworkConfig.js");
const Envir = require("../mocha_test/common/envir.js");
const {newSingleProduct} = require("../mocha_test/common/product.js");
const moment = require('moment');


contract('RishProductToken', (accounts) => {
    let oracleNodePublicKey;
    let oracleNodePrivateKey;
    let superAccount = accounts[0];
    let stakerAccount1 = accounts[1];
    let stakerAccount2 = accounts[2];
    let stakerAccount3 = accounts[3];
    let buyerAccount = accounts[4];
    let buyerAccount2 = accounts[5];
    let buyerAccount3 = accounts[7];
    let productToken1;
    let productToken2;
    let productToken3;
    let productToken4;
    let stakingPool1;
    let stakingPool2;
    let stakingPool3;
    let stakingPool4;
    let stakingPoolToken;
    let tokenId3;

    let poolToken;
    let rishCtrl;

    let staking4TokenId;

        let accountInfo = web3.eth.accounts.create();
        oracleNodePublicKey = accountInfo.address;
        oracleNodePrivateKey = accountInfo.privateKey;
        
        oracleNodePublicKey = config.PRICE_NODE_PUBLIC_KEY;
        oracleNodePrivateKey = config.PRICE_NODE_PRIVATE_KEY;



    before(async ()=>{
        ConPriceMetaInfoDB.setProvider(web3.currentProvider);
        await RISHToken.init(web3.currentProvider);
        await RishController.init(web3.currentProvider);
        await StakingPoolToken.init(web3.currentProvider);
        let priceMetaInfoDB = await ConPriceMetaInfoDB.deployed();

        await priceMetaInfoDB.setPriceNodePublicKey(oracleNodePublicKey,{from:superAccount});
        register = await ConRishRegister.deployed();
        await Envir.init(networkConfig);
        const endTime = moment().add(3, 'month').format("YYYYMMDD HH:mm:ss");
        await newSingleProduct("TESTA 20220331", "TA220331", endTime, "Exchange", "ExchA", true);
        await newSingleProduct("TESTB 20220331", "TB220331", endTime, "Exchange", "ExchB", true);

        rishCtrl = await RishController.getInstance();
        productToken1 = await rishCtrl.getProduct(1);
        stakingPool1 = await ConStakingPool.at(await productToken1.contract().stakingPool());
        //console.log("stakingPool1:",stakingPool1.)
        productToken2 = await rishCtrl.getProduct(2);
        stakingPool2 = await ConStakingPool.at(await productToken2.contract().stakingPool());

        productToken3 = await rishCtrl.getProduct(3);
        stakingPool3 = await ConStakingPool.at(await productToken3.contract().stakingPool());

        productToken4 = await rishCtrl.getProduct(4);
        stakingPool4 = await ConStakingPool.at(await productToken4.contract().stakingPool());

        poolToken = await StakingPoolToken.getInstance();
        stakingPoolToken = poolToken.contract();



    });

    it('test RishProductToken', async () => {
        assert.equal(await productToken1.category(), "Exchange");
        assert((await productToken1.name()).length>0);
        assert((await productToken1.symbol()).length>0);
        assert(await productToken1.isValid());
        assert.equal((await productToken1.paid()).toString(), config.PRODUCT_TOKEN_PAID.toString());
    });


    it('stakingPool',async()=>{
        const poolAddr=productToken1.stakingPool().address();
        assert(poolToken.isPoolAddress(poolAddr));
    });

    it('staking & buy', async () => {
        assert.equal(await productToken1.remaining(), "0");
        assert.equal(await productToken1.totalSellQuantity(), "0");
        assert.equal((await productToken1.totalPremiums()).toString(), "0");

        let stakingRemaining1 = (await stakingPool1.stakingAmountLimit()).sub(await stakingPool1.totalStakingAmount());
        //---staking
        let stakingAmount = web3.utils.toWei("100","ether");
        await poolToken.stake_GAS([{poolAddress:stakingPool1.address,amount:stakingAmount},{poolAddress:stakingPool2.address,amount:stakingAmount}],config.METAINFO.TOKEN.USDT.SYMBOL,stakingAmount,{from:stakerAccount1});
        await poolToken.stake_GAS([{poolAddress:stakingPool1.address,amount:stakingAmount},{poolAddress:stakingPool2.address,amount:stakingAmount}],config.METAINFO.TOKEN.USDT.SYMBOL,stakingAmount,{from:stakerAccount2});
        tokenId3 = await poolToken.stake_GAS([{poolAddress:stakingPool3.address,amount:stakingAmount}],config.METAINFO.TOKEN.USDT.SYMBOL,stakingAmount,{from:stakerAccount3});
        assert.equal((await stakingPoolToken.balanceOf(stakerAccount1)).toNumber(), 1);
        assert.equal((await stakingPoolToken.balanceOf(stakerAccount2)).toNumber(), 1);

        // left pricipal should equal total stacking
        let principal = await rishCtrl.getAllRemainingPrincipal();
        console.log('total principal=', principal.toString(), principal);
        assert.equal(principal.toString(), web3.utils.toWei("300","ether").toString());

        assert.equal((await stakingPool1.remainingStakingAmount()).toString(), stakingRemaining1.sub(web3.utils.toBN(stakingAmount).mul(web3.utils.toBN(2))).toString());
        assert.equal((await stakingPool1.totalStakingAmount()).toString(), web3.utils.toWei("200","ether").toString());
        assert.equal((await stakingPool1.payAmount()).toNumber(),0);
        assert(!(await stakingPool1._isClosed()));


        //---buy
        let price = await productToken1.price();

        const remaining=await productToken1.remaining();
        const remaining2=await rishCtrl.getProdRemaining(productToken1);

        assert.equal(remaining,  remaining2);

        let pay = price.mul(web3.utils.toBN(10));

        const signData = utils.signPriceData(oracleNodePublicKey,oracleNodePrivateKey,price,30*60);
        const res=await productToken1.buyEx_GAS(config.METAINFO.TOKEN.USDT.SYMBOL,oracleNodePublicKey,10,price,signData,{from:buyerAccount});

        assert.equal(await productToken1.remaining(), remaining-10);

        assert.equal(await productToken1.totalSellQuantity(), 10);
        assert.equal((await productToken1.totalPremiums()).toString(), pay.toString());
        assert.equal(await productToken1.balanceOf(buyerAccount), "10");


    });


    it('withdraw before close', async () => {
        //---withdraw before close
        const pow12=web3.utils.toBN(10).pow(web3.utils.toBN(12));
        let price3 = web3.utils.toBN(await productToken3.price());
        let pay3 = price3.mul(web3.utils.toBN(10)).div(pow12).mul(pow12);

        const signData3=utils.signPriceData(oracleNodePublicKey,oracleNodePrivateKey,price3,30*60);
        await productToken3.buyEx_GAS(config.METAINFO.TOKEN.USDT.SYMBOL,oracleNodePublicKey,10,price3,signData3,{from:buyerAccount2});

        assert.equal(await productToken3.balanceOf(buyerAccount2), "10");
        assert.equal(await productToken3.totalSellQuantity(), "10");
        assert.equal((await productToken3.totalPremiums()).toString(), pay3.toString());
        await productToken3.withdrawEx_GAS(oracleNodePublicKey,10,price3,signData3, {from:buyerAccount2});
        assert.equal(await productToken3.balanceOf(buyerAccount2), "0");
        assert.equal(await productToken3.totalSellQuantity(), "0");
        let returnAmount = pay3.mul(web3.utils.toBN(70)).div(web3.utils.toBN(100));
        assert.equal((await productToken3.totalPremiums()).toString(), pay3.sub(returnAmount).toString());


        let totalPaidAmount = await productToken3.totalPaidAmount();
        let idLength = await stakingPool3.tokenHolderIdLength();
        let payAmountFromStaking = await stakingPool3.calcPayAmountFromStaking(totalPaidAmount, 0, idLength.sub(web3.utils.toBN(1)));
        await stakingPool3.close(true,payAmountFromStaking,{ from: superAccount });
        let rewards = await poolToken.calcPremiumsRewards(tokenId3);
        console.log("INFO: after close and approvePaid, rewards: ", rewards);
        assert.equal(rewards.toString(), "0"); 

    })

    it('withdraw after close', async () => {
        let stakingAmount = web3.utils.toWei("10","ether");

        staking4TokenId = await poolToken.stake_GAS([{poolAddress:stakingPool4.address,amount:stakingAmount}],config.METAINFO.TOKEN.USDT.SYMBOL,stakingAmount,{from:stakerAccount3});

        const pow12=web3.utils.toBN(10).pow(web3.utils.toBN(12));
        let price = web3.utils.toBN(await productToken4.price());

        const remain=await productToken4.remaining();
        console.log({remain});

        const buyCount=10;

        let pay = price.mul(web3.utils.toBN(buyCount)).div(pow12).mul(pow12);
        console.log({price},{pay});
        const signData=await utils.signPriceData(oracleNodePublicKey,oracleNodePrivateKey,price,30*60);
        await productToken4.buyEx_GAS(config.METAINFO.TOKEN.USDT.SYMBOL,oracleNodePublicKey,buyCount,price,signData,{from:buyerAccount3});

        const remainNew = await productToken4.remaining();
        console.log({remainNew});
        assert.equal(remain,remainNew+buyCount);

        assert.equal(await productToken4.balanceOf(buyerAccount3), `${buyCount}`);
        assert.equal(await productToken4.totalSellQuantity(), `${buyCount}`);
        assert.equal((await productToken4.totalPremiums()).toString(), pay.toString());

        let permiumsRewards=await poolToken.calcPremiumsRewards(staking4TokenId);
        assert.equal(permiumsRewards.toString(),"0");

        await stakingPool4.close(false,0,{ from: superAccount });


        permiumsRewards=await poolToken.calcPremiumsRewards(staking4TokenId);
        console.log("permiumsRewards",permiumsRewards);
        assert(permiumsRewards.gt(web3.utils.toBN(0)));
        assert.equal(permiumsRewards.toString(),(pay.mul(web3.utils.toBN(70)).div(web3.utils.toBN(100))).toString());

        await poolToken.harvestTokenPremiumsRewards_GAS(staking4TokenId,{from:stakerAccount3});

        assert(await poolToken.canUnstake(staking4TokenId));
        await poolToken.unstake_GAS(staking4TokenId,{from:stakerAccount3});

        assert.equal(await productToken4.balanceOf(buyerAccount3), `${buyCount}`);
        assert.equal(await productToken4.totalSellQuantity(), `${buyCount}`);
        assert.equal((await productToken4.totalPremiums()).toString(), pay.toString());



    })


});
