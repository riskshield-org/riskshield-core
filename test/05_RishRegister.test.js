const RishRegister = artifacts.require("RishRegister");

contract('RishRegister', (accounts) => {
  it('test contracts names', async () => {
    const rishRegsiter = await RishRegister.deployed();
    const names=await rishRegsiter.contractNames();
    assert(names.length>0,"Regsiter should have some contract on deploy");
  });

  it('register',async ()=>{
    const rishRegsiter = await RishRegister.deployed();
    const names=await rishRegsiter.contractNames();
    const namesLength=names.length;
    const selfTag = web3.utils.toHex("SELF");
    await rishRegsiter.registerContract(selfTag,rishRegsiter.address);
    const newNamesLength=(await rishRegsiter.contractNames()).length;
    assert.equal(newNamesLength,namesLength+1,"Register a contract should add an name to register");

    const addr=await rishRegsiter.getContract(selfTag);
    assert.equal(rishRegsiter.address,addr,"The contract is not the registered one");
  });
});
