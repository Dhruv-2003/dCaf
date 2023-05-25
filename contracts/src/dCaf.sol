// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./interfaces/Gelato/AutomateTaskCreator.sol";

contract dCafProtocol is AutomateTaskCreator {
    constructor(
        address payable _automate,
        address _fundsOwner
    ) AutomateTaskCreator(_automate, _fundsOwner) {}

    /*///////////////////////////////////////////////////////////////
                           Gelato executions
    //////////////////////////////////////////////////////////////*/

    function depositForFees() external payable {
        _depositFunds(msg.value, ETH);
    }

    // we might need to pass extra args to create and store the TaskId
    function createTask(uint orderId) internal {
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
            abi.encodeCall(this.checker, (orderId))
        );
        moduleData.args[1] = _proxyModuleArg();
        moduleData.args[2] = _singleExecModuleArg();

        bytes32 taskId = _createTask(
            address(this),
            abi.encode(this.executeGelatoTask.selector),
            moduleData,
            address(0)
        );

        limitOrders[orderId].taskId = taskId;
        /// Here we just pass the function selector we are looking to execute

        emit limitOrderTaskCreated(orderId, taskId);
    }

    // the args will be decided on the basis of the web3 function we create and the task we add
    // @note - not ready to use , as we need to use a differnt Automate Contract for that
    function createFunctionTask(
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
    function checker(
        uint orderId
    ) external returns (bool canExec, bytes memory execPayload) {
        LimitOrder memory _limitOrder = limitOrders[orderId];
        uint amountPrice = 1 ether;

        /// fetching the price for 1
        (uint256 amountOut, , , ) = _quoteSwapSingle(
            _limitOrder.tokenIn,
            _limitOrder.tokenOut,
            amountPrice
        );

        canExec = (amountOut == _limitOrder.limitPrice) ? true : false;
        if (canExec) {
            execPayload = abi.encodeCall(this.executeGelatoTask, (orderId));
        } else {
            execPayload = abi.encode("Price Not matched");
        }
    }
}