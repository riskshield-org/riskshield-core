//SPDX-License-Identifier: WTFPL
pragma solidity >=0.6.0 <0.7.0;


interface IRishProductToken{
    function totalSellQuantity() external view returns(uint256);
    function paid() external view returns(uint256);
    function expireTimestamp() external view returns(uint256);
    function closureTimestamp() external view returns(uint256);
    function totalPremiums() external view returns(uint256);
    function needPay() external view returns(bool);
    function isValid() external view returns(bool);
    function balanceOf(address account) external view returns (uint256);
    function burn(address account, uint256 amount) external;
    function calcDistributePremiums() external view returns(uint256,uint256);
    function approvePaid() external;
    function rejectPaid() external;
}


interface IStakingPool 
{
    function putTokenHolder(uint256 tokenId,uint256 amount,uint256 timestamp) external;
    function calcPremiumsRewards(uint256 stakingAmount, uint256 timestamp) external view returns(uint256);
    function isClosed() external view returns(bool);
    function isNormalClosed() external view returns(bool);

    function totalStakingAmount() external view returns(uint256); 

    function totalNeedPayFromStaking() external view returns(uint256); 

    function totalRealPayFromStaking() external view returns(uint256) ; 

    function payAmount() external view returns(uint256); 

    function productTokenRemainingAmount() external view returns(uint256);
    function productTokenExpireTimestamp() external view returns(uint256);
    function calculateCapacity() external view returns(uint256);
    function takeTokenHolder(uint256 tokenId) external;
    function productToken() external view returns(IRishProductToken);
    function queryAndCheckClaimAmount(address userAccount) view external returns(uint256,uint256/*token balance*/);
}
