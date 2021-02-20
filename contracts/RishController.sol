//SPDX-License-Identifier: WTFPL
pragma solidity >=0.6.0 <0.7.0;

import "./@openzeppelin/math/SafeMath.sol";
import "./RishPausable.sol";

contract RishController is RishPausable 
{
	using SafeMath for uint256;
	mapping(uint256 => address) private _indexProductMap;
	mapping(uint256 => address) private _indexOracleVoteTokenMap;
	uint256 _nextProductIndex;
	uint256 _nextOracleVoteTokenIndex;
	event NewProductAdded(address productTokenAddress);
	event NewOracleVoteTokenAdded(address oracleVoteTokenAddress);

	constructor(address ownable) RishPausable() public {
		setOwnable(ownable);
	}

	function addProduct(address productTokenAddress) public onlyOwner returns(bool){
		_indexProductMap[_nextProductIndex] = productTokenAddress;
		_nextProductIndex = _nextProductIndex.add(1);
		emit NewProductAdded(productTokenAddress);
		return true;
	}

	function getProduct(uint256 index) public view returns(address) {
		require(index < productSize(),"index should < productSize");
		address tokenAddress = _indexProductMap[index];
		return tokenAddress;
	}
	
	function productSize() public view returns(uint256) {
		return _nextProductIndex;
	}

	function addOracleVoteToken(address tokenAddress) public onlyOwner returns(bool){
		_indexOracleVoteTokenMap[_nextOracleVoteTokenIndex] = tokenAddress;
		_nextOracleVoteTokenIndex = _nextOracleVoteTokenIndex.add(1);
		emit NewOracleVoteTokenAdded(tokenAddress);
		return true;
	}

	function getOracleMachine(uint256 index) public view returns(address) {
		require(index < oracleMachineSize(),"index should < oracleMachineSize");
		address tokenAddress = _indexOracleVoteTokenMap[index];
		return tokenAddress;
	}
	
	function oracleMachineSize() public view returns(uint256) {
		return _nextOracleVoteTokenIndex;
	}
}
