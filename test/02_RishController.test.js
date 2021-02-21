
const RishController = require("../RishController.js");
const StakingPoolToken = require("../StakingPoolToken.js");
const config=require("../config/config.js")(web3);
const moment = require('moment');

contract('RishController', (accounts) => {
  let iniProductSz = 0;
  let controller;
  let products;
  let cs;
  
  before(async ()=>{
    await RishController.init(web3.currentProvider);
    await StakingPoolToken.init(web3.currentProvider);
    controller = await RishController.getInstance();
  });

  it('productSize',async()=>{
    iniProductSz = await controller.productSize();
    assert(iniProductSz>1);
    console.log("INFO: product count = ", iniProductSz);
  });

  it('products',async()=>{    
    products = await controller.allProductTokens();
    assert.equal(iniProductSz, products.length);

    // test getActiveCovers
    const covers = await controller.getActiveCovers();
    console.log("INFO: init currentCovers:", covers);
    assert.equal(covers.length, products.length);

    // test remainPrincipal
    const remainPrincipal = await controller.getAllRemainingPrincipal();
    console.log('INFO: total remainPrincipal=', remainPrincipal);
    assert.equal(remainPrincipal, '0');

    const firstProduct = await controller.getProduct(0);
    assert.equal(firstProduct.address(), products[0].address());

    // move to productToken.test...
    assert(await firstProduct.isValid());
    const info = await firstProduct.getDetailInfo();
    console.log("INFO: first product info:", info);
    assert(info.symbol.length>0);
    assert.notEqual(info.price, "0");
    assert.notEqual(info.paid, "0");

    // test MCRcapacity
    const capacity = await controller.getProdRemaining(firstProduct);
    console.log('INFO: capacity of firstProduct=', capacity);
    assert.equal(capacity, '0');
  });

  it('oracleMachine',async()=>{
    const count = await controller.oracleMachineSize();
    const tokens = await controller.allOracleMachines();

    console.log("INFO: oracleMachine count: ",count);
    assert.equal(count, tokens.length);
    assert(tokens.length>0);
  });


  it('summary',async()=>{
    const summary = await controller.querySummary();
    console.log("INFO: summary: ", summary);
    assert(summary);
  });

  it("category",async()=>{
    cs = await controller.getCategories();
    console.log("INFO: category: ", cs);
    assert(cs.length>=1);
  });

  it('add token', async () => {
   let now = moment();
    now.add(90,'days');
    let expireTimestamp = parseInt(now.valueOf()/1000);
    let stakingPoolToken = await StakingPoolToken.getInstance();
    let p = await RishController.deployProductToken(stakingPoolToken,"demo","","DEFI 20210330","DEFI210330",
    config.PRODUCT_TOKEN_PAID,config.STAKING_AMOUNT_LIMIT,config.MIN_STAKING_AMOUNT,config.CAPACITY_LIMIT_PERCENT,
    expireTimestamp,{from:accounts[0]});
    console.log("New Product Token's staking pool address:", (await p.stakingPool()));

    const newProductSize = await controller.productSize();
    assert.equal(iniProductSz+1, newProductSize,"The new product calling should increases the product size");
    const csNew = await controller.getCategories();
    console.log("Categories:", csNew);
    assert.equal(csNew.length, cs.length+1);
  });

  it("findProductTokenByStakingPool",async()=>{
    const addresses = products.map( p => {
      return p.stakingPool().address();
    });
    console.log("INFO: staking pool addresses: ", addresses);
    const ps1 = await controller.findProductTokenByStakingPool(addresses[1]);
    assert.equal(ps1.stakingPool().address(), addresses[1]);
    
    const nullObj = await controller.findProductTokenByStakingPool("");
    assert.equal(nullObj, null);
  });
  // after(async ()=>{
  // });
  
});
