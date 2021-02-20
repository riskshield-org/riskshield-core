//SPDX-License-Identifier: WTFPL
pragma solidity >=0.6.0 <0.7.0;

import "./RishRegister.sol";
import "./RishPausable.sol";

abstract contract IUpgradable is RishPausable{

    RishRegister public register;
    address public registerAddress;


    function  updateDependentContractAddress() public virtual;  

    function updateRegisterAddress(address registerAddr) external {
        if (address(register) != address(0)) {
            require(register.isOwner(_msgSender()), "Just the register's owner can call the updateRegisterAddress()"); 
        }
        register = RishRegister(registerAddr);
        setOwnable(registerAddr);
        registerAddress=registerAddr;
        updateDependentContractAddress();
    }

}
