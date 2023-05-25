// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../interfaces/Gelato/AutomateTaskCreator.sol";

import {ISuperfluid} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoterV2.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

// SUPERFLUID
// - Wrap ERC20 tokens -- user has erc20 tokens
// - Unwrap ERC20 tokens -- user has super tokenAddress
// - Create Stream by Operator
// - Update Stream by Operator
// - Delete Stream by Operator
// - updateOperator permissions
// - AuitorizeFullOperator
// - Revoke Full Operator

// Dollar Cost Average
// - StartDCA - to start the dcaProcess, with rate, timePeriod, token and assetToBuy
// - updateDCA - update stream and tasks
// - cancelDCA - cancel all the task associated , cancel the stream and refund any extra amount we receive
// - refundExtraTokens - refund the token rcvd extra

// Uniswap
// - swap() - takes in a token for amount and returns back the other

// Gelato
// - createTask()
// - cancelTask()
// - checker()

// Extra
// - beforeSwap() - unwraps the token before swapping and call swap
// - afterSwap() -  send the exchanged tokens to the user directly
// - cancelDCATask() - after time period is over , it will cancel the task1 and the stream

contract LCafProtocol is AutomateTaskCreator {
    using SuperTokenV1Library for ISuperToken;
    ISwapRouter public immutable swapRouter;
    IQuoterV2 public immutable quoter;
    uint24 public constant poolFee = 3000;
    uint160 sqrtPriceLimitX96 = 0;

    // ISuperToken public token;

    struct LCAfOrder {
        address creator;
        address tokenIn; // to send
        address superToken; // token streamed
        address tokenOut; // to buy
        uint256 streamRate;
        uint256 timePeriod;
        uint256 limitPrice;
        uint256 lastTradeTimeStamp;
        bool activeStatus;
        bytes32 task1Id;
        bytes32 task2Id;
    }

    uint public totallcafOrders;
    mapping(uint => LCAfOrder) public lcafOrders;

    constructor(
        address payable _automate,
        address _fundsOwner,
        address _swapRouter,
        address _quoterv2
    ) AutomateTaskCreator(_automate, _fundsOwner) {
        swapRouter = ISwapRouter(_swapRouter);
        quoter = IQuoterV2(_quoterv2);
    }

    /*///////////////////////////////////////////////////////////////
                           Extras
    //////////////////////////////////////////////////////////////*/
    function executeGelatoTask() public {}

    function executeGelatoTask1() public {}

    function beforeSwap() public {}

    function afterSwap() public {}

    function cancelDCATask() internal {}

    /*///////////////////////////////////////////////////////////////
                           Superfluid
    //////////////////////////////////////////////////////////////*/

    function wrapSuperToken() public {
        // approving
        IERC20(underlyingTokenAddress).approve(superTokenAddress, amountToWrap);
        // wrapping
        ISuperToken(superTokenAddress).upgrade(amountToWrap);
    }

    function unwrapSuperToken() public {}

    /*///////////////////////////////////////////////////////////////
                           Gelato executions
    //////////////////////////////////////////////////////////////*/

    function depositGelatoFees() external payable {
        _depositFunds(msg.value, ETH);
    }

    // address(0) for ETH
    function withdrawGealtoFees(uint256 _amount, address _token) external {
        withdrawFunds(_amount, _token);
    }

    function createTask(uint lcafOrderId) internal {
        ModuleData memory moduleData = ModuleData({
            modules: new Module[](3),
            args: new bytes[](3)
        });

        moduleData.modules[0] = Module.RESOLVER;
        moduleData.modules[1] = Module.PROXY;
        moduleData.modules[2] = Module.SINGLE_EXEC;

        // we can pass any arg we want in the encodeCall
        moduleData.args[0] = _resolverModuleArg(
            address(this),
            abi.encodeCall(this.limitChecker, (dcafOrder))
        );
        moduleData.args[1] = _proxyModuleArg();
        moduleData.args[2] = _singleExecModuleArg();

        bytes32 taskId = _createTask(
            address(this),
            abi.encode(this.executeGelatoTask.selector),
            moduleData,
            address(0)
        );

        lcafOrders[lcafOrderId].task1Id = taskId;
        /// Here we just pass the function selector we are looking to execute

        // emit limitOrderTaskCreated(orderId, taskId);
    }

    // we might need to pass extra args to create and store the TaskId
    function createTask2(uint lcafOrderId, uint timePeriod) internal {
        ModuleData memory moduleData = ModuleData({
            modules: new Module[](3),
            args: new bytes[](3)
        });

        moduleData.modules[0] = Module.TIME;
        moduleData.modules[1] = Module.PROXY;
        moduleData.modules[2] = Module.SINGLE_EXEC;

        // we can pass any arg we want in the encodeCall
        moduleData.args[0] = _timeModuleArg(block.timestamp, interval);
        moduleData.args[1] = _proxyModuleArg();
        moduleData.args[2] = _singleExecModuleArg();

        bytes32 taskId = _createTask(
            address(this),
            abi.encode(this.executeGelatoTask2, (lcafOrderId)),
            moduleData,
            address(0)
        );

        lcafOrders[lcafOrderId].task2Id = taskId;
        /// Here we just pass the function selector we are looking to execute

        // emit limitOrderTaskCreated(orderId, taskId);
    }

    function cancelTask(bytes32 taskId) public {
        /// add restrictions
        _cancelTask(taskId);
    }

    // the args will be decided on the basis of the web3 function we create and the task we add
    // @note - not ready to use , as we need to use a differnt Automate Contract for that
    function createWeb3FunctionTask(
        string memory _web3FunctionHash,
        bytes calldata _web3FunctionArgsHex
    ) internal {
        ModuleData memory moduleData = ModuleData({
            modules: new Module[](2),
            args: new bytes[](2)
        });

        moduleData.modules[0] = Module.PROXY;
        moduleData.modules[1] = Module.WEB3_FUNCTION;

        moduleData.args[0] = _proxyModuleArg();
        moduleData.args[1] = _web3FunctionModuleArg(
            _web3FunctionHash,
            _web3FunctionArgsHex
        );

        bytes32 id = _createTask(
            address(this),
            abi.encode(this.executeGelatoTask.selector),
            moduleData,
            address(0)
        );
        /// log the event with the Gelaot Task ID
        /// Here we just pass the function selector we are looking to execute
    }

    // Prepare the right payload with the proper inputs for executing the limitSwap
    function limitChecker(
        uint lcafOrderId
    ) external returns (bool canExec, bytes memory execPayload) {
        LCAfOrder memory _lcafOrder = lcafOrders[lcafOrderId];

        uint amountPrice = 1 ether;
        (uint256 amountOut, , , ) = _quoteSwapSingle(
            _limitOrder.tokenIn,
            _limitOrder.tokenOut,
            amountPrice
        );
        // amountOut is also in wei format

        // limit Price should be in wei format onlys
        canExec = (amountOut == _limitOrder.limitPrice) ? true : false;
        if (canExec) {
            execPayload = abi.encodeCall(this.executeGelatoTask, (lcafOrderId));
        } else {
            execPayload = abi.encode("Freq time did not pass");
        }
    }

    /*///////////////////////////////////////////////////////////////
                           Uniswap functions
    //////////////////////////////////////////////////////////////*/

    function _swapUniswapSingle(
        address tokenIn,
        address tokenOut,
        address recepient,
        uint256 amountIn
    ) internal returns (uint amountOut) {
        // Approve the router to spend the token
        TransferHelper.safeApprove(tokenIn, address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFee,
                recipient: recepient,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }

    function _swapUniswapMulti(
        bytes memory path,
        address recepient,
        uint256 amountIn
    ) internal returns (uint amountOut) {
        // Approve the router to spend DAI.
        // TransferHelper.safeApprove(tokenIn, address(swapRouter), amountIn);
        // path: abi.encodePacked(DAI, poolFee, USDC, poolFee, WETH9),
        ISwapRouter.ExactInputParams memory params = ISwapRouter
            .ExactInputParams({
                path: path,
                recipient: recepient,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0
            });

        // Executes the swap.
        amountOut = swapRouter.exactInput(params);
    }

    function _quoteSwapMulti(
        bytes memory path,
        uint256 amountIn
    )
        internal
        returns (
            uint256 amountOut,
            uint160[] memory sqrtPriceX96AfterList,
            uint32[] memory initializedTicksCrossedList,
            uint256 gasEstimate
        )
    {
        (
            amountOut,
            sqrtPriceX96AfterList,
            initializedTicksCrossedList,
            gasEstimate
        ) = quoter.quoteExactInput(path, amountIn);
    }

    function _quoteSwapSingle(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    )
        internal
        returns (
            uint256 amountOut,
            uint160 sqrtPriceX96After,
            uint32 initializedTicksCrossed,
            uint256 gasEstimate
        )
    {
        IQuoterV2.QuoteExactInputSingleParams memory params = IQuoterV2
            .QuoteExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                amountIn: amountIn,
                fee: poolFee,
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });

        (
            amountOut,
            sqrtPriceX96After,
            initializedTicksCrossed,
            gasEstimate
        ) = quoter.quoteExactInputSingle(params);
    }
}
