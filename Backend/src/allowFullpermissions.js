// //Get the right host and CFA for your network something like:

// const host = new ethers.Contract(HOST_ADDRESS, ISuperfluid.abi, wallet);

// const txData = cfaInterface.encodeFunctionData("createFlow", [
//   SUPER_TOKEN_ADDRESS,
//   RECEIVER_ADDRESS,
//   FLOW_RATE,
//   "0x",
// ]);

// const tx = await host.callAgreement(CFA_V1_ADDRESS, txData, "0x");
