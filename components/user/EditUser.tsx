import Image from "next/image";
import React from "react";
import { LuX } from "react-icons/lu";

interface EditUserProps {
  onClose: () => void;
}

export default function CreateUser({ onClose }: EditUserProps) {
  return (
    <>
      <section className="fixed inset-0 flex items-center justify-center flex-wrap overflow-y-auto">
        <div
          onClick={onClose}
          className="w-full h-full bg-neutral-500 bg-opacity-80 z-20 relative py-20"
        />
        <div className="container px-4 mx-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="pt-5 max-w-lg mx-auto bg-neutral-50 border border-neutral-100 rounded-xl">
            <div className="px-6 pb-7">
              <div className="flex flex-nowrap justify-between mb-5 -m-2">
                <div className="w-auto p-2">
                  <h3 className="font-heading mb-1 text-lg text-neutral-600 font-semibold">
                    Rediger bruker
                  </h3>
                  <p className="text-sm text-neutral-400 font-medium">
                    Oppdater informasjonen om brukeren
                  </p>
                </div>
                <div className="w-10 p-2">
                  <button onClick={onClose} className="relative top-1">
                    <LuX size={20} className="text-tertiary" />
                  </button>
                </div>
              </div>
              <div className="w-full p-3">
                <label
                  className="block mb-2 text-sm text-gray-500 font-bold"
                  htmlFor="createuser-image"
                >
                  Bilde
                </label>
                <div className="flex flex-row">
                  <div className="w-auto p-1 pr-2">
                    <Image
                      src="/assets/elements/avatar2.png"
                      alt="Uploaded image"
                      height={200}
                      width={200}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <input
                    className="appearance-none px-6 py-3.5 w-full text-sm text-gray-500 font-bold bg-white placeholder-gray-400 outline-none border border-gray-200 rounded-xl"
                    id="createuser-image"
                    type="upload"
                    placeholder="Last opp et bilde av brukeren"
                  />
                  <div className="flex whitespace-nowrap items-center justify-center px-6 py-0.5 text-sm text-white font-semibold bg-neutral-600 rounded-tr-lg rounded-br-lg focus:ring-4 focus:ring-neutral-400">
                    Last opp
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-0">
                <div className="w-full p-3">
                  <label
                    className="block mb-2 text-sm text-gray-500 font-bold"
                    htmlFor="createuser-name"
                  >
                    Fornavn
                  </label>

                  <input
                    className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                    id="createuser-name"
                    type="email"
                    placeholder=""
                  />
                </div>
                <div className="w-full p-3">
                  <label
                    className="block mb-2 text-sm text-gray-500 font-bold"
                    htmlFor="createuser-lastname"
                  >
                    Etternavn
                  </label>

                  <input
                    className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                    id="createuser-lastname"
                    type="email"
                    placeholder=""
                  />
                </div>
              </div>
              <div className="w-full p-3">
                <label
                  className="block mb-2 text-sm text-gray-500 font-bold"
                  htmlFor="createuser-email"
                >
                  Epostadresse
                </label>
                <input
                  className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                  id="createuser-email"
                  type="email"
                  placeholder=""
                />
              </div>
              <div className="w-full p-3">
                <label
                  className="block mb-2 text-sm text-gray-500 font-bold"
                  htmlFor="createuser-phone"
                >
                  Telefonnummer
                </label>
                <input
                  className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                  id="createuser-phone"
                  type="tel"
                  placeholder=""
                />
              </div>
              <div className="w-full p-3">
                <div className="flex flex-nowrap md:justify-end -m-2">
                  <div className="w-full p-2">
                    <div
                      onClick={onClose}
                      className="block cursor-pointer px-8 py-3.5 text-lg text-center text-tertiary font-bold bg-bg hover:bg-white border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                    >
                      Avbryt
                    </div>
                  </div>
                  <div className="w-full p-2">
                    <div
                      onClick={onClose}
                      className="block cursor-pointer px-8 py-3.5 text-lg text-center text-white font-bold bg-primary hover:bg-secondary focus:ring-4 focus:ring-red-200 rounded-xl"
                    >
                      Oppdater
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
