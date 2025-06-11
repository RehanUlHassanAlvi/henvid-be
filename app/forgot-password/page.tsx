"use client";
import { logo } from "@/utils/constants";
import React, { useState } from "react";

export default function ForgotPasswordpage() {
  const [requested, setRequested] = useState(false);
  const handleResetRequest = () => {
    setRequested(true);
  };
  return (
    <>
      <section className="py-10 bg-bg overflow-hidden lg:pt-20">
        <div className="container mx-auto px-2 lg:px-4">
          <div className="pt-16 pb-24 md:pb-52 md:max-w-3xl mx-auto bg-highlight rounded-3xl px-4">
            <img
              className="mb-16 lg:mb-24 mx-auto max-h-14"
              src={logo}
              alt="Henvid.com"
            />
            <div className="md:max-w-md mx-auto">
              <div className="mb-10 text-center">
                <h2 className="font-heading mb-4 text-4xl md:text-5xl text-black font-black tracking-tight">
                  Glemt passord?
                </h2>
                <p className="text-gray-500 font-bold">
                  Frykt ikke, skriv inn epostadressen din så hjelper vi deg
                  bytte passord
                </p>
              </div>
              {requested ? (
                <p className="text-center text-sm text-primary">
                  Flott, vi sender deg en epost! sjekk spam mappen om du ikke
                  skulle finne den i innboksen din.
                </p>
              ) : (
                <form>
                  <div className="flex flex-wrap -m-3">
                    <div className="w-full p-3">
                      <label
                        className="block mb-2 text-sm text-gray-500 font-bold"
                        htmlFor="forgot-email"
                      >
                        Epostadresse
                      </label>
                      <input
                        className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                        id="forgot-email"
                        type="email"
                        placeholder=""
                      />
                    </div>

                    <div className="w-full p-3">
                      <div className="flex flex-wrap md:justify-end -m-2">
                        <div className="w-full p-2">
                          <div
                            onClick={handleResetRequest}
                            className="cursor-pointer block px-8 py-3.5 text-lg text-center text-white font-bold bg-primary hover:bg-secondary focus:ring-4 focus:ring-red-200 rounded-xl"
                          >
                            Reset passord
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
