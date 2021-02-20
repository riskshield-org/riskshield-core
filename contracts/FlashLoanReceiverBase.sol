//SPDX-License-Identifier: WTFPL
pragma solidity >=0.6.0 <0.7.0;
import "./IFlashLoanReceiver.sol";


abstract contract FlashLoanReceiverBase is IFlashLoanReceiver {
  address public stakingPoolTokenAddress;

  constructor(address _stakingPoolTokenAddress) public {
    stakingPoolTokenAddress = _stakingPoolTokenAddress;
  }
}