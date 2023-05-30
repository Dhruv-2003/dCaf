import React from "react";

const Dashboard = () => {
  return (
    <div className="w-full">
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
    </div>
  );
};

export default Dashboard;
