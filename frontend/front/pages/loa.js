import React from 'react'
import { Select } from "@chakra-ui/react";
const Loa = () => {
  return (
    <div className="w-full">
      <div className="flex justify-center items-center mx-auto ">
        <div className="mt-32">
          <div className="flex flex-col justify-center items-center mx-auto">
            <div className="px-10 py-3 border border-zinc-300 rounded-xl shadow-xl">
              <div className=" bg-green-200 text-green-700 px-2 py-0.5 rounded-xl w-28 -ml-2">
                <p>Send stream</p>
              </div>
              <div className="flex flex-col justify-start">
                <div className="mt-6">
                  <p className="text-2xl">Flow rate</p>
                  <div className="flex mt-2 align-middle items-center">
                    <input
                      type="text"
                      placeholder="0.0"
                      className="focus:border-green-500 px-2 py-2 w-full text-2xl border-slate-300"
                    ></input>
                    <Select
                      variant="filled"
                      placeholder=""
                      className="px-1 mx-3"
                    >
                      <option value="">/seconds</option>
                      <option value="">/minute</option>
                      <option value="">/hour</option>
                      <option value="">/days</option>
                      <option value="">/months</option>
                    </Select>
                  </div>
                  <div className="flex flex-col mt-6">
                    <p className="text-2xl">Time Period</p>
                    <input className="mt-3 text-xl" type="datetime-local"></input>
                  </div>
                  <div className="flex flex-col mt-6">
                  <p className="text-2xl">Limit Price</p>
                    <input type="text" className='focus:border-green-500 px-2 py-2 w-full text-2xl border-slate-300 mt-2' placeholder='in wei'></input>
                  </div>
                  <div className="flex justify-center items-center mt-10">
                    <button className="bg-green-500 text-white px-10 py-3 rounded-xl text-lg hover:bg-white hover:text-green-500 hover:border hover:border-green-500">
                      Start stream
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loa