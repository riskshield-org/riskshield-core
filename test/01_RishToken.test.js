const Web3Ex=web3;
const config=require("../config/config.js")(web3);
const RishToken = require("../RishToken.js");

contract('RishToken', (accounts) => {
  const cfxReservedRISHAmount=web3.utils.toBN(config.RISH_TOKEN_SUPPLY).sub(web3.utils.toBN(config.TOTAL_RISH_AMOUNT));
  const initSupply = web3.utils.toBN(config.RISH_AMOUNT_FOR_NODE).add(cfxReservedRISHAmount).add(web3.utils.toBN(config.RISH_FOR_SWAP));

  before(async () => {
    await RishToken.init(web3.currentProvider);
  });

  it(`should put ${initSupply.toString()} RishToken in the first account`, async () => {
    const RISHTokenInstance = await RishToken.getInstance();
    assert.equal(RISHTokenInstance.address(), RISHTokenInstance.contract().address, `Get different account`);
    const balance = await RISHTokenInstance.balanceOf(accounts[0]);

    assert.equal(balance.toString(), initSupply.toString(), `${initSupply.toString()} wasn't in the first account`);
  });

  it('should send token correctly', async () => {
    const RISHTokenInstance = await RishToken.getInstance();

    // Setup 2 accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[9];

    // Get initial balances of first and second account.
    const accountOneStartingBalance = await RISHTokenInstance.balanceOf(accountOne);
    const accountTwoStartingBalance = await RISHTokenInstance.balanceOf(accountTwo);


    // Make transaction from first account to second.
    const amount = 10;
    let result = await RISHTokenInstance.transfer_GAS(accountTwo, amount, { from: accountOne });

    const accountOneEndingBalance = await RISHTokenInstance.balanceOf(accountOne);
    const accountTwoEndingBalance = await RISHTokenInstance.balanceOf(accountTwo);

    assert.equal(accountOneEndingBalance, Web3Ex.utils.toBN(accountOneStartingBalance).sub(Web3Ex.utils.toBN(amount)).toString(), "Amount wasn't correctly taken from the sender");
    assert.equal(accountTwoEndingBalance, Web3Ex.utils.toBN(accountTwoStartingBalance).add(Web3Ex.utils.toBN(amount)).toString(), "Amount wasn't correctly sent to the receiver");
        
  });

});
