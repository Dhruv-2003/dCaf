import React, { useState } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from "next/router";

const Sidebar = ({children}) => {

  const router = useRouter();

  return (
    <div className="flex w-screen">
      <div className="flex flex-col border-r border-slate-500 w-1/6 h-screen">
        <div className="mt-10">
          <div>
            <p className="text-5xl px-10"><span className="text-green-500">d</span>Caf</p>
          </div>
          <div className="mt-10 text-xl flex flex-col">
            <ul>
              <li className="mt-5 hover:bg-green-200 px-6 rounded-xl py-2 cursor-pointer text-slate-700" onClick={() => router.push("/")}>Dashboard</li>
              <li className="mt-5 hover:bg-green-200 px-6 rounded-xl py-2 cursor-pointer text-slate-700 " onClick={() => router.push("/dca")}>Dollar Cost Average</li>
              <li className="mt-5 hover:bg-green-200 px-6 rounded-xl py-2 cursor-pointer text-slate-700" onClick={() => router.push("/loa")}>Limit Order Average</li>
              <li className="mt-5 hover:bg-green-200 px-6 rounded-xl py-2 cursor-pointer text-slate-700" onClick={() => router.push("/wrap")}>Wrap/Upgrade</li>
            </ul>
          </div>
          <div className="bottom-0 absolute mb-10 mx-8">
            <ConnectButton chainStatus="none"/>
          </div>
        </div>
      </div>
      <main className="w-5/6">{children}</main>
    </div>
  );
};

export default Sidebar;
