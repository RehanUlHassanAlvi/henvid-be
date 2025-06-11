//import Link from "next/link";
import "../../globals.css";
//import {
//  LuChartLine,
//  LuLogOut,
//  LuSendToBack,
//  LuSettings2,
//} from "react-icons/lu";
//import { IoList } from "react-icons/io5";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-dvh w-full bg-bg flex flex-row max-w-[1920px] mx-auto">
      {/*
      <nav className="w-auto bg-highlight h-auto flex flex-col justify-between md:ml-4 my-2 md:my-8 rounded-xl">
        <div className="flex flex-col">
          <div
            className={`cursor-pointer p-2 md:p-6 flex justify-center items-center shadow-sm shadow-black/25 rounded-xl bg-white `}
          >
            <LuSendToBack size={24} className="text-foreground" />
          </div>
          <div
            className={`cursor-pointer p-2 md:p-6 flex justify-center items-center`}
          >
            <IoList size={24} className="text-foreground" />
          </div>
          <div
            className={`cursor-pointer p-2 md:p-6 flex justify-center items-center`}
          >
            <LuChartLine size={24} className="text-foreground" />
          </div>
        </div>

        <div className="flex flex-col">
          <div
            className={`cursor-pointer p-2 md:p-6 flex justify-center items-center`}
          >
            <LuSettings2 size={24} className="text-foreground" />
          </div>
          <Link href="/logout">
            <div className="cursor-pointer p-2 md:p-6 flex justify-center items-center">
              <LuLogOut size={24} className="text-foreground" />
            </div>
          </Link>
        </div>
      </nav>
      */}
      {children}
    </div>
  );
}
