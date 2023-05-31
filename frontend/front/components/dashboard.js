import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Select,
} from "@chakra-ui/react";
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
import s2 from "../public/superfluid2.png";
import s1 from "../public/superfluid1.png";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { getContract } from "wagmi/actions";
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
import { formatEther } from "viem";
const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [dcafOrderId, setDcafOrderId] = useState(1);
  const [dcaOrderData, setDcaOrderData] = useState();
  const [dcaOrderActive, setDcaOrderActive] = useState();
  const [dcaWallet, setDcaWallet] = useState();
  const dcaf_contract = {
    address: dcafProtocol_Address,
    abi: dcafProtocol_ABI,
  };
  const fetchOrderDetail = async () => {
    try {
      const data = await publicClient.readContract({
        ...dcaf_contract,
        functionName: "dcafOrders",
        args: [dcafOrderId],
      });
      console.log(data);
      setDcaWallet(data[1]);
      const finalData = {
        creator: data[0],
        wallet: data[1],
        tokenIn: data[2],
        superToken: data[3],
        tokenOut: data[4],
        flowRate: formatEther(data[5]),
        timePeriod: handleTimePeriod(parseInt(data[6]), parseInt(data[9])),
        dcafFreq: data[7].toString(),
        task1Id: data[11],
        task2Id: data[12],
      };
      console.log(finalData);
      setDcaOrderActive(data[10]);
      setDcaOrderData(finalData);
    } catch (error) {
      console.log(error);
    }
  };
  const cancelDCAOrder = async () => {
    try {
      if (!dcafOrderId) return;
      const { request } = await publicClient.simulateContract({
        ...dcaf_contract,
        functionName: "createDCA",
        args: [dcafOrderId],
        account: address,
      });
      const tx = await walletClient.writeContract(request);
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTimePeriod = (timePeriod, creationTime) => {
    // const currentTime = Math.floor(new Date() / 1000);
    // console.log(currentTime);
    const totalTime = creationTime + timePeriod;
    const endTime = timeConverter(totalTime);
    return endTime;
  };

  function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time =
      date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
    return time;
  }

  useEffect(() => {
    // if (dcafOrderId) {
    //   fetchOrderDetail();
    // }
    fetchOrderDetail();
  }, [dcafOrderId]);

  return (
    <div className="w-full">
      {isConnected ? (
        <div className="flex flex-col justify-center items-center mx-auto">
          <div className="mt-20">
            <div className="w-full flex flex-col justify-center items-center mx-auto">
              <div className="flex justify-start">
                <p className="text-3xl text-green-500">Streams</p>
              </div>
              <div className="mt-8 w-3/4 justify-center flex items-center mx-auto">
                <div className="border border-gray-200 px-4 py-3 rounded-xl shadow-xl">
                  <div>
                    {dcaOrderData ? (
                      <Accordion
                        defaultIndex={[1]}
                        allowMultiple={true}
                        className=""
                      >
                        <AccordionItem>
                          <h2>
                            <AccordionButton>
                              <Box as="span" flex="1" textAlign="left">
                                <TableContainer>
                                  <Table variant="simple">
                                    <Thead>
                                      <Tr>
                                        <Th>Type</Th>
                                        <Th>Flow rate</Th>
                                        <Th>Frequency</Th>
                                        <Th>Ending At</Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody>
                                      <Tr>
                                        <Td>DCA</Td>
                                        <Td isNumeric>
                                          {dcaOrderData.flowRate}
                                        </Td>
                                        <Td isNumeric>
                                          {dcaOrderData.dcafFreq}
                                        </Td>
                                        <Td isNumeric>
                                          {dcaOrderData.timePeriod}
                                        </Td>
                                      </Tr>
                                    </Tbody>
                                  </Table>
                                </TableContainer>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            <div className="flex justify-between">
                              <div>
                                <a target="_blank" href={`https://app.superfluid.finance/stream/polygon-mumbai/${dcaOrderData.creator}-${dcaOrderData.wallet}-${WMATICx_Address}-0.0`}>
                                  <button className="bg-slate-200 px-7 py-1 rounded-md text-slate-500 mx-2">
                                    Stream
                                  </button>
                                </a>
                                <a target="_blank" href={`https://app.gelato.network/task/${dcaOrderData.task1Id}?chainId=80001`}>
                                  <button className="bg-slate-200 px-7 py-1 rounded-md text-slate-500 mx-2">
                                    Task 1
                                  </button>
                                </a>
                                <a target="_blank" href={`https://app.gelato.network/task/${dcaOrderData.task2Id}?chainId=80001`}>
                                  <button className="bg-slate-200 px-7 py-1 rounded-md text-slate-500 mx-2">
                                    Task 2
                                  </button>
                                </a>
                              </div>
                              <button className="bg-red-200 px-7 py-1 rounded-md text-red-600 mx-2">
                                Cancel
                              </button>
                            </div>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <a>No DCA order Found</a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              {/* <iframe src="https://app.superfluid.finance/stream/polygon-mumbai/0x3fdf69da53299cf8c179b19a644664a3bb6b7bbf-0x8d7a86a304890abaa30ef6a2aad037531c071d37-0x42bb40bf79730451b11f6de1cba222f17b87afd7-0.0" title="des" width={900} height={900}></iframe> */}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center mx-auto">
          <div className="mt-32">
            <div className="w-full flex flex-col justify-center items-center mx-auto">
              <p className="text-3xl">Connect to dCaf</p>
              <p className="text-xl text-gray-400 mt-1">
                Connect your wallet or look around
              </p>
            </div>
            <div className="flex mt-10">
              <div className="py-3 border border-zinc-300 mx-2 rounded-xl shadow-xl hover:shadow-2xl flex flex-col">
                <p className="px-10 text-2xl">Dollar cost Average Investing</p>
                <Image
                  src={s2}
                  alt="image"
                  className="w-[400px] object-fill mt-4"
                />
              </div>
              <div className="py-3 border border-zinc-300 mx-2 rounded-xl shadow-xl hover:shadow-2xl flex flex-col">
                <p className="px-10 text-2xl">Limit cost Average Investing</p>
                <Image
                  src={s1}
                  alt="image"
                  className="w-[400px] object-fill mt-4"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
