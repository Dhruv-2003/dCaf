// initializing the CFA Library
pragma solidity ^0.8.14;

import { 
    ISuperfluid 
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import { 
    ISuperToken 
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";

import {
    SuperTokenV1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

contract SomeContractWithSuperTokenV1Library {

    using SuperTokenV1Library for ISuperToken;
    ISuperToken public token;
    
    constructor(ISuperToken _token) {
        token = _token;
    }
    
    // You make the calls directly on the `token`
    token.createFlow(address receiver, int96 flowRate)
    token.updateFlow(address receiver, int96 flowRate);
    token.deleteFlow(address sender, address receiver);

    // Get the flow data between `sender` and `receiver` of `token`
token.getFlowInfo(
    address sender,
    address receiver
) external view returns (
    uint256 timestamp,     // when the stream was started
    int96 flowRate,        // wei/second flow rate between sender and receiver
    uint256 deposit,       // security buffer held during the lifetime of the flow
    uint256 owedDeposit    // Extra deposit amount borrowed to a SuperApp receiver by the flow sender
);

token.getFlowRate(
    address sender,
    address receiver
) external view returns (
    int96 flowRate        // wei/second flow rate between sender and receiver
);


// Get the net flow rate of the account, accounting for all inbound/outbound streams
token.getNetFlowRate(
    address account
) external view returns (
    int96 flowRate         // net flow rate
);


// Same function call just with additional parameter for user data
// token.createFlow(address receiver, int96 flowRate, bytes memory userData);
// token.updateFlow(address receiver, int96 flowRate, bytes memory userData);
// token.deleteFlow(address sender, address receiver, bytes memory userData);
    
}