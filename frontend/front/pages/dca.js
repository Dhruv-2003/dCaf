import React, { useState, useEffect } from "react";
import { Select } from "@chakra-ui/react";
import matic from "../public/polygon-token.svg";
import eth from "../public/ethereum.svg";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import Image from "next/image";
import {
  cfav1forwarder_ABI,
  dcafProtocol_ABI,
  dcafWallet_ABI,
  wmatic_ABI,
  wmaticx_ABI,
} from "../constants/abi";
import {
  CFAV1Forwarder_Address,
  WETH_Address,
  WMATIC_Address,
  WMATICx_Address,
  dcafProtocol_Address,
} from "../constants/contracts";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { getContract } from "wagmi/actions";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { parseEther } from "viem";

const Dca = () => {
  const [maticValue, setMaticValue] = useState();
  const [amountToUpgrade, setAmountToUpgrade] = useState();
  const [flowRateUnit, setFlowRateUnit] = useState();
  const [timePeriodInput, setTimePeriodInput] = useState("");
  const [tokens, setTokens] = useState(false);
  const [selectIn, setSelectIn] = useState("Select a Token");
  const [selectInLogo, setSelectInLogo] = useState("");
  const [dropIn, setDropIn] = useState(false);
  const [selectOut, setSelectOut] = useState("Select a Token");
  const [selectOutLogo, setSelectOutLogo] = useState("");
  const [dropOut, setDropOut] = useState(false);
  const [frequency, setFrequency] = useState({
    day: "",
    hr: "",
    min: "",
    sec : "",
  });
  const [approved, setApproved] = useState(false);

  const getFrequency = () => {
    const freq = frequency.day*86400 + frequency.hr*3600 + frequency.min*60 + frequency.sec*1
    console.log(frequency)
  }
  const [superTokenAdd, setSuperTokenAdd] = useState();
  const [tokenOut, setTokenOut] = useState();
  const [tokenIn, setTokenIn] = useState();
  const [flowRate, setFlowRate] = useState(); // converted into wei/sec
  const [totalTimePeriod, setTotalTimePeriod] = useState(); // converted into secs from start to end
  const [dcaFreq, setDcaFreq] = useState(); // converted into secs from hours and days
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const dcafProtocolContract = getContract({
    address: dcafProtocol_Address,
    abi: dcafProtocol_ABI,
    publicClient,
    walletClient,
  });

  const dcaf_contract = {
    address: dcafProtocol_Address,
    abi: dcafProtocol_ABI,
  };

  const handleFlowRate = (_flowRate) => {
    console.log(_flowRate);
    if (!_flowRate) return;
    if (flowRateUnit == "sec") {
      setFlowRate(parseEther(`${_flowRate}`));
    } else if (flowRateUnit == "min") {
      setFlowRate(parseEther(`${_flowRate / 60}`));
    } else if (flowRateUnit == "hour") {
      setFlowRate(parseEther(`${_flowRate / (60 * 60)}`));
    } else if (flowRateUnit == "days") {
      setFlowRate(parseEther(`${_flowRate / (60 * 60 * 24)}`));
    } else if (flowRateUnit == "months") {
      setFlowRate(parseEther(`${_flowRate / (60 * 60 * 24 * 30)}`));
    } else {
      console.log("Invalid Unit");
    }
  };

  useEffect(() => {
    if (flowRate) {
      console.log(flowRate);
    }
  }, [flowRate]);

  const inToken = (token, logo) => {
    setSelectIn(token);
    setSelectInLogo(logo);
    setDropIn(false);
    setTokenIn(WMATIC_Address);
    setSuperTokenAdd(WMATICx_Address);
  };
  const OutToken = (token, logo) => {
    setSelectOut(token);
    setSelectOutLogo(logo);
    setDropOut(false);
    setTokenOut(WETH_Address);
  };

  const getUnixTime = () => {
    const datetime = new Date(timePeriodInput);
    const year = datetime.getFullYear();
    const month = datetime.getMonth() + 1;
    const day = datetime.getDate();
    const hr = datetime.getHours();
    const min = datetime.getMinutes();
    const sec = datetime.getSeconds();
    const time = toUnixTime(year, month, day, hr, min, sec);
    console.log(time);
    setTimePeriodInput(time);
  };
  const toUnixTime = (year, month, day, hr, min, sec) => {
    const date = new Date(Date.UTC(year, month - 1, day, hr, min, sec));
    return Math.floor(date.getTime() / 1000);
  };
  const wrapMatic = async () => {
    try {
      if (!maticValue) {
        console.log("Enter the matic value");
        return;
      }

      const { request } = await publicClient.simulateContract({
        address: WMATIC_Address,
        abi: wmatic_ABI,
        functionName: "deposit",
        account: address,
        value: parseEther(maticValue),
      });
      const tx = await walletClient.writeContract(request);
      console.log(tx);
    } catch (error) {
      console.log(error);
      window.alert(error);
    }
  };

  const approveTokenUse = async () => {
    try {
      if (!amountToUpgrade) {
        console.log("WMATIC amount to upgrade is missing");
        return;
      }

      const { request } = await publicClient.simulateContract({
        address: WMATIC_Address,
        abi: wmatic_ABI,
        functionName: "approve",
        account: address,
        args: [WMATICx_Address, parseEther(amountToUpgrade)],
      });
      const tx = await walletClient.writeContract(request);
      console.log(tx);
    } catch (error) {
      console.log(error);
      window.alert(error);
    }
  };

  const upgrade = async () => {
    try {
      if (!amountToUpgrade) {
        console.log("Enter the amount to upgrade");
        return;
      }

      const approvedAmount = await publicClient.readContract({
        address: WMATIC_Address,
        abi: wmatic_ABI,
        functionName: "allowance",
        args: [address, WMATICx_Address],
      });
      console.log(approvedAmount);

      if (approvedAmount >= `${parseEther(amountToUpgrade)}n`) {
        console.log("Please approve the token usage first");
        return;
      }

      // const config = {
      //   hostAddress: "0xEB796bdb90fFA0f28255275e16936D25d3418603",
      //   cfaV1Address: "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873",
      //   idaV1Address: "0x804348D4960a61f2d5F9ce9103027A3E849E09b8",
      // };

      // const wmaticx = await SuperToken.create({
      //   address: WMATICx_Address,
      //   config,
      //   networkName: "maticmumbai", // you can also pass in chainId instead (e.g. chainId: 137)
      //   provider: publicClient,
      // });

      const { request } = await publicClient.simulateContract({
        address: WMATICx_Address,
        abi: wmaticx_ABI,
        functionName: "upgrade",
        account: address,
        args: [parseEther(amountToUpgrade)],
      });
      console.log("Upgrading the asset");
      const tx = await walletClient.writeContract(request);
      console.log(tx);
    } catch (error) {
      console.log(error);
      window.alert(error);
    }
  };

  const approveOperator = async () => {
    try {
      if (!flowRate) {
        console.log("Enter Flow rate to be allowed");
        return;
      }
      const { request } = await publicClient.simulateContract({
        address: CFAV1Forwarder_Address,
        abi: cfav1forwarder_ABI,
        functionName: "grantPermissions",
        account: address,
        args: [WMATICx_Address, dcafProtocol_Address],
      });
      console.log("Upgrading the asset");
      const tx = await walletClient.writeContract(request);
      console.log(tx);
    } catch (error) {
      console.log(error);
      window.alert(error);
    }
  };

  const createDCAOrder = async () => {
    try {
      if (!flowRate && !totalTimePeriod && !dcaFreq) {
        return;
        console.log("Check your inputs");
        window.alert("Check inputs");
      }
      const { request } = await publicClient.simulateContract({
        ...dcaf_contract,
        functionName: "createDCA",
        args: [superTokenAdd, tokenOut, flowRate, totalTimePeriod, dcaFreq],
        account: address,
      });
      const tx = await walletClient.writeContract(request);
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full">
      <div className="flex justify-center items-center mx-auto ">
        <div className="mt-32">
          <div className="flex flex-col justify-center items-center mx-auto">
            {tokens ? (
              <div className="px-10 py-3 border border-zinc-300 rounded-xl shadow-xl">
                <div className=" bg-green-200 text-green-700 px-2 py-0.5 rounded-xl">
                  <p>Send stream</p>
                </div>
                <div className="flex flex-col justify-start">
                  <div className="mt-6">
                    <p className="text-2xl">Flow rate</p>
                    <div className="flex mt-2 align-middle items-center">
                      <input
                        type="number"
                        placeholder="0.0"
                        onChange={(e) => handleFlowRate(e.target.value)}
                        className="focus:border-green-500 px-2 py-2 w-full text-2xl border-slate-300"
                      ></input>
                      <Select
                        variant="filled"
                        placeholder=""
                        className="px-1 mx-3"
                        onChange={(e) => setFlowRateUnit(e.target.value)}
                      >
                        <option value="sec">/seconds</option>
                        <option value="min">/minute</option>
                        <option value="hour">/hour</option>
                        <option value="days">/days</option>
                        <option value="months">/months</option>
                      </Select>
                    </div>
                    <div className="flex flex-col mt-6">
                      <p className="text-2xl">Time Period</p>
                      <input
                        className="mt-3 text-xl"
                        type="datetime-local"
                        value={timePeriodInput}
                        onChange={(e) => setTimePeriodInput(e.target.value)}
                      ></input>
                    </div>
                    <div className="flex flex-col mt-6">
                      <p className="text-2xl">DCA Frequency</p>
                      <div className="flex align-middle items-center mt-2">
                        <input
                          type="number"
                          placeholder="0 days"
                          className="w-28 px-2 text-xl"
                          value={frequency.day}
                          onChange={(event) => {setFrequency({...frequency, day:event.target.value})}}
                        ></input>
                        <p className="mx-2 text-xl">+</p>
                        <input
                          type="number"
                          placeholder="0 hours"
                          className="w-28 px-2 text-xl"
                          value={frequency.hr}
                          onChange={(event) => {setFrequency({...frequency, hr:event.target.value})}}
                        ></input>
                        <p className="mx-2 text-xl">+</p>
                        <input
                          type="number"
                          placeholder="0 minutes"
                          className="w-28 px-2 text-xl"
                          value={frequency.min}
                          onChange={(event) => {setFrequency({...frequency, min:event.target.value})}}
                        ></input>
                        <p className="mx-2 text-xl">+</p>
                        <input
                          type="number"
                          placeholder="0 seconds"
                          className="w-28 px-2 text-xl"
                          value={frequency.sec}
                          onChange={(event) => {setFrequency({...frequency, sec:event.target.value})}}
                        ></input>
                        <p className="mx-2 text-xl"></p>
                      </div>
                    </div>
                    <div className="flex justify-between mt-10">
                      <button
                        onClick={() => getFrequency()}
                        className={`bg-blue-400 text-white px-10 py-3 rounded-xl text-lg ${approved ? `cursor-pointer hover:bg-white hover:text-blue-500 hover:border hover:border-blue-500 duration-200`: `cursor-not-allowed`}`}
                      >
                        Approve Stream
                      </button>
                      <button
                        onClick={() => getFrequency()}
                        className={`bg-green-500 text-white px-10 py-3 rounded-xl text-lg  ${approved ? `cursor-not-allowed`: `cursor-pointer hover:bg-white hover:text-green-500 hover:border hover:border-green-500 duration-200`}`}
                      >
                        Start stream
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 px-4 py-3 rounded-xl shadow-xl w-full">
                <div className="flex flex-col justify-start">
                  <p className="text-green-500 text-2xl">Select Tokens</p>
                  <TableContainer className="mt-8">
                    <Table variant="simple" size={"lg"}>
                      <Thead>
                        <Tr>
                          <Th>Asset to be Streamed</Th>
                          <Th>Asset to be Received</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>
                            <div
                              onClick={() => setDropIn(!dropIn)}
                              className="px-3 py-2 bg-slate-100 rounded-lg flex cursor-pointer hover:bg-slate-200 align-middle items-center"
                            >
                              {selectInLogo && (
                                <Image
                                  src={selectInLogo}
                                  alt=""
                                  className="w-8 h-8 mr-2 rounded-full"
                                  width={10}
                                  height={10}
                                />
                              )}
                              <p className="text-black">{selectIn}</p>
                            </div>
                            {dropIn && (
                              <div
                                onClick={() => inToken("Wrapped Matic", matic)}
                                className="px-3 py-2 bg-slate-100 rounded-lg flex cursor-pointer absolute mt-2  hover:bg-slate-200 align-middle items-center"
                              >
                                <Image
                                  src={matic}
                                  alt="hel"
                                  className="w-8 h-8 mr-2 rounded-full"
                                  width={10}
                                  height={10}
                                />
                                <p>Wrapped Matic</p>
                              </div>
                            )}
                          </Td>
                          <Td>
                            <div
                              onClick={() => setDropOut(!dropOut)}
                              className="px-3 py-2 bg-slate-100 rounded-lg flex cursor-pointer hover:bg-slate-200 align-middle items-center"
                            >
                              {selectOutLogo && (
                                <Image
                                  src={selectOutLogo}
                                  alt=""
                                  className="w-8 h-8 mr-2 rounded-full"
                                  width={10}
                                  height={10}
                                />
                              )}
                              <p className="text-black">{selectOut}</p>
                            </div>
                            {dropOut && (
                              <div
                                onClick={() => OutToken("Wrapped Eth", eth)}
                                className="px-3 py-2 bg-slate-100 rounded-lg flex cursor-pointer absolute mt-2  hover:bg-slate-200 align-middle items-center"
                              >
                                <Image
                                  src={eth}
                                  alt="hel"
                                  className="w-8 h-8 mr-2 rounded-full"
                                  width={10}
                                  height={10}
                                />
                                <p>Wrapped Eth</p>
                              </div>
                            )}
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                  <div className="mt-10 flex justify-center">
                    {/* <input
                      type="number"
                      placeholder="0"
                      onChange={(e) => setFlowRate(e.target.value)}
                      className="focus:border-green-500 px-2 py-2 w-full text-2xl border-slate-300"
                    ></input> */}
                    <button
                      onClick={() => setTokens(true)}
                      // onClick={() => approveOperator()}
                      disabled={!tokenIn && !tokenOut ? true : false}
                      className="bg-green-500 text-white px-10 py-3 rounded-xl text-lg hover:bg-white hover:text-green-500 hover:border hover:border-green-500 duration-200"
                    >
                      Stream
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dca;
