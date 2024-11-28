// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

// 创建 ERC-20 代币合约，包含发币和铸币功能
contract MyMint {
    string public name = "MyMint";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    uint256 private _totalSupply;
    address public owner;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    // 只有合约所有者可以铸币
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(uint256 initialSupply) {
        owner = msg.sender; // 部署者为合约所有者
        _mint(msg.sender, initialSupply); // 初始分发代币给合约部署者
    }

    // 查询总供应量
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    // 查询账户余额
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    // 转账代币
    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    // 查询允许 spender 转账的代币数
    function allowance(
        address tokenOwner,
        address spender
    ) external view returns (uint256) {
        return _allowances[tokenOwner][spender];
    }

    // 授权 spender 可以从 msg.sender 账户中转移一定数量的代币
    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    // 从 sender 转移代币到 recipient，必须有足够的 allowance
    // function transferFrom(
    //     address sender,
    //     address recipient,
    //     uint256 amount
    // ) external returns (bool) {
    //     _transfer(sender, recipient, amount);
    //     _approve(sender, msg.sender, _allowances[sender][msg.sender] - amount);
    //     return true;
    // }
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public returns (bool) {
        uint256 currentAllowance = _allowances[sender][msg.sender]; // 检查授权额度
        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        ); // 如果授权额度不足，抛出错误
        _transfer(sender, recipient, amount); // 调用内部转账函数
        _approve(sender, msg.sender, currentAllowance - amount); // 更新授权额度
        return true;
    }

    // 铸造新代币，只能由合约所有者调用
    function mint(uint256 amount) external onlyOwner {
        _mint(msg.sender, amount);
    }

    // 销毁新代币
    function burn() external onlyOwner {
        _balances[msg.sender] = 0;
    }

    // 私有函数：转移代币
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(
            _balances[sender] >= amount,
            "ERC20: transfer amount exceeds balance"
        );

        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    // 私有函数：铸造新代币
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount); // 铸币的 Transfer 事件，from 为 address(0)
    }

    // 私有函数：授权 spender 可以转移 tokenOwner 的代币
    function _approve(
        address tokenOwner,
        address spender,
        uint256 amount
    ) internal {
        require(
            tokenOwner != address(0),
            "ERC20: approve from the zero address"
        );
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[tokenOwner][spender] = amount;
        emit Approval(tokenOwner, spender, amount);
    }
}
