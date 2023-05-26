// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../interfaces/Gelato/AutomateTaskCreator.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
// import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";
import {ISuperfluid, ISuperToken, ISuperApp} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
// import {ISETH} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/tokens/ISETH.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

// Tasks
// Receiving stream
// Track a user's portfolio
// unwrap and Swap
// pay for Gelato's task - so all the task will be created from this
contract dcaWallet is Ownable, AutomateTaskCreator {
    using SuperTokenV1Library for ISuperToken;
    ISwapRouter public immutable swapRouter;

    address public dcafManager;
    uint public dcafOrderId;
    struct DCAfOrder {
        address creator;
        address wallet;
        address tokenIn; // to send
        address superToken; // token streamed
        address tokenOut; // to buy
        int96 flowRate;
        uint256 timePeriod;
        uint256 dcafFreq;
        uint256 lastTradeTimeStamp;
        uint256 creationTimeStamp;
        bool activeStatus;
        bytes32 task1Id;
        bytes32 task2Id;
    }
    DCAfOrder public dcafOrder;

    constructor(
        address payable _automate,
        address _fundsOwner,
        address _swapRouter,
        address _manager,
        uint _dcafOrderId,
        DCAfOrder _order
    ) AutomateTaskCreator(_automate, _fundsOwner) {
        swapRouter = ISwapRouter(_swapRouter);
        dcafManager = _manager;
        dcafOrderId = _dcafOrderId;
    }

    modifier onlyManager() {
        require(msg.sender == dcafManager, "NOT AUTHORISED");
        _;
    }

    /*///////////////////////////////////////////////////////////////
                           Extras
    //////////////////////////////////////////////////////////////*/

    function executeGelatoTask1(uint dcafOrderId) public {
        DCAfOrder memory _dcafOrder = dcafOrders[dcafOrderId];
        require(_dcafOrder.activeStatus, "Not Active");
        require(
            block.timestamp >
                _dcafOrder.lastTradeTimeStamp + _dcafOrder.dcafFreq,
            "Freq time not passed"
        );

        // exectue beforeSwap
    }

    function beforeSwap(address superToken) public {
        // unwrap the token
        uint amountToUnWrap = ISuperToken(superToken).balanceOf(address(this));
        unwrapSuperToken(superToken, amountToUnwrap);

        address underlyingToken = ISuperToken(superToken).getUnderlyingToken();
        require(underlyingToken == dcafOrder.tokenIn, "INVALID TOKEN");

        // swap
        _swapUniswapSingle(
            dcafOrder.tokenIn,
            dcafOrder.tokenOut,
            dcafOrder.creator,
            amountToUnWrap
        );
    }

    function afterSwap() public {}

    /*///////////////////////////////////////////////////////////////
                           Superfluid
    //////////////////////////////////////////////////////////////*/

    function wrapSuperToken(
        address token,
        address superTokenAddress,
        uint amountToWrap
    ) internal {
        // approving to transfer tokens from this to superTokenAddress
        IERC20(underlyingTokenAddress).approve(superTokenAddress, amountToWrap);

        // wrapping and sent to this contract
        ISuperToken(superTokenAddress).upgrade(amountToWrap);
    }

    function unwrapSuperToken(
        address superTokenAddress,
        uint amountToUnwrap
    ) internal {
        // unwrapping
        ISuperToken(superTokenAddress).downgrade(amountToUnwrap);
    }

    // refund the underlying superTokens in case the stream is cancelled
    function refundSuperToken(address superToken) onlyManager {
        require(!dcafOrder.activeStatus, "STILL ACTIVE");
        uint amount = ISuperToken(superToken).balanceOf(address(this));

        ISuperToken(superToken).transfer(dcafOrder.creator, amount);
    }

    /*///////////////////////////////////////////////////////////////
                           Gelato
    //////////////////////////////////////////////////////////////*/

    function depositGelatoFees() external payable {
        _depositFunds(msg.value, ETH);
    }

    // address(0) for ETH
    function withdrawGealtoFees(uint256 _amount, address _token) external {
        withdrawFunds(_amount, _token);
    }

    function createTask1(
        uint frequency
    ) external onlyManager returns (bytes32 taskId) {
        ModuleData memory moduleData = ModuleData({
            modules: new Module[](2),
            args: new bytes[](2)
        });

        moduleData.modules[0] = Module.TIME;
        moduleData.modules[1] = Module.PROXY;
        // moduleData.modules[2] = Module.SINGLE_EXEC;

        // we can pass any arg we want in the encodeCall
        moduleData.args[0] = _timeModuleArg(block.timestamp, frequency);
        moduleData.args[1] = _proxyModuleArg();
        // moduleData.args[2] = _singleExecModuleArg();

        taskId = _createTask(
            address(this),
            abi.encode(this.executeGelatoTask1),
            moduleData,
            address(0)
        );

        dcafOrder.task1Id = taskId;
        /// Here we just pass the function selector we are looking to execute
        // emit limitOrderTaskCreated(orderId, taskId);
    }

    // we might need to pass extra args to create and store the TaskId
    // called in the manager
    function createTask2(
        uint dcafOrderId,
        uint timePeriod
    ) external onlyManager returns (bytes32 taskId) {
        ModuleData memory moduleData = ModuleData({
            modules: new Module[](3),
            args: new bytes[](3)
        });

        moduleData.modules[0] = Module.TIME;
        moduleData.modules[1] = Module.PROXY;
        moduleData.modules[2] = Module.SINGLE_EXEC;

        // we can pass any arg we want in the encodeCall
        moduleData.args[0] = _timeModuleArg(block.timestamp, timePeriod);
        moduleData.args[1] = _proxyModuleArg();
        moduleData.args[2] = _singleExecModuleArg();

        taskId = _createTask(
            dcafManager,
            abi.encode(this.executeGelatoTask2, (dcafOrderId)),
            moduleData,
            address(0)
        );

        dcafOrder.task2Id = taskId;
        /// Here we just pass the function selector we are looking to execute

        // emit limitOrderTaskCreated(orderId, taskId);
    }

    function cancelTask(bytes32 taskId) onlyManager {
        /// add restrictions
        _cancelTask(taskId);

        dcafOrder.activeStatus = false;
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

        // then afterSwap() has to be called
    }
}