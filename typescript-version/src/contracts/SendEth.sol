// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract SendEth {
    error CallFailed();

    event Log(uint amount, uint gas);

    // receive方法，接收eth时被触发
    receive() external payable {
        emit Log(msg.value, gasleft());
    }

    // call()发送ETH
    function sendEth(address payable _to, uint256 amount) external payable {
        // 处理下call的返回值，如果失败，revert交易并发送error
        (bool success, ) = _to.call{value: amount}("");
        if (!success) {
            revert CallFailed();
        }
    }

    // 返回合约ETH余额
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
