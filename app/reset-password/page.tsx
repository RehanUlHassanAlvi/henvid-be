"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logo } from "@/utils/constants";

export default function ResetPasswordpage() {
  const [countdown, setCountdown] = useState(5);
  const [requestedReset, setRequestedReset] = useState(false);
  const router = useRouter();
  const handleResetRequest = () => {
    setRequestedReset(true);
    setCountdown(5);
  };

  useEffect(() => {
    if (!requestedReset) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [requestedReset]);

  useEffect(() => {
    if (requestedReset && countdown === 0) {
      router.push("/login"); // Safe redirect here
    }
  }, [countdown, requestedReset, router]);

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
                  Nytt passord
                </h2>
                <p className="text-gray-500 font-bold">
                  Skriv inn ønsket passord, dette vil overskrive ditt gamle
                  passord og du kan så logge inn igjen.
                </p>
              </div>
              {requestedReset ? (
                <p className="text-sm pt-2 text-center text-primary">
                  Du blir videresendt til innloggingssiden om{" "}
                  <span className="font-bold">{countdown}</span> sekunder.
                </p>
              ) : (
                <form>
                  <div className="flex flex-wrap -m-3">
                    <div className="w-full p-3">
                      <label
                        className="block mb-2 text-sm text-gray-500 font-bold"
                        htmlFor="reset-password-1"
                      >
                        Nytt passord
                      </label>
                      <div className="border border-gray-200 overflow-hidden rounded-xl focus-within:ring-4 focus-within:ring-red-200">
                        <div className="flex flex-wrap">
                          <div className="flex-1">
                            <input
                              className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none"
                              id="reset-password-1"
                              type="password"
                              placeholder=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full p-3">
                      <label
                        className="block mb-2 text-sm text-gray-500 font-bold"
                        htmlFor="reset-password-2"
                      >
                        Gjenta nytt passord
                      </label>
                      <div className="border border-gray-200 overflow-hidden rounded-xl focus-within:ring-4 focus-within:ring-red-200">
                        <div className="flex flex-wrap">
                          <div className="flex-1">
                            <input
                              className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none"
                              id="reset-password-2"
                              type="password"
                              placeholder=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full p-3">
                      <div className="flex flex-wrap md:justify-end -m-2">
                        <div className="w-full p-2">
                          <div
                            onClick={handleResetRequest}
                            className="cursor-pointer block px-8 py-3.5 text-lg text-center text-white font-bold bg-primary hover:bg-secondary focus:ring-4 focus:ring-red-200 rounded-xl"
                          >
                            Oppdater
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
