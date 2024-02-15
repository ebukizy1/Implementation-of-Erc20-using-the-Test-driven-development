// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;
import "./IErc20.sol";
contract Erc20Token is IERC20{

    string public tokenName;
    string public symbol;
    uint public decimal;
    uint private _totalSupply;
    address private owner;
    mapping(address => uint )public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;


    event Transfer(address indexed from, address indexed to, uint256 value);   
    event Approval(address indexed owner, address indexed spender, uint256 value);


    
    constructor(string memory _tokenName, string memory _symbol, uint _totalToken){
        tokenName = _tokenName;
        symbol = _symbol;
        decimal = 18;
        owner = msg.sender;
        _totalSupply = _totalToken;
        balanceOf[owner] += _totalSupply;

    }



    function totalSupply() external view returns (uint256){
        return _totalSupply;
    }

 


    function transfer(address _to, uint256 _amount) external returns (bool){
        require(_amount <= balanceOf[msg.sender], "insufficient funds");
        updateBalance(_amount, msg.sender, _to);
        
        emit Transfer(msg.sender, _to, _amount);
        return true;
        

    }

 
   

    function approve(address spender, uint256 _value) external returns (bool){
        allowance[msg.sender][spender] = _value;
        emit Approval(msg.sender, spender, _value);
        return true;
    }


    function transferFrom(address _owner, address _recipent, uint256 _numToken) external returns (bool){
           require(_numToken <= balanceOf[_owner], "Insufficient balance");
        require(_numToken <= allowance[owner][msg.sender],  "Insufficient allowance");
        updateBalance(_numToken, _owner, _recipent);         
        allowance[_owner][msg.sender] -= _numToken;
        return true;
    }

      function updateBalance(uint256 amount, address debitAccount, address creditAccount) private {
        // Calculate 10% burn amount
        uint256 burnAmount = amount * 10 / 100;
        
        // Update balances and total supply
        balanceOf[debitAccount] -= amount + burnAmount;
        balanceOf[creditAccount] += amount;
        _totalSupply -= burnAmount;
    }
}

