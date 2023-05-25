// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../interfaces/Gelato/AutomateTaskCreator.sol";

import {ISuperfluid} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
        address _fundsOwner
    ) AutomateTaskCreator(_automate, _fundsOwner) {}

    /*///////////////////////////////////////////////////////////////
                           Extras
    //////////////////////////////////////////////////////////////*/
    function executeGelatoTask() public {}

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

    function createTask(uint dcafOrderId) internal {
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

        dcafOrders[dcafOrderId].task1Id = taskId;
        /// Here we just pass the function selector we are looking to execute

        // emit limitOrderTaskCreated(orderId, taskId);
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

    // Prepare the right payload with the proper inputs for executing the limitSwap
    function limitChecker(
        uint dcafOrderId
    ) external returns (bool canExec, bytes memory execPayload) {
        DCAfOrder memory _dcafOrder = dcafOrders[dcafOrderId];

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
            execPayload = abi.encodeCall(
                this.executeGelatoTask1,
                (dcafOrderId)
            );
        } else {
            execPayload = abi.encode("Freq time did not pass");
        }
    }
}
