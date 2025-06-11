import { logo } from "@/utils/constants";
import Link from "next/link";
import React from "react";

export default function Loginpage() {
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
                  Velkommen
                </h2>
                <p className="text-gray-500 font-bold">
                  Fyll ut dine detaljer for å logge inn
                </p>
              </div>
              <form>
                <div className="flex flex-wrap -m-3">
                  <div className="w-full p-3">
                    <label
                      className="block mb-2 text-sm text-gray-500 font-bold"
                      htmlFor="login-email"
                    >
                      Epostadresse
                    </label>
                    <input
                      className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                      id="login-email"
                      type="email"
                      placeholder=""
                    />
                  </div>
                  <div className="w-full p-3">
                    <label
                      className="block mb-2 text-sm text-gray-500 font-bold"
                      htmlFor="login-password"
                    >
                      Passord
                    </label>
                    <div className="border border-gray-200 overflow-hidden rounded-xl focus-within:ring-4 focus-within:ring-red-200">
                      <div className="flex flex-wrap">
                        <div className="flex-1">
                          <input
                            className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none"
                            id="login-password"
                            type="password"
                            placeholder=""
                          />
                        </div>
                        <div className="w-auto">
                          <Link
                            className="flex items-center pr-4 text-primary hover:text-secondary h-full bg-white font-bold"
                            href="/forgot-password"
                          >
                            Glemt passord?
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full p-3">
                    <div className="flex flex-wrap md:justify-end -m-2">
                      <div className="w-full p-2">
                        <Link
                          className="block px-8 py-3.5 text-lg text-center text-white font-bold bg-primary hover:bg-secondary focus:ring-4 focus:ring-red-200 rounded-xl"
                          href="/dashboard"
                        >
                          Logg inn
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="w-full p-3 hidden">
                    <p className="text-gray-600 text-center font-bold">
                      <span>Har du ikke konto?</span>
                      <a
                        className="text-primary hover:text-secondary font-bold"
                        href="#"
                      >
                        Registrer ditt firma her
                      </a>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
