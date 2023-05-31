import React from "react";
import { useState} from "react";

const Wrap = () => {
    const [wrap, setWrap] = useState(false);
  return (
    <div className="w-full">
      <div className="flex justify-center items-center mx-auto ">
        <div className="mt-32">
          <div className="flex flex-col justify-center items-center mx-auto">
            <div className="px-10 py-3 border border-zinc-300 rounded-xl shadow-xl">
              <div className=" bg-green-200 text-green-700 px-2 py-0.5 rounded-xl w-16 -ml-2">
                <p>Wrap</p>
              </div>
              <div className="flex justify-start">
                <div className="mt-6">
                  <p className="text-2xl">Wrap</p>
                  <div className="flex mt-2 align-middle items-center">
                    <input
                      type="number"
                      placeholder="0.0 (in matic)"
                      className="focus:border-green-500 px-2 py-2 w-full text-2xl border-slate-300"
                    ></input>
                  </div>
                </div>
                <div className="mt-6 mx-6">
                  <p className="text-2xl">Upgrade</p>
                  <div className="flex mt-2 align-middle items-center">
                    <input
                      type="number"
                      placeholder="0.0 (in matic)"
                      className="focus:border-green-500 px-2 py-2 w-full text-2xl border-slate-300"
                    ></input>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-10 mx-20">
                <button
                        className={`bg-blue-400 text-white px-10 py-3 rounded-xl text-lg cursor-pointer hover:bg-white hover:text-blue-500 hover:border hover:border-blue-500 duration-200`}
                      >
                        Wrap
                      </button>
                      <button
                        className="bg-green-500 text-white px-10 py-3 rounded-xl text-lg hover:bg-white hover:text-green-500 hover:border hover:border-green-500 duration-200"
                      >
                        Upgrade
                      </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wrap;
