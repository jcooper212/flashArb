//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.6;

import "hardhat/console.sol";
import "./libraries/UniswapV2Library.sol";
import "./libraries/SafeERC20.sol";
import "./interfaces/IUniswapV2Router01.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IERC20.sol";


contract PancakeFlashSwap {
    using SafeERC20 for IERC20;

    // Factory and Routing Addresses
    address private constant PANCAKE_FACTORY =
        0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;
    address private constant PANCAKE_ROUTER =
        0x10ED43C718714eb63d5aA57B78B54704E256024E;

    // Token Addresses
    address private constant WBNB = 0xa184088a740c695E156F91f5cC086a06bb78b827; //0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address private constant BUSD = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;
    address private constant CAKE = 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82;
    address private constant CROX = 0x2c094F5A7D1146BB93850f629501eB749f6Ed491;

    // Trade Variables
    uint256 private deadline = block.timestamp + 1 days;
    uint256 private constant MAX_INT =
        115792089237316195423570985008687907853269984665640564039457584007913129639935;

    //transfer  amount of _token into PancakeFlashSwap contract
    function fundFlashSwapContract(address _owner, address _token, uint256 _amount) public {
        IERC20(_token).transferFrom(_owner, address(this), _amount);
    }

    //getbalance
    function getBalanceOfToken(address _address) public view returns (uint256){
        return IERC20(_address).balanceOf(address(this));
    }

    //place a trade
    function placeTrade(
        address _fromToken,
        address _toToken,
        uint256 _amountIn) private returns (uint256){
                    address pair = IUniswapV2Factory(PANCAKE_FACTORY).getPair(
            _fromToken,
            _toToken
        );
        require(pair != address(0), "Pool does not exist");

        // Calculate Amount Out
        address[] memory path = new address[](2);
        path[0] = _fromToken;
        path[1] = _toToken;

        uint256 amountRequired = IUniswapV2Router01(PANCAKE_ROUTER)
            .getAmountsOut(_amountIn, path)[1];

        console.log("amountRequired", amountRequired);

        // Perform Arbitrage - Swap for another token
        uint256 amountReceived = IUniswapV2Router01(PANCAKE_ROUTER)
            .swapExactTokensForTokens(
                _amountIn, // amountIn
                amountRequired, // amountOutMin
                path, // path
                address(this), // address to
                deadline // deadline
            )[1];

        console.log("amountRecieved", amountReceived);

        require(amountReceived > 0, "Aborted Tx: Trade returned zero");

        return amountReceived;
    }

    // CHECK PROFITABILITY
    // Checks whether > output > input
    function checkProfitability(uint256 _input, uint256 _output) private returns (bool)
    {
        return _output > _input;
    }

    //initiate arbitrage
    function startArbitrage(address _tokenBorrow, uint256 _amount) external {
             IERC20(BUSD).safeApprove(address(PANCAKE_ROUTER), MAX_INT);
        IERC20(WBNB).safeApprove(address(PANCAKE_ROUTER), MAX_INT);
        IERC20(CAKE).safeApprove(address(PANCAKE_ROUTER), MAX_INT);

        // Get the Factory Pair address for combined tokens
        address pair = IUniswapV2Factory(PANCAKE_FACTORY).getPair(
            _tokenBorrow,
            WBNB
        );

        // Return error if combination does not exist
        require(pair != address(0), "Pool does not exist");

        // Figure out which token (0 or 1) has the amount and assign
        address token0 = IUniswapV2Pair(pair).token0();
        address token1 = IUniswapV2Pair(pair).token1();
        uint256 amount0Out = _tokenBorrow == token0 ? _amount : 0;
        uint256 amount1Out = _tokenBorrow == token1 ? _amount : 0;

        // Passing data as bytes so that the 'swap' function knows it is a flashloan
        bytes memory data = abi.encode(_tokenBorrow, _amount, msg.sender);

        console.log('pre-swap address / bal /sc bal',
            msg.sender, IERC20(_tokenBorrow).balanceOf(msg.sender),
            IERC20(_tokenBorrow).balanceOf(address(this)));
        console.log('call swap ',amount0Out, amount1Out);
        // Execute the initial swap to get the loan
        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data);
        
        console.log('post-swap address / bal /sc bal',
            msg.sender, IERC20(_tokenBorrow).balanceOf(msg.sender),
            IERC20(_tokenBorrow).balanceOf(address(this)));
    }

    function pancakeCall(address _sender, uint256 _amount0, uint256 _amount1, bytes calldata _data) external
    {
        // Ensure this request came from the contract
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();
        address pair = IUniswapV2Factory(PANCAKE_FACTORY).getPair(
            token0,
            token1
        );
        require(msg.sender == pair, "The sender needs to match the pair");
        require(_sender == address(this), "Sender should match this contract");

        // Decode data for calculating the repayment
        (address tokenBorrow, uint256 amount, address myAddress) = abi.decode(
            _data,
            (address, uint256, address)
        );
        console.log('address / bal /sc bal',
            myAddress, IERC20(tokenBorrow).balanceOf(myAddress),
            IERC20(tokenBorrow).balanceOf(address(this)));
        // Calculate the amount to repay at the end
        uint256 fee = ((amount * 3) / 997) + 1;
        uint256 amountToRepay = amount + fee;
        console.log('amount fee repay ', amount, fee, amountToRepay);

        // DO ARBITRAGE

        // Assign loan amount
        uint256 loanAmount = _amount0 > 0 ? _amount0 : _amount1;

        // Place Trades
                console.log('loan amount ',loanAmount);
        uint256 trade1AcquiredCoin = placeTrade(BUSD, WBNB, loanAmount);
                console.log('trade1 Acq / sc bal now1 ', trade1AcquiredCoin, IERC20(tokenBorrow).balanceOf(address(this)));
        uint256 trade2AcquiredCoin = placeTrade(WBNB, CAKE, trade1AcquiredCoin);
                console.log('trad2 Acq / sc bal now2 ', trade2AcquiredCoin, IERC20(tokenBorrow).balanceOf(address(this)));
        uint256 trade3AcquiredCoin = placeTrade(CAKE, BUSD, trade2AcquiredCoin);
                console.log('trad3 Acq / sc bal now3 ', trade3AcquiredCoin, IERC20(tokenBorrow).balanceOf(address(this)));


        // // Check Profitability
        bool profCheck = checkProfitability(amountToRepay, trade3AcquiredCoin);
        //require(profCheck, "Arbitrage not profitable");
        console.log('profchk amtRepay netPosition ', profCheck, amountToRepay, trade3AcquiredCoin);

        // // Pay Myself
        if (profCheck){
            IERC20 otherToken = IERC20(BUSD);
            otherToken.transfer(myAddress, trade3AcquiredCoin - amountToRepay);
        }

        // Pay Loan Back
        IERC20(tokenBorrow).transfer(pair, amountToRepay);
    }

}
