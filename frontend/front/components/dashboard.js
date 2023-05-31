import React, { useState } from "react";
import { useAccount } from "wagmi";
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

const Dashboard = () => {
  const { isConnected } = useAccount();

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
                                      <Td isNumeric>0.1245</Td>
                                      <Td isNumeric>30</Td>
                                      <Td isNumeric>25/04/2024 12:26</Td>
                                    </Tr>
                                  </Tbody>
                                </Table>
                              </TableContainer>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <div className="mx-10 flex justify-between">
                            <button className="bg-green-200 px-7 py-1 rounded-md text-green-600">
                              edit
                            </button>
                            <button className="bg-red-200 px-7 py-1 rounded-md text-red-600">
                              cancel
                            </button>
                          </div>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
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
