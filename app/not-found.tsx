import { logo } from "@/utils/constants";
import Link from "next/link";
import React from "react";

export default function Notfound() {
  return (
    <>
      <section className="py-10 bg-bg overflow-hidden h-dvh">
        <div className="container mx-auto px-4">
          <div className="py-20 px-8 bg-highlight rounded-3xl">
            <div className="pt-20 pb-32 md:pt-36 md:pb-64 max-w-7xl mx-auto">
              <div className="md:max-w-md">
                <img className="mb-20 h-10" src={logo} alt="Henvid.com" />
                <h3 className="font-heading text-2xl text-primary font-black tracking-tight">
                  404
                </h3>
                <h2 className="font-heading mb-6 text-4xl md:text-5xl lg:text-6xl text-gray-900 font-black tracking-tight">
                  Page not found
                </h2>
                <p className="mb-6 text-gray-500 font-bold">
                  We’re sorry, the page you requested could not be found. Please
                  go back to the homepage
                </p>
                <div className="flex flex-wrap -m-2">
                  <div className="w-full md:w-auto p-2">
                    <Link
                      className="block w-full px-4 py-2.5 text-sm text-center text-white font-bold bg-primary hover:bg-secondary focus:ring-4 focus:ring-red-200 rounded-lg"
                      href="/"
                    >
                      Go back to Homepage
                    </Link>
                  </div>
                  <div className="w-full md:w-auto p-2">
                    <a
                      className="block w-full px-4 py-2.5 text-sm text-center text-gray-900 font-bold bg-white hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 rounded-lg"
                      href="#"
                    >
                      Try Again
                    </a>
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
