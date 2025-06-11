"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Logoutpage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      router.push("/");
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="w-full h-dvh bg-bg">
      <div className="w-full mx-auto container h-full">
        <div className="w-full h-[70vh] flex flex-col justify-center items-center">
          <div className="w-full items-center flex flex-col justify-center pb-10">
            <h1 className="text-xl md:text-3xl font-semibold text-center">
              Du er nå logget ut
            </h1>

            <p className="text-sm pt-2 text-center">
              Du blir sendt til forsiden om{" "}
              <span className="font-bold">{countdown}</span> sekunder, klikk
              under for å logge inn igjen
            </p>
          </div>
          <Link href="/login">
            <button className="bg-primary shadow-sm shadow-black/25 rounded-xl py-4 px-8 w-auto text-white uppercase font-bold">
              Logg inn
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
