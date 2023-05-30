import React from "react";
import { useAccount } from "wagmi";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";

const Dashboard = () => {
  const { isConnected } = useAccount();

  return (
    <div className="w-full">
      {isConnected ? (
        <div className="flex flex-col justify-center items-center mx-auto">
          <div className="mt-20">
            <div className="w-full flex flex-col justify-center items-center mx-auto">
              <div className="flex justify-start">
                <p className="text-3xl text-green-500 ">Current Streams</p>
              </div>
              <div className="mt-8 w-3/4 justify-center flex items-center mx-auto">
                <div className="border border-gray-200 px-4 py-3 rounded-xl shadow-xl">
                  <div>
                    <Accordion
                      defaultIndex={[0]}
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
                            <button className="bg-green-200 px-7 py-1 rounded-md text-green-600">edit</button>
                            <button className="bg-red-200 px-7 py-1 rounded-md text-red-600">cancel</button>
                         </div>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center m-auto h-screen">
          <div className="mb-60">
            <div className="w-full flex flex-col justify-center items-center mx-auto">
              <p className="text-3xl">Connect to dCaf</p>
              <p className="text-xl text-gray-400 mt-1">
                Connect your wallet or look around
              </p>
            </div>
            <div className="flex mt-10">
              <div className="px-10 py-3 border border-zinc-300 mx-2 rounded-xl shadow-xl hover:shadow-2xl">
                <p>Dollar cost Average Investing</p>
              </div>
              <div className="px-10 py-3 border border-zinc-300 mx-2 rounded-xl shadow-xl hover:shadow-2xl">
                <p>Limit cost Average Investing</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
