// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../interfaces/Gelato/AutomateTaskCreator.sol";

import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
// import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISuperfluid, ISuperToken, ISuperApp} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

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

contract dCafProtocol is AutomateTaskCreator {
    using SuperTokenV1Library for ISuperToken;
    ISwapRouter public immutable swapRouter;

    address public owner;

    mapping(address => bool) public accountList;

    constructor(address _owner) {
        owner = _owner;
    }

    // ISuperToken public token;

    struct DCAfOrder {
        address creator;
        address tokenIn; // to send
        address superToken; // token streamed
        address tokenOut; // to buy
        uint256 streamRate;
        uint256 timePeriod;
        uint256 dcfaFreq;
        uint256 lastTradeTimeStamp;
        bool activeStatus;
        bytes32 task1Id;
        bytes32 task2Id;
    }

    uint public totaldcafOrders;
    mapping(uint => DCAfOrder) public dcafOrders;

    constructor(
        address payable _automate,
        address _fundsOwner,
        address _swapRouter
    ) AutomateTaskCreator(_automate, _fundsOwner) {
        swapRouter = ISwapRouter(_swapRouter);
    }

    /*///////////////////////////////////////////////////////////////
                           Extras
    //////////////////////////////////////////////////////////////*/

    function exectueGelatoTask2() public {}

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

    function unwrapSuperToken() public {
        // unwrapping
        ISuperToken(superTokenAddress).downgrade(amountToUnwrap);
    }

    function createStream(
        ISuperToken token,
        address receiver,
        int96 flowRate
    ) external {
        if (!accountList[msg.sender] && msg.sender != owner)
            revert Unauthorized();

        token.createFlow(receiver, flowRate);
    }

    function updateFlowFromContract(
        ISuperToken token,
        address receiver,
        int96 flowRate
    ) external {
        if (!accountList[msg.sender] && msg.sender != owner)
            revert Unauthorized();

        token.updateFlow(receiver, flowRate);
    }

    function deleteFlowFromContract(
        ISuperToken token,
        address receiver
    ) external {
        if (!accountList[msg.sender] && msg.sender != owner)
            revert Unauthorized();

        token.deleteFlow(address(this), receiver);
    }

    function updatePermissions(
        ISuperToken token,
        address flowOperator,
        bool allowCreate,
        bool allowUpdate,
        bool allowDelete,
        int96 flowRateAllowance
    ) external {
        if (!accountList[msg.sender] && msg.sender != owner)
            revert Unauthorized();
        token.setFlowPermissions(
            token,
            flowOperator,
            allowCreate,
            allowUpdate,
            allowDelete,
            flowRateAllowance
        );
    }

    function fullAuthorization(
        ISuperToken token,
        address flowOperator
    ) external {
        if (!accountList[msg.sender] && msg.sender != owner)
            revert Unauthorized();
        token.setFlowPermissions(token, flowOperator);
    }

    function revokeAuthorization(
        ISuperToken token,
        address flowOperator
    ) external {
        if (!accountList[msg.sender] && msg.sender != owner)
            revert Unauthorized();
        token.revokeFlowPermissions(token, flowOperator);
    }

    // updating stream permissions

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

    function createTask1(uint dcafOrderId, uint frequency) internal {
        ModuleData memory moduleData = ModuleData({
            modules: new Module[](2),
            args: new bytes[](2)
        });

        moduleData.modules[0] = Module.TIME;
        moduleData.modules[1] = Module.PROXY;
        // moduleData.modules[2] = Module.SINGLE_EXEC;

        // we can pass any arg we want in the encodeCall
        moduleData.args[0] = _timeModuleArg(block.timestamp, interval);
        moduleData.args[1] = _proxyModuleArg();
        // moduleData.args[2] = _singleExecModuleArg();

        bytes32 taskId = _createTask(
            address(this),
            abi.encode(this.executeGelatoTask1, (dcafOrderId)),
            moduleData,
            address(0)
        );

        dcafOrders[dcafOrderId].task2Id = taskId;
        /// Here we just pass the function selector we are looking to execute

        // emit limitOrderTaskCreated(orderId, taskId);
    }

    // we might need to pass extra args to create and store the TaskId
    function createTask2(uint dcafOrderId, uint timePeriod) internal {
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
            abi.encode(this.executeGelatoTask2, (dcafOrderId)),
            moduleData,
            address(0)
        );

        dcafOrders[dcafOrderId].task2Id = taskId;
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
}
