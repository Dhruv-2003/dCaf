// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../interfaces/Gelato/AutomateTaskCreator.sol";

contract GelatoDemo is AutomateTaskCreator {
    bytes32 public task1Id;
    bytes32 public task2Id;

    event task1Exectued(uint timestamp, address sender);
    event task2Executed(uint dcafOrderId, uint timestamp, address sender);

    // intialise
    constructor(
        address payable _automate,
        address _fundsOwner
    ) AutomateTaskCreator(_automate, _fundsOwner) {}

    function executeGelatoTask1() public {
        emit task1Exectued(block.timestamp, msg.sender);
    }

    function executeGelatoTask2(uint dcafOrderId) public {
        emit task2Executed(dcafOrderId, block.timestamp, msg.sender);
    }

    function depositGelatoFees() external payable {
        _depositFunds(msg.value, ETH);
    }

    // address(0) for ETH
    function withdrawGealtoFees(uint256 _amount, address _token) external {
        withdrawFunds(_amount, _token);
    }

    function createTask1(
        uint frequency
    ) external  returns (bytes32 taskId) {
        ModuleData memory moduleData = ModuleData({
            modules: new Module[](2),
            args: new bytes[](2)
        });

        moduleData.modules[0] = Module.TIME;
        moduleData.modules[1] = Module.PROXY;
        // moduleData.modules[2] = Module.SINGLE_EXEC;

        // we can pass any arg we want in the encodeCall
        moduleData.args[0] = _timeModuleArg(
            block.timestamp + frequency,
            frequency
        );
        moduleData.args[1] = _proxyModuleArg();
        // moduleData.args[2] = _singleExecModuleArg();

        taskId = _createTask(
            address(this),
            abi.encode(this.executeGelatoTask1.selector),
            moduleData,
            address(0)
        );

        task1Id = taskId;
        /// Here we just pass the function selector we are looking to execute
        // emit limitOrderTaskCreated(orderId, taskId);
    }

    function createTask2(
        uint _dcafOrderId,
        uint timePeriod
    ) external  returns (bytes32 taskId) {
        ModuleData memory moduleData = ModuleData({
            modules: new Module[](3),
            args: new bytes[](3)
        });

        moduleData.modules[0] = Module.TIME;
        moduleData.modules[1] = Module.PROXY;
        moduleData.modules[2] = Module.SINGLE_EXEC;

        // we can pass any arg we want in the encodeCall
        moduleData.args[0] = _timeModuleArg(
            block.timestamp + timePeriod,
            timePeriod
        );
        moduleData.args[1] = _proxyModuleArg();
        moduleData.args[2] = _singleExecModuleArg();

        taskId = _createTask(
            address(this),
            abi.encode(this.executeGelatoTask2.selector, _dcafOrderId),
            moduleData,
            address(0)
        );

        task2Id = taskId;
        /// Here we just pass the function selector we are looking to execute

        // emit limitOrderTaskCreated(orderId, taskId);
    }

    function cancelTask(bytes32 taskId) public {
        /// add restrictions
        _cancelTask(taskId);
    }
}
