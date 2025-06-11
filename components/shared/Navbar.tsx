import Link from "next/link";
import React from "react";
import { IoList } from "react-icons/io5";
import {
  LuChartLine,
  LuLogOut,
  //LuSendHorizontal,
  LuSendToBack,
  LuSettings2,
} from "react-icons/lu";

export default function Navbar() {
  return (
    <div className="w-auto md:w-20 bg-highlight h-dvh flex flex-col justify-between py-4">
      <div className="flex flex-col gap-0">
        <div className="px-2 py-2 md:px-4 md:py-6 flex justify-center items-center">
          <LuSendToBack size={24} className="text-foreground" />
        </div>
        <div className="px-2 py-2 md:px-4 md:py-6 flex justify-center items-center">
          <IoList size={24} className="text-foreground" />
        </div>
        <div className="px-2 py-2 md:px-4 md:py-6 flex justify-center items-center">
          <LuChartLine size={24} className="text-foreground" />
        </div>
      </div>

      <div className="flex flex-col gap-0">
        <div className="px-2 py-2 md:px-4 md:py-6 flex justify-center items-center">
          <LuSettings2 size={24} className="text-foreground" />
        </div>
        <Link href="/login">
          <div className="px-2 py-2 md:px-4 md:py-6 flex justify-center items-center">
            <LuLogOut size={24} className="text-foreground" />
          </div>
        </Link>
      </div>
    </div>
  );
}
