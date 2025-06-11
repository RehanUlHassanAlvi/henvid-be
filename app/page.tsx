import { NO } from "@/components/flags";
import { logo } from "@/utils/constants";
import Link from "next/link";
import React from "react";

export default function Welcomepage() {
  return (
    <>
      <section className="py-10 bg-bg min-h-dvh overflow-hidden lg:pt-20">
        <div className="container mx-auto px-2 lg:px-4 h-full">
          <div className="py-24 md:py-52 md:max-w-3xl mx-auto bg-highlight/0 w-full h-full rounded-3xl px-4 flex flex-col items-center justify-between">
            <img
              className="mb-16 lg:mb-24 mx-auto max-h-20"
              src={logo}
              alt="Henvid.com"
            />
            <div className="md:max-w-md mx-auto flex flex-col pt-20">
              <div className="mb-10 text-center">
                <h2 className="font-heading mb-4 text-4xl md:text-5xl text-black font-black tracking-tight"></h2>
                <p className="text-gray-500 font-bold"></p>
              </div>
              <form>
                <div className="flex flex-wrap -m-3">
                  <div className="w-full p-3">
                    <div className="flex flex-wrap md:justify-end -m-2">
                      <div className="w-full p-2">
                        <Link
                          className="block px-8 py-3.5 text-lg text-center text-white font-bold bg-primary hover:bg-secondary focus:ring-4 focus:ring-red-200 rounded-xl"
                          href="/login"
                        >
                          Logg inn
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="w-full p-3">
                    <div className="flex flex-wrap md:justify-end -m-2">
                      <div className="w-full p-2">
                        <Link
                          className="block px-8 py-3.5 text-lg text-center text-white font-bold bg-tertiary hover:bg-tertiary/90 focus:ring-4 focus:ring-red-200 rounded-xl"
                          href="/register"
                        >
                          Registrer deg som kunde
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="w-full p-3">
                    <p className="text-gray-600 text-center font-bold">
                      <span>Lurer du på noe?&nbsp;</span>
                      <a
                        className="text-primary hover:text-secondary font-bold underline"
                        href="https://www.henvid.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Les mer om Henvid her &rarr;
                      </a>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="w-full bg-primary absolute bottom-0">
          <div className="max-w-none px-4 mx-auto w-full flex justify-between items-center">
            <a
              href="https://www.henvid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex flex-row gap-2 items-center justify-start text-start"
            >
              <p className="text-white font-medium font-sans underline">
                www.henvid.com
              </p>
            </a>
            <div className="w-auto px-4 flex cursor-pointer flex-row gap-2 bg-bg/25 py-2 items-center justify-end text-end">
              <NO />
              <p className="font-semibold font-sans">Norsk</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
