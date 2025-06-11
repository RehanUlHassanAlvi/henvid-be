"use client";
import React, { useState } from "react";
import { LuFileKey2 } from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
interface EditLicenseProps {
  onClose: () => void;
}

export default function EditLicense({ onClose }: EditLicenseProps) {
  const [deleteState, setDeleteState] = useState(false);
  const handleDeleteState = () => {
    setDeleteState(true);
  };
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center flex-wrap py-20 bg-neutral-500 bg-opacity-80 overflow-y-auto">
      <div className="container px-4 mx-auto">
        {deleteState ? (
          <div className="pt-10 px-6 pb-12 text-center max-w-lg mx-auto bg-white border rounded-xl shadow-3xl">
            <div className="w-full mx-auto text-center flex justify-center items-center py-4">
              <LuFileKey2 size={30} />
            </div>

            <h3 className="font-heading mb-2 text-xl font-semibold">
              Slett Lisens
            </h3>
            <p className="mb-6 text-neutral-500">
              Du kan kun slette overflødig lisenser, den må altså fjernes fra en
              bruker før den kan slettes.
            </p>
            <div className="flex flex-wrap justify-center -m-1">
              <div className="w-auto p-1">
                <div
                  className="inline-flex cursor-pointer px-5 py-2.5 text-sm font-medium border border-neutral-200 hover:border-neutral-300 rounded-lg"
                  onClick={() => setDeleteState(false)}
                >
                  Avbryt
                </div>
              </div>
              <div className="w-auto p-1">
                <div
                  className="inline-flex cursor-pointer px-5 py-2.5 text-sm text-neutral-50 font-medium bg-primary hover:bg-secondary rounded-lg transition duration-300"
                  onClick={onClose}
                >
                  Slett
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative pt-10 px-6 pb-12 text-center max-w-lg mx-auto bg-white border rounded-xl shadow-3xl">
            <div
              onClick={handleDeleteState}
              className="absolute cursor-pointer top-6 right-6 group"
            >
              <RiDeleteBin6Line
                size={20}
                className="text-sm text-primary group-hover:text-secondary"
              />
            </div>
            <div className="w-full mx-auto text-center flex justify-center items-center py-4">
              <LuFileKey2 size={30} />
            </div>

            <h3 className="font-heading mb-2 text-xl font-semibold">
              Tildel Lisens
            </h3>
            <p className="mb-6 text-neutral-500">
              Tildel lisensen til en ledig bruker, <br />
              om du velger &quot;Ikke tildelt&quot; vil den være ledig.
            </p>

            <div className="flex flex-wrap justify-between -m-2">
              <div className="w-full p-2 mb-8">
                <div className="relative h-full sm:max-w-md ml-auto">
                  <select
                    className="appearance-none py-2 pl-3.5 pr-10 text-sm w-full h-full bg-white hover:bg-gray-50 outline-none border border-neutral-200 focus:border-neutral-600 cursor-pointer rounded-lg"
                    id="inputsSelect4-1"
                  >
                    <option value="0">Ikke tildelt</option>
                    <option value="1" disabled>
                      Ola Nordmann
                    </option>
                    <option value="2" disabled>
                      Kari Nordmann
                    </option>
                    <option value="3" disabled>
                      Hennig Olsen
                    </option>
                    <option value="4">Henrik Ibsen</option>
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

            <div className="flex flex-nowrap justify-center -m-1">
              <div className="w-auto p-1">
                <div
                  className="inline-flex cursor-pointer px-5 py-2.5 text-sm font-medium border border-neutral-200 hover:border-neutral-300 rounded-lg"
                  onClick={onClose}
                >
                  Avbryt
                </div>
              </div>
              <div className="w-auto p-1">
                <div
                  className="inline-flex cursor-pointer px-5 py-2.5 text-sm text-neutral-50 font-medium bg-primary hover:bg-secondary rounded-lg transition duration-300"
                  onClick={onClose}
                >
                  Lagre
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
