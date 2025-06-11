"use client";
import React, { useState } from "react";
import {
  LuBotMessageSquare,
  LuCalendarFold,
  LuChartColumn,
  LuDollarSign,
  LuFileKey2,
  LuGitCompareArrows,
  LuInfo,
  LuList,
  LuMousePointerClick,
  LuPalette,
  LuPencil,
  LuPlus,
  LuSettings2,
  LuVideotape,
  LuX,
} from "react-icons/lu";
import User from "@/components/user/User";
import { UserType } from "@/utils/types2";
import { users } from "@/utils/store2";
import CreateUser from "@/components/user/CreateUser";
import AddLicense from "../license/AddLicense";
import EditLicense from "../license/EditLicense";

const addons = [
  {
    id: 1,
    name: "Logo og Tema",
    description: "Egen farge og logo i appen",
    icon: LuPalette,
    available: false,
    included: false,
  },
  {
    id: 2,
    name: "Egendefinert domene",
    description: "Mer profesjonell visning av link for kunder",
    icon: LuMousePointerClick,
    available: true,
    included: false,
  },
  {
    id: 3,
    name: "Opptak av samtaler",
    description: "Ta opp samtaler (med samtykke) for opplæring og mer",
    icon: LuVideotape,
    available: false,
    included: false,
  },
  {
    id: 4,
    name: "Statistikk",
    description: "Statistikk over samtaler og anmeldelser",
    icon: LuChartColumn,
    available: true,
    included: true,
  },
  {
    id: 5,
    name: "Logg",
    description: "Historikk over samtaler, hvem, når og hvor lenge",
    icon: LuList,
    available: true,
    included: true,
  },
  {
    id: 6,
    name: "kundeinitiert kontaktkalender",
    description: "Kunden kan sette opp videosamtale-tidspunkt selv",
    icon: LuCalendarFold,
    available: false,
    included: false,
  },
  {
    id: 7,
    name: "Melding etter anrop",
    description: "Automatisk utsendelse av melding etter samtalen",
    icon: LuBotMessageSquare,
    available: true,
    included: true,
  },
  {
    id: 8,
    name: "integrasjon mot eget system (custom)",
    description: "Tilpasset pris per integrasjon basert på arbeid",
    icon: LuGitCompareArrows,
    available: true,
    included: false,
  },
];
interface LicenseItem {
  id: number;
  label: string;
  assignedTo: string;
  available: boolean;
}
const licenses: LicenseItem[] = [
  {
    id: 1,
    label: "Lisens 1",
    available: false,
    assignedTo: "Tildelt: Ola Nordmann",
  },
  {
    id: 2,
    label: "Lisens 2",
    available: false,
    assignedTo: "Tildelt: Kari Nordmann",
  },
  {
    id: 3,
    label: "Lisens 3",
    available: false,
    assignedTo: "Tildelt: Hennig Olsen",
  },
  { id: 4, label: "Lisens 4", available: true, assignedTo: "" },
];

