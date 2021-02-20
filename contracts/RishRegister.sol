//SPDX-License-Identifier: WTFPL
pragma solidity >=0.6.0 <0.7.0;

import "./RishPausable.sol";

contract RishRegister is RishPausable 
{
    mapping(bytes8=>address) _contracts;

    bytes8 [] _allContractNames;
    uint256 public count;
    constructor(address ownable) RishPausable() public{
        setOwnable(ownable);
    }

    function contractNames() view public returns( bytes8[] memory){
        bytes8 [] memory names=new bytes8[](count);
        uint256 j=0;
        for (uint256 i=0;i<_allContractNames.length;++i){
            bytes8 name=_allContractNames[i];
            if (_contracts[name]!=address(0)){
                names[j]=name;
                j+=1;  
            }
        }
        return names;
    }

    function registerContract(bytes8 name, address contractAddr) onlyOwner public{
        require(_contracts[name]==address(0),"This name contract already exists"); 
        _contracts[name]=contractAddr;
        _allContractNames.push(name);
        count +=1;
    }

    function unregisterContract(bytes8 name) onlyOwner public {
        require(_contracts[name]!=address(0),"This name contract not exists"); 
        delete _contracts[name];
        count -=1;
    }

    function hasContract(bytes8 name) view public returns(bool){
        return _contracts[name]!=address(0);
    }

    function getContract(bytes8 name) view public returns(address){
        return _contracts[name];
    }


}