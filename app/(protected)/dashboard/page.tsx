"use client";
import { useState } from "react";

import Link from "next/link";
import { NO } from "@/components/flags";
import { IoList } from "react-icons/io5";
import {
  LuChartLine,
  LuChevronDown,
  LuLogOut,
  LuMessageCircleQuestion,
  LuNavigation,
  //LuSendHorizontal,
  LuSendToBack,
  LuSettings2,
} from "react-icons/lu";
import Log from "@/components/Log";
import Stats from "@/components/Stats";
import Settings from "@/components/pages/Settings";
import Image from "next/image";
import { emblem, role } from "@/utils/constants";
import ChangeCompany from "@/components/ChangeCompany";

//=================================================================================================================================================
function MainScreen() {
  return (
    <main className="flex flex-col w-full items-center justify-center p-2 md:p-8 h-full">
      <div className="w-full h-full flex flex-col justify-center items-center bg-highlight rounded-2xl p-4 min-h-[50dvh] pb-96">
        <div className="w-full items-center flex flex-col justify-center pb-10">
          <h1 className="text-xl md:text-3xl font-semibold text-center">
            Start en video-samtale 👇
          </h1>
          <p className="text-sm pt-2 text-center">
            Skriv inn telefonnummer til kunden for å starte samtalen
          </p>
        </div>
        <div className="w-full max-w-md flex flex-col sm:flex-row gap-4 justify-center">
          <div className="p-4 w-auto mx-auto bg-white shadow-sm shadow-black/25 flex flex-row items-center gap-2 rounded-xl">
            <NO />
            <p className="">+47</p>
            <LuChevronDown className="opacity-25" size={20} />
          </div>
          {/*
          <select
            className="bg-transparent text-black focus:outline-none"
            defaultValue="+46"
          >
            <option value="+46">SE +46</option>
            <option value="+45">DK +45</option>
          </select>
          */}
          <input
            type="text"
            placeholder="Telefonnummer"
            inputMode="numeric"
            pattern="\d*"
            maxLength={11}
            onInput={(e) => {
              const input = e.target as HTMLInputElement;
              input.value = input.value.replace(/\D/g, "").slice(0, 11);
            }}
            className="bg-white shadow-sm shadow-black/25 py-4 px-4 w-full rounded-xl"
          />
          {/*
        <Link href="/fibersor/TR4B9D">
          <button className="bg-secondary shadow-sm shadow-black/25 rounded p-4 w-auto text-white uppercase font-bold">
            Send
          </button>
        </Link>
        */}
          <button
            className="whitespace-nowrap py-3 px-4 rounded-xl border text-white border-gray-200 bg-primary hover:bg-secondary focus:ring focus:ring-red-200 transition duration-200 flex items-center gap-2"
            onClick={() =>
              window.open("/fibersor/TR4B9D", "_blank", "noopener,noreferrer")
            }
          >
            <LuNavigation />
            <span className="font-semibold text-sm ">Send</span>
          </button>
        </div>
      </div>
    </main>
  );
}
//=================================================================================================================================================
function LogScreen() {
  return (
    <main className="flex flex-col w-full items-center justify-start p-2 md:p-8 h-full">
      <div className="w-full h-full flex flex-col justify-center items-center bg-highlight rounded-2xl p-4 min-h-[50dvh]">
        <Log />
      </div>
    </main>
  );
}
//=================================================================================================================================================
function StatsScreen() {
  return (
    <main className="flex flex-col w-full items-center justify-start p-2 md:p-8 h-full">
      <div
        id="scrollbar"
        className="w-full h-full flex flex-col justify-start items-center bg-highlight rounded-2xl p-4 min-h-[50dvh] overflow-y-scroll"
      >
        <Stats />
      </div>
    </main>
  );
}
//=================================================================================================================================================
function SettingsScreen() {
  return (
    <main className="flex flex-col w-full items-center justify-start p-2 md:p-8 h-full">
      <div
        id="scrollbar"
        className="w-full h-full flex flex-col justify-start items-center bg-highlight rounded-2xl p-4 min-h-[50dvh] overflow-y-scroll"
      >
        <Settings />
      </div>
    </main>
  );
}

//=================================================================================================================================================
export default function App() {
  const [active, setActive] = useState(1);
  const [changeCompanyModal, setChangeCompanyModal] = useState(false);

  const handleChangeCompany = () => {
    setChangeCompanyModal(true);
  };

  const renderScreen = () => {
    switch (active) {
      case 1:
        return <MainScreen />;
      case 2:
        return <LogScreen />;
      case 3:
        return <StatsScreen />;
      case 4:
        return <SettingsScreen />;
      //      case 5:
      //        return <MeetingScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="h-dvh w-full bg-bg flex flex-row max-w-[1920px] mx-auto">
      <nav className="w-auto bg-highlight h-auto flex flex-col justify-between md:ml-4 my-2 md:my-8 rounded-xl">
        <div className="flex flex-col">
          {role === "superadmin" ? (
            <div
              onClick={handleChangeCompany}
              className="flex cursor-pointer justify-center items-center p-2 md:p-4"
            >
              <Image
                src={emblem}
                alt="Henvid.com"
                height={50}
                width={50}
                className="w-10 h-10 items-center object-contain object-center"
              />
            </div>
          ) : (
            <div className="flex justify-center items-center p-2 md:p-4">
              <Image
                src={emblem}
                alt="Henvid.com"
                height={50}
                width={50}
                className="w-10 h-10 items-center object-contain object-center"
              />
            </div>
          )}
          {changeCompanyModal && (
            <ChangeCompany onClose={() => setChangeCompanyModal(false)} />
          )}
          <div
            onClick={() => setActive(1)}
            className={`cursor-pointer p-2 md:p-6 flex justify-center items-center ${
              active === 1 && "shadow-sm shadow-black/25 rounded-xl bg-white"
            }`}
          >
            <LuSendToBack size={24} className="text-foreground" />
          </div>
          <div
            onClick={() => setActive(2)}
            className={`cursor-pointer p-2 md:p-6 flex justify-center items-center ${
              active === 2 && "shadow-sm shadow-black/25 rounded-xl bg-white"
            }`}
          >
            <IoList size={24} className="text-foreground" />
          </div>
          <div
            onClick={() => setActive(3)}
            className={`cursor-pointer p-2 md:p-6 flex justify-center items-center ${
              active === 3 && "shadow-sm shadow-black/25 rounded-xl bg-white"
            }`}
          >
            <LuChartLine size={24} className="text-foreground" />
          </div>
        </div>

        <div className="flex flex-col">
          <a
            href="https://www.henvid.com/help"
            target="_blank"
            rel="noopener noreferrer"
            className={`cursor-pointer p-2 md:p-6 flex justify-center items-center hovver:shadow-sm hovver:bg-white hovver:rounded-xl hovver:shadow-black/25`}
          >
            <LuMessageCircleQuestion size={24} className="text-foreground" />
          </a>
          <div
            onClick={() => setActive(4)}
            className={`cursor-pointer p-2 md:p-6 flex justify-center items-center ${
              active === 4 && "shadow-sm shadow-black/25 rounded-xl bg-white"
            }`}
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
      {renderScreen()}
    </div>
  );
}
