const RishRegister = artifacts.require("RishRegister");

contract('RishRegister', (accounts) => {
  it('test contracts names', async () => {
    const ins3Regsiter = await RishRegister.deployed();
    const names=await ins3Regsiter.contractNames();
    assert(names.length>0,"Regsiter should have some contract on deploy");
  });

  it('register',async ()=>{
    const ins3Regsiter = await RishRegister.deployed();
    const names=await ins3Regsiter.contractNames();
    const namesLength=names.length;
    const selfTag = web3.utils.toHex("SELF");
    await ins3Regsiter.registerContract(selfTag,ins3Regsiter.address);
    const newNamesLength=(await ins3Regsiter.contractNames()).length;
    assert.equal(newNamesLength,namesLength+1,"Register a contract should add an name to register");

    const addr=await ins3Regsiter.getContract(selfTag);
    assert.equal(ins3Regsiter.address,addr,"The contract is not the registered one");
  });
});
