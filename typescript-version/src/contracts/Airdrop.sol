// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop {
    // 批量转 ERC20 代币
    function multiTransferToken(
        address _token,
        address[] calldata _addresses,
        uint256[] calldata _amounts
    ) external {
        require(_addresses.length == _amounts.length, "Length mismatch");
        IERC20 token = IERC20(_token);

        for (uint256 i = 0; i < _addresses.length; i++) {
            require(
                token.transferFrom(msg.sender, _addresses[i], _amounts[i]),
                "Transfer failed"
            );
        }
    }

    // 批量转 ETH
    function multiTransferETH(
        address[] calldata _addresses,
        uint256[] calldata _amounts
    ) external payable {
        require(_addresses.length == _amounts.length, "Length mismatch");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }
        require(msg.value >= totalAmount, "Insufficient ETH sent");

        for (uint256 i = 0; i < _addresses.length; i++) {
            (bool success, ) = _addresses[i].call{value: _amounts[i]}("");
            require(success, "ETH transfer failed");
        }
    }

    // 获取合约的 ETH 余额
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // 获取代币余额
    function getTokenBalance(address _token) public view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    receive() external payable {}
}