export default function Settings() {
  const [settingspage, setSettingspage] = useState(1);
  // Static but will be dynamic of course
  const activatedAddons = [2, 4, 5];
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [addLicenseModal, setAddLicenseModal] = useState(false);
  const [editLicenseModal, setEditLicenseModal] = useState(false);

  const handleCreateUserModal = () => {
    setCreateUserModal(true);
  };

  const handleAddLicenseModal = () => {
    setAddLicenseModal(true);
  };
  const handleEditLicenseModal = () => {
    setEditLicenseModal(true);
  };

  return (
    <div className="w-full">
      <section className="py-4 overflow-hidden">
        <div className="containerr px-4 mx-auto">
          <div className="bg-bg border shadow-none shadow-black/25 rounded-xl">
            <div className="w-auto flex flex-row flex-wrap items-center justify-start">
              <div
                onClick={() => setSettingspage(1)}
                className={`px-8 py-3.5 cursor-pointer rounded-xl ${
                  settingspage === 1 && "shadow-sm shadow-black/25 bg-white"
                }`}
              >
                <p className="font-bold uppercase whitespace-nowrap">
                  Generelt
                </p>
              </div>
              <div
                onClick={() => setSettingspage(2)}
                className={`px-8 py-3.5 cursor-pointer rounded-xl ${
                  settingspage === 2 && "shadow-sm shadow-black/25 bg-white"
                }`}
              >
                <p className="font-semibold uppercase whitespace-nowrap">
                  Brukere
                </p>
              </div>
              <div
                onClick={() => setSettingspage(3)}
                className={`px-8 py-3.5 cursor-pointer rounded-xl ${
                  settingspage === 3 && "shadow-sm shadow-black/25 bg-white"
                }`}
              >
                <p className="font-semibold uppercase whitespace-nowrap">
                  Ekstrafunksjoner
                </p>
              </div>
              <div
                onClick={() => setSettingspage(4)}
                className={`px-8 py-3.5 cursor-pointer rounded-xl ${
                  settingspage === 4 && "shadow-sm shadow-black/25 bg-white"
                }`}
              >
                <p className="font-semibold uppercase whitespace-nowrap">
                  Lisens og Betaling
                </p>
              </div>
              <div
                //onClick={() => setSettingspage(1)}
                className={`px-8 py-3.5 cursor-not-allowed rounded-xl ${
                  settingspage === 5 && "shadow-sm shadow-black/25 bg-white"
                }`}
              >
                <p className="font-semibold uppercase opacity-50 whitespace-nowrap">
                  Rapport
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*=========================================================================*/}
      {settingspage === 1 && (
        <div className="w-full flex flex-col pb-10">
          <div className="container px-4 mx-auto pt-4">
            <h2 className="text-2xl font-semibold pb-2">Firma</h2>
            <hr />
          </div>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Firma Logo
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="flex flex-wrap sm:max-w-md ml-auto">
                      <div className="w-full sm:flex-1 mb-2.5 sm:mb-0">
                        <input
                          className="py-2.5 px-3.5 text-sm w-full hover:bg-gray-50 outline-none placeholder-neutral-400 border border-neutral-200 sm:border-r-0 rounded-lg sm:rounded-tr-none sm:rounded-br-none focus-within:border-neutral-600"
                          id="inputsInput9-1"
                          type="text"
                          placeholder="Klikk for å velge en fil for opplastning"
                        />
                      </div>
                      <div className="w-full sm:w-auto">
                        <a
                          className="inline-flex items-center justify-center px-3.5 py-2.5 text-sm w-full h-full text-neutral-50 font-medium bg-primary hover:bg-secondary rounded-lg transition duration-300 sm:rounded-tl-none sm:rounded-bl-none"
                          href="#"
                        >
                          Last opp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Firmanavn
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="sm:max-w-md ml-auto">
                      <input
                        className="py-2.5 px-3.5 text-sm w-full hover:bg-gray-50 outline-none placeholder-neutral-400 border border-neutral-200 rounded-lg focus-within:border-neutral-600"
                        id="inputsInput13-1"
                        type="text"
                        placeholder="Firmavn AS"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Firmanavn
                    </h3>
                    <p className="text-sm text-neutral-500">
                      For visning i domenet
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="sm:max-w-md ml-auto overflow-hidden border border-neutral-200 rounded-lg focus-within:border-neutral-600">
                      <div className="flex flex-wrap sm:flex-nowrap sm:divide-x divide-neutral-200">
                        <div className="w-full sm:w-auto">
                          <div className="py-2 px-3.5 bg-light">
                            <span className="text-sm font-medium">
                              henvid.com/
                            </span>
                          </div>
                        </div>
                        <div className="w-full sm:flex-1">
                          <input
                            className="py-3 px-3.5 text-sm w-full h-full outline-none hover:bg-gray-50 placeholder-neutral-400"
                            id="inputsInput1-1"
                            type="text"
                            placeholder="firmanavn"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* ONLY SHOW BELOW IF ACTIVATED EXTRA FUNCTION FOR IT */}
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 pb-8 bg-white border rounded-xl">
                <div className="flex flex-nowrap justify-between -m-1.5">
                  <div className="w-full sm:w-1/2 p-1.5">
                    <h3 className="font-heading text-sm font-semibold">
                      Egendefinert domenenavn
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-1.5">
                    <div className="flex sm:max-w-md ml-auto items-center overflow-hidden hover:bg-gray-50 border border-neutral-200 rounded-lg focus-within:border-neutral-600">
                      <span className="pl-3.5 text-sm text-neutral-400 select-none">
                        https://
                      </span>
                      <input
                        className="py-2.5 pr-3.5 text-sm w-auto bg-transparent outline-none placeholder-neutral-400"
                        id="inputsInput18-1"
                        type="text"
                        placeholder="firmanavn"
                      />
                      <span className="pl-3.5 text-sm text-neutral-400 select-none">
                        .henvid.com/
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* */}
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Organisasjonsnummer
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="sm:max-w-md ml-auto">
                      <input
                        className="py-2.5 px-3.5 text-sm w-full hover:bg-gray-50 outline-none placeholder-neutral-400 border border-neutral-200 rounded-lg focus-within:border-neutral-600"
                        id="inputsInput13-1"
                        type="number"
                        maxLength={9}
                        placeholder="999888777"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Land / Språk
                    </h3>
                    <p className="text-sm text-neutral-400"></p>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="relative h-full sm:max-w-md ml-auto">
                      <select
                        className="appearance-none py-2 pl-3.5 pr-10 text-sm w-full h-full bg-white hover:bg-gray-50 outline-none border border-neutral-200 focus:border-neutral-600 cursor-pointer rounded-lg"
                        id="inputsSelect4-1"
                      >
                        <option value="NO">Norge / Norsk</option>
                        <option value="SE">Sverige / Svenska</option>
                        <option value="DK">Danmark / Dansk</option>
                        <option value="FI">Finland / Soumi</option>
                        <option value="EN">England / English</option>
                      </select>
                      <svg
                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                        width={16}
                        height={22}
                        viewBox="0 0 16 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.6673 9L8.00065 13.6667L3.33398 9"
                          stroke="#0C1523"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Bransje
                    </h3>
                    <p className="text-sm text-neutral-400">
                      For tilpasning av plattformen
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="relative h-full sm:max-w-md ml-auto">
                      {/*
                  <svg
                    className="absolute top-1/2 left-3.5 transform -translate-y-1/2"
                    width={16}
                    height={22}
                    viewBox="0 0 16 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.33398 17H2.58398C2.58398 17.4142 2.91977 17.75 3.33398 17.75V17ZM12.6673 17V17.75C13.0815 17.75 13.4173 17.4142 13.4173 17H12.6673ZM9.91732 7.66667C9.91732 8.72521 9.0592 9.58333 8.00065 9.58333V11.0833C9.88762 11.0833 11.4173 9.55364 11.4173 7.66667H9.91732ZM8.00065 9.58333C6.94211 9.58333 6.08398 8.72521 6.08398 7.66667H4.58398C4.58398 9.55364 6.11368 11.0833 8.00065 11.0833V9.58333ZM6.08398 7.66667C6.08398 6.60812 6.94211 5.75 8.00065 5.75V4.25C6.11368 4.25 4.58398 5.77969 4.58398 7.66667H6.08398ZM8.00065 5.75C9.0592 5.75 9.91732 6.60812 9.91732 7.66667H11.4173C11.4173 5.77969 9.88762 4.25 8.00065 4.25V5.75ZM4.08398 17C4.08398 14.8369 5.83754 13.0833 8.00065 13.0833V11.5833C5.00911 11.5833 2.58398 14.0085 2.58398 17H4.08398ZM8.00065 13.0833C10.1638 13.0833 11.9173 14.8369 11.9173 17H13.4173C13.4173 14.0085 10.9922 11.5833 8.00065 11.5833V13.0833ZM3.33398 17.75H12.6673V16.25H3.33398V17.75Z"
                      fill="#B8C1CC"
                    />
                  </svg>
                  
*/}
                      {/*Husk pl-10 ved ikon */}
                      <select
                        className="appearance-none py-2 pll-10 pl-3.5 pr-10 text-sm w-full h-full bg-white hover:bg-gray-50 outline-none border border-neutral-200 focus:border-neutral-600 cursor-pointer rounded-lg"
                        id="inputsSelect6-1"
                      >
                        <option value="none">Velg bransje</option>
                        <option value="telecom">Telecom</option>
                        <option value="it">IT</option>

                        <option value="annet">Annet</option>
                      </select>
                      <svg
                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                        width={16}
                        height={22}
                        viewBox="0 0 16 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.6673 9L8.00065 13.6667L3.33398 9"
                          stroke="#0C1523"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="container px-4 mx-auto pt-4">
            <h2 className="text-2xl font-semibold pb-2">Bruker</h2>
            <hr />
          </div>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">Navn</h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="flex items-center justify-end ml-auto sm:max-w-md overflow-hidden hover:bg-gray-50 border border-neutral-200 rounded-lg focus-within:border-neutral-600">
                      <div className="pl-3.5">
                        <svg
                          width={16}
                          height={22}
                          viewBox="0 0 16 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.33398 17H2.58398C2.58398 17.4142 2.91977 17.75 3.33398 17.75V17ZM12.6673 17V17.75C13.0815 17.75 13.4173 17.4142 13.4173 17H12.6673ZM9.91732 7.66667C9.91732 8.72521 9.0592 9.58333 8.00065 9.58333V11.0833C9.88762 11.0833 11.4173 9.55364 11.4173 7.66667H9.91732ZM8.00065 9.58333C6.94211 9.58333 6.08398 8.72521 6.08398 7.66667H4.58398C4.58398 9.55364 6.11368 11.0833 8.00065 11.0833V9.58333ZM6.08398 7.66667C6.08398 6.60812 6.94211 5.75 8.00065 5.75V4.25C6.11368 4.25 4.58398 5.77969 4.58398 7.66667H6.08398ZM8.00065 5.75C9.0592 5.75 9.91732 6.60812 9.91732 7.66667H11.4173C11.4173 5.77969 9.88762 4.25 8.00065 4.25V5.75ZM4.08398 17C4.08398 14.8369 5.83754 13.0833 8.00065 13.0833V11.5833C5.00911 11.5833 2.58398 14.0085 2.58398 17H4.08398ZM8.00065 13.0833C10.1638 13.0833 11.9173 14.8369 11.9173 17H13.4173C13.4173 14.0085 10.9922 11.5833 8.00065 11.5833V13.0833ZM3.33398 17.75H12.6673V16.25H3.33398V17.75Z"
                            fill="#B8C1CC"
                          />
                        </svg>
                      </div>
                      <input
                        className="py-2.5 pl-2 pr-3.5 text-sm w-full bg-transparent outline-none placeholder-neutral-400"
                        id="inputsInput7-1"
                        type="text"
                        placeholder="Skriv inn fornavn og etternavn"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Telefonnummer
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="sm:max-w-md ml-auto overflow-hidden border border-neutral-200 rounded-lg focus-within:border-neutral-600">
                      <div className="flex flex-wrap sm:flex-nowrap sm:divide-x divide-neutral-200">
                        <div className="w-full sm:w-auto">
                          <div className="relative h-full">
                            <select className="appearance-none py-2 pl-3.5 pr-10 text-sm text-neutral-500 font-medium w-full h-full bg-light outline-none cursor-pointer">
                              <option value="NO">NO (+47)</option>
                              <option value="DK">DK (+45)</option>
                              <option value="SE">SE (+46)</option>
                              <option value="FI">FI (+358)</option>
                              <option value="EN">EN (+44)</option>
                            </select>
                            <svg
                              className="absolute top-1/2 right-4 transform -translate-y-1/2"
                              width={16}
                              height={22}
                              viewBox="0 0 16 22"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12.6673 9L8.00065 13.6667L3.33398 9"
                                stroke="#495460"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="w-full sm:flex-1">
                          <input
                            className="py-3 px-3.5 text-sm w-full h-full hover:bg-gray-50 outline-none placeholder-neutral-400"
                            id="inputsInput14-1"
                            type="text"
                            placeholder="99778899"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Epostadresse
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="sm:max-w-md ml-auto">
                      <input
                        //error: border-red-500
                        className="mb-2.5 py-2.5 px-3.5 text-sm w-full hover:bg-gray-50 outline-none placeholder-neutral-400 border rounded-lg"
                        id="inputsInput8-1"
                        type="text"
                        placeholder="ola.nordmann@mail.com"
                      />
                      {/*
                   
                ERROR
                  <p className="text-sm text-red-500">
                    Wrong email format. Enter correct email address
                  </p>
                     */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Språk (for din bruker)
                    </h3>
                    <p className="text-sm text-neutral-400"></p>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="relative h-full sm:max-w-md ml-auto">
                      <select
                        className="appearance-none py-2 pl-3.5 pr-10 text-sm w-full h-full bg-white hover:bg-gray-50 outline-none border border-neutral-200 focus:border-neutral-600 cursor-pointer rounded-lg"
                        id="inputsSelect4-1"
                      >
                        <option value="NO">Norsk</option>
                        <option value="SE">Svenska</option>
                        <option value="DK">Dansk</option>
                        <option value="FI">Soumi</option>
                        <option value="EN">English</option>
                      </select>
                      <svg
                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                        width={16}
                        height={22}
                        viewBox="0 0 16 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.6673 9L8.00065 13.6667L3.33398 9"
                          stroke="#0C1523"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      {/*=========================================================================*/}

      {settingspage === 2 && (
        <div className="w-full flex flex-col pb-10">
          <div className="container px-4 mx-auto pt-4">
            <div className="flex flex-row justify-between items-center">
              <h2 className="text-2xl font-semibold pb-2">Brukere</h2>
              <p></p>
              <div className="w-auto px-4">
                <div
                  className="cursor-pointer inline-flex flex-wrap items-center px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-lg transition duration-300"
                  onClick={handleCreateUserModal}
                >
                  Legg til
                </div>
              </div>
            </div>
            <hr />
          </div>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="pt-5 px-5 pb-6 bg-white border rounded-xl">
                <div className="mb-7">
                  <h3 className="mb-0 text-lg font-semibold">
                    Legg til, administrer og fjern brukere
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Du har brukt 3/4 tilgjengelige lisenser.{" "}
                    <span
                      onClick={() => setSettingspage(4)}
                      className="underline text-primary cursor-pointer"
                    >
                      Se oversikt
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap -m-3">
                  {users.map((user, index) => (
                    <div key={index} className="w-full p-3">
                      <div className="flex flex-wrap items-center justify-between -m-2">
                        <div className="w-auto p-2">
                          <div className="flex flex-wrap items-center -m-1.5">
                            <div className="w-auto p-1.5">
                              <img className="h-12" src={user.image} />
                            </div>
                            <div className="w-auto p-1.5">
                              <h3 className="font-heading mb-1 font-semibold">
                                {user.name} {user.lastname}
                              </h3>
                              <p className="text-xs text-neutral-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="w-auto p-2">
                          <div
                            onClick={() => setSelectedUser(user)}
                            className="cursor-pointer inline-flex flex-wrap items-center px-2.5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-lg transition duration-300"
                          >
                            <LuSettings2 />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedUser && (
                  <User
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                  />
                )}
                {createUserModal && (
                  <CreateUser onClose={() => setCreateUserModal(false)} />
                )}
              </div>
            </div>
          </section>
        </div>
      )}
      {/*=========================================================================*/}
      {settingspage === 3 && (
        <div className="w-full flex flex-col pb-10">
          <div className="container px-4 mx-auto pt-4">
            <h2 className="text-2xl font-semibold pb-2">
              Aktiverte Ekstrafunksjoner
            </h2>
            <hr />
          </div>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap -m-2">
                  {addons
                    .filter((addon) => activatedAddons.includes(addon.id))
                    .map((addon, index) => (
                      <div key={index} className="w-full sm:w-1/2 md:w-1/3 p-2">
                        <div
                          className={`p-4 h-full bg-white border hover:border-neutral-200 rounded-lg ${
                            addon.available ? "cursor-pointer" : "opacity-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between -m-2">
                            <div className="w-auto p-2">
                              <div className="flex flex-wrap items-center -m-1.5">
                                <div className="w-auto p-1.5 bg-bg rounded-lg text-primary shadow-sm shadow-black/25">
                                  <addon.icon size={30} />
                                </div>
                                <div className="flex-1 p-1.5">
                                  <h3 className="font-heading mb-0.5 font-semibold">
                                    {addon.name}
                                  </h3>
                                  <p className="text-xs text-neutral-500">
                                    {addon.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                              <div className="w-auto p-0">
                                <a
                                  className="inline-flex flex-wrap items-center justify-center px-1.5 py-1.5 w-full font-medium text-sm text-center text-black hover:text-black/75 rounded-lg"
                                  href="#"
                                >
                                  <LuInfo />
                                </a>
                              </div>
                              {addon.available && (
                                <div className="w-auto p-0">
                                  <a
                                    className="inline-flex flex-wrap items-center justify-center px-1.5 py-1.5 w-full font-medium text-sm text-center text-neutral-50 hover:text-neutral-100 bg-neutral-600 hover:bg-opacity-95 rounded-lg focus:ring-4 focus:ring-neutral-400"
                                    href="#"
                                  >
                                    <LuX size={16} />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>

          <div className="container px-4 mx-auto pt-4">
            <h2 className="text-2xl font-semibold pb-2">
              Flere Ekstrafunksjoner
            </h2>
            <hr />
          </div>

          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap -m-2">
                  {addons
                    .filter((addon) => !activatedAddons.includes(addon.id))
                    .map((addon, index) => (
                      <div key={index} className="w-full sm:w-1/2 md:w-1/3 p-2">
                        <div
                          className={`p-4 h-full bg-white border hover:border-neutral-200 rounded-lg ${
                            addon.available ? "cursor-pointer" : "opacity-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between -m-2">
                            <div className="w-auto p-2">
                              <div className="flex flex-wrap items-center -m-1.5">
                                <div className="w-auto p-1.5 bg-bg rounded-lg text-primary shadow-sm shadow-black/25">
                                  <addon.icon size={30} />
                                </div>
                                <div className="flex-1 p-1.5">
                                  <h3 className="font-heading mb-0.5 font-semibold">
                                    {addon.name}
                                  </h3>
                                  <p className="text-xs text-neutral-500">
                                    {addon.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                              <div className="w-auto p-0">
                                <a
                                  className="inline-flex flex-wrap items-center justify-center px-1.5 py-1.5 w-full font-medium text-sm text-center text-black hover:text-black/75 rounded-lg"
                                  href="#"
                                >
                                  <LuInfo />
                                </a>
                              </div>
                              {addon.available ? (
                                <div className="w-auto p-0">
                                  <a
                                    className="inline-flex flex-wrap items-center justify-center px-1.5 py-1.5 w-full font-medium text-sm text-center text-neutral-50 hover:text-neutral-100 bg-neutral-600 hover:bg-opacity-95 rounded-lg focus:ring-4 focus:ring-neutral-400"
                                    href="#"
                                  >
                                    <LuPlus size={16} />
                                  </a>
                                </div>
                              ) : (
                                <p className="text-xs">Kommer snart</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      {/*=========================================================================*/}
      {settingspage === 4 && (
        <div className="w-full flex flex-col pb-10">
          <div className="container px-4 mx-auto pt-4">
            <h2 className="text-2xl font-semibold pb-2">
              Betalingsinformasjon
            </h2>
            <hr />
          </div>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Betalingsmetode
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Vi tilbyr kun faktura per nå
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="relative h-full sm:max-w-md ml-auto">
                      <select
                        className="appearance-none py-2 pl-3.5 pr-10 text-sm w-full h-full bg-white hover:bg-gray-50 outline-none border border-neutral-200 focus:border-neutral-600 cursor-pointer rounded-lg"
                        id="inputsSelect4-1"
                      >
                        <option value="invoice">Faktura</option>
                        <option value="card" disabled>
                          Kort
                        </option>
                      </select>
                      <svg
                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                        width={16}
                        height={22}
                        viewBox="0 0 16 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.6673 9L8.00065 13.6667L3.33398 9"
                          stroke="#0C1523"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Betalingsfrekvens
                    </h3>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="flex flex-wrap items-center justify-end -m-1.5">
                      <div className="w-auto p-1.5">
                        <a className="text-sm" href="#">
                          Månedlig
                        </a>
                      </div>
                      <div className="w-auto p-1.5">
                        <a
                          className="flex items-center justify-start p-0.5 w-9 h-5 bg-neutral-200 rounded-full"
                          href="#"
                        >
                          <span className="relative inline-block w-4 h-4 bg-white rounded-full" />
                        </a>
                      </div>
                      <div className="w-auto p-1.5">
                        <a className="text-sm" href="#">
                          Årlig <span className="hidden">(10% rabatt)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-xl">
                <div className="flex flex-wrap justify-between -m-2">
                  <div className="w-full sm:w-1/2 p-2">
                    <h3 className="font-heading text-sm font-semibold">
                      Valuta
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Vi tilbyr kun faktura i Norske Kroner per nå
                    </p>
                  </div>
                  <div className="w-full sm:w-1/2 p-2">
                    <div className="relative h-full sm:max-w-md ml-auto">
                      <LuDollarSign className="text-[#B8C1CC] absolute top-1/2 left-3.5 transform -translate-y-1/2" />
                      <select
                        className="appearance-none py-2 pl-10 pr-10 text-sm w-full h-full bg-white hover:bg-gray-50 outline-none border border-neutral-200 focus:border-neutral-600 cursor-pointer rounded-lg"
                        id="inputsSelect6-1"
                      >
                        <option value="nok">NOK</option>
                        <option value="usd" disabled>
                          USD
                        </option>
                        <option value="dkk" disabled>
                          DKK
                        </option>
                        <option value="sek" disabled>
                          SEK
                        </option>
                      </select>
                      <svg
                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                        width={16}
                        height={22}
                        viewBox="0 0 16 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.6673 9L8.00065 13.6667L3.33398 9"
                          stroke="#0C1523"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/*
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="mb-2.5 bg-neutral-50 border border-neutral-100 rounded-xl">
                <div className="px-5 py-1">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-max">
                      <tbody>
                        <tr>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap items-center -m-2.5">
                              <div className="w-auto p-2.5">
                                <img
                                  src="/assets/elements/visa.svg"
                                  alt="Visa"
                                />
                              </div>
                              <div className="w-auto p-2.5">
                                <span className="block mb-1 text-sm font-semibold">
                                  Visa ending 4556
                                </span>
                                <span className="block text-xs text-neutral-500">
                                  Utløper 03/2025
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pl-4">
                            <div className="flex items-center justify-end">
                              <div className="flex items-center mr-5 px-2 py-1.5 bg-green-500 bg-opacity-10 rounded-lg">
                                <svg
                                  className="mr-1.5"
                                  width={16}
                                  height={17}
                                  viewBox="0 0 16 17"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M7.99961 14.9C11.5342 14.9 14.3996 12.0346 14.3996 8.50001C14.3996 4.96538 11.5342 2.10001 7.99961 2.10001C4.46499 2.10001 1.59961 4.96538 1.59961 8.50001C1.59961 12.0346 4.46499 14.9 7.99961 14.9ZM10.9653 7.46569C11.2777 7.15327 11.2777 6.64674 10.9653 6.33432C10.6529 6.0219 10.1463 6.0219 9.83392 6.33432L7.19961 8.96863L6.16529 7.93432C5.85288 7.6219 5.34634 7.6219 5.03392 7.93432C4.7215 8.24674 4.7215 8.75327 5.03392 9.06569L6.63392 10.6657C6.94634 10.9781 7.45288 10.9781 7.76529 10.6657L10.9653 7.46569Z"
                                    fill="#20C43A"
                                  />
                                </svg>
                                <span className="text-xs text-green-500 font-medium">
                                  Primær
                                </span>
                              </div>
                              <a
                                className="inline-block text-sm hover:text-neutral-700 font-medium"
                                href="#"
                              >
                                Rediger
                              </a>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-50 border border-neutral-100 rounded-xl">
                <div className="px-5 py-1">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-max">
                      <tbody>
                        <tr>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap items-center -m-2.5">
                              <div className="w-auto p-2.5">
                                <img
                                  src="/assets/elements/visa.svg"
                                  alt="Visa"
                                />
                              </div>
                              <div className="w-auto p-2.5">
                                <span className="block mb-1 text-sm font-semibold">
                                  Visa ending 7755
                                </span>
                                <span className="block text-xs text-neutral-500">
                                  Utløper 04/2027
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pl-4">
                            <div className="flex items-center justify-end">
                              <a
                                className="inline-block mr-5 text-sm text-gray-300 font-medium"
                                href="#"
                              >
                                Sett som primær
                              </a>
                              <a
                                className="inline-block text-sm hover:text-neutral-700 font-medium"
                                href="#"
                              >
                                Rediger
                              </a>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
          */}
          <div className="container px-4 mx-auto pt-4">
            <div className="flex flex-row justify-between items-center">
              <h2 className="text-2xl font-semibold pb-2">Lisenser</h2>
              <p></p>
              <div className="w-auto px-4">
                <div
                  className="inline-flex cursor-pointer flex-wrap items-center px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-lg transition duration-300"
                  onClick={handleAddLicenseModal}
                >
                  Legg til
                </div>
              </div>
              {addLicenseModal && (
                <AddLicense onClose={() => setAddLicenseModal(false)} />
              )}
            </div>
            <hr />
          </div>

          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              {licenses.map((license) => (
                <div
                  key={license.id}
                  className="bg-neutral-50 border border-neutral-100 rounded-xl mb-4"
                >
                  <div className="px-5 py-1">
                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-max">
                        <tbody>
                          <tr>
                            <td className="py-3 pr-4">
                              <div className="flex flex-wrap items-center -m-2.5">
                                <div className="w-auto p-2.5">
                                  <LuFileKey2 />
                                </div>
                                <div className="w-auto p-2.5">
                                  <span className="block mb-1 text-sm font-semibold">
                                    {license.label}
                                  </span>
                                  {license.available === false ? (
                                    <span className="block text-xs text-neutral-500">
                                      {license.assignedTo}
                                    </span>
                                  ) : (
                                    <span className="block text-xs text-neutral-500">
                                      Ledig
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pl-4">
                              <div className="flex items-center justify-end">
                                <div
                                  onClick={handleEditLicenseModal}
                                  className="w-auto p-2"
                                >
                                  <div className="cursor-pointer inline-flex flex-wrap items-center px-2.5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-lg transition duration-300">
                                    <LuPencil />
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {editLicenseModal && (
              <EditLicense onClose={() => setEditLicenseModal(false)} />
            )}
          </section>

          <div className="container px-4 mx-auto pt-4">
            <h2 className="text-2xl font-semibold pb-2">Kostnad</h2>
            <hr />
          </div>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="px-6 pt-5 pb-7 bg-white overflow-hidden border rounded-xl">
                <h3 className="text-lg font-semibold">Abonnementsoversikt</h3>
                <p className="mb-6 text-neutral-500">
                  Oversikt over ditt abonnement
                </p>
                <ul className="mb-7">
                  <li className="flex flex-wrap items-center justify-between mb-4">
                    <div className="flex flex-wrap items-center mr-4">
                      <div className="mr-2 w-3.5 h-3.5 rounded-full bg-primary" />
                      <span className="font-medium">Lisenser (4)</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <p>
                        <span className="text-xs text-gray-500">4x</span> 990,-
                      </p>
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx={10} cy={10} r={10} fill="red" />
                        <path
                          d="M5.91602 10.5833L8.24935 12.9166L14.0827 7.08325"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </li>
                  <li className="flex flex-wrap items-center justify-between mb-4">
                    <div className="flex flex-wrap items-center mr-4">
                      <div className="mr-2 w-3.5 h-3.5 rounded-full bg-secondary" />
                      <span className="font-medium">Administrator lisens</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <p>0,-</p>
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx={10} cy={10} r={10} fill="red" />
                        <path
                          d="M5.91602 10.5833L8.24935 12.9166L14.0827 7.08325"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </li>
                  <li className="flex flex-wrap items-center justify-between mb-4">
                    <div className="flex flex-wrap items-center mr-4">
                      <div className="mr-2 w-3.5 h-3.5 rounded-full bg-red-200" />
                      <span className="font-medium">
                        Ekstrafunksjon: Egendefinert domene
                      </span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <p>49,-</p>
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx={10} cy={10} r={10} fill="red" />
                        <path
                          d="M5.91602 10.5833L8.24935 12.9166L14.0827 7.08325"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </li>
                  <li className="flex flex-wrap items-center justify-between">
                    <div className="flex flex-wrap items-center mr-4">
                      <div className="mr-2 w-3.5 h-3.5 rounded-full bg-red-200" />
                      <span className="font-medium">
                        Ekstrafunksjon: Melding etter anrop
                      </span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <p>199,-</p>
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx={10} cy={10} r={10} fill="red" />
                        <path
                          d="M5.91602 10.5833L8.24935 12.9166L14.0827 7.08325"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </li>
                </ul>
                {/*
                <div className="inline-flex opacity-25 flex-wrap items-center justify-center px-5 py-3 w-full text-center text-neutral-50 font-medium bg-primary hover:bg-primary rounded-lg transition duration-300">
                  <LuSquarePen className="mr-2.5" size={16} />
                  <span className="font-medium">Administrer</span>
                </div>
                */}
              </div>
            </div>
          </section>
          {/*
          <PaymentHistory />
          */}
        </div>
      )}
      {/*=========================================================================*/}
      {settingspage === 5 && (
        <>
          <p>rapport - eksport etc</p>
        </>
      )}
    </div>
  );
}
