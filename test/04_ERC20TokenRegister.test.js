const IBEP20 = artifacts.require("IBEP20");

const ERC20TokenRegister = require("../ERC20TokenRegister.js");
const config=require("../config/config.js")(web3);

contract('ERC20TokenRegister', (accounts) => {
    let usdt;
    let tokenRegister;
    before(async ()=>{
        await ERC20TokenRegister.init(web3.currentProvider);
        tokenRegister = await ERC20TokenRegister.getInstance();
        const usdtAddress = await tokenRegister.getToken(config.METAINFO.TOKEN.USDT.SYMBOL);
        assert(usdtAddress);

        usdt = await IBEP20.at(usdtAddress);
    });

    it('init', async () => {
        const tokenAddresses=await tokenRegister.getAllTokens();
        assert(tokenAddresses.length>=2);

        let contractNames = await tokenRegister.contractNames();
        assert.equal(contractNames.length, tokenAddresses.length);
        console.debug({contractNames});

        for (var i = 0; i < contractNames.length; ++i) {
            let token = await tokenRegister.getToken(contractNames[i]);
            assert(tokenAddresses.indexOf(token) >= 0)
        }
    });

    it('balance',async ()=>{
        const results = await tokenRegister.getAllTokenBalances(accounts[0]);
        //console.log(results);
        assert(results.balance.gt(0));

        let calcSum = _.reduce(results.tokens, (sum, obj, coinName) => {
            assert(results.tokens[coinName].balance.toString())
            return web3.utils.toBN(sum).add(obj.balance)
        }, 0);
        assert.equal(results.balanceStr, calcSum.toString())
    });

    it('getTransferAmount',async ()=>{
        const value=web3.utils.toWei("200","ether");
        const results = await tokenRegister.getTransferAmount(accounts[0],value,"");
        //console.log(results);
        assert(results[config.METAINFO.TOKEN.USDT.SYMBOL].amountStr,web3.utils.toWei("100","ether").toString());
        assert(results[config.METAINFO.TOKEN.DAI.SYMBOL].amountStr,web3.utils.toWei("100","ether").toString());

        const value1=web3.utils.toWei("200","ether");
        const results1 = await tokenRegister.getTransferAmount(accounts[1],value1,config.METAINFO.TOKEN.USDT.SYMBOL);
        assert(results1[config.METAINFO.TOKEN.USDT.SYMBOL].amountStr,web3.utils.toWei("200","ether").toString());
        assert.equal(_.size(results1),1);
        
        const balanceResult=await tokenRegister.getAllTokenBalances(accounts[4]);
        //console.log(balanceResult);
        const usdtBalanceStr=(balanceResult).tokens[config.METAINFO.TOKEN.USDT.SYMBOL].balanceStr;
        const usdtBal=parseFloat(web3.utils.fromWei(usdtBalanceStr,"ether"));
        //console.log(usdtBal);

        const value2=web3.utils.toWei((usdtBal+100).toString(),"ether");
        //console.log(value2);
        const results2 = await tokenRegister.getTransferAmount(accounts[4],value2,config.METAINFO.TOKEN.USDT.SYMBOL);
        //console.log(results2);
        assert(results2[config.METAINFO.TOKEN.USDT.SYMBOL].amountStr,web3.utils.toWei(usdtBalanceStr,"ether").toString());
        assert(results2[config.METAINFO.TOKEN.DAI.SYMBOL].amountStr,web3.utils.toWei("100","ether").toString());

    });
    

});