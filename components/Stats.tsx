import { users } from "@/utils/store2";
import React, { useState } from "react";
//import { LuBugOff, LuCreditCard, LuPhoneCall } from "react-icons/lu";
import { LuMessageCircleQuestion, LuStar, LuX } from "react-icons/lu";

export default function Stats() {
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  return (
    <>
      <section className="relative w-full">
        <div className="mx-auto">
          <div className="container px-4 mx-auto pt-8">
            <h2 className="text-2xl font-semibold pb-2">Statistikk</h2>
            <hr />
          </div>
          {/*INPUT FIELDS */}
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="pt-5 bg-neutral-50 flex flex-row overflow-hidden border border-neutral-100 rounded-xl">
                <div className="w-full md:w-1/4 px-4 mb-4 md:mb-0">
                  <div className="mb-6">
                    <div className="flex flex-row gap-2 items-center justify-start mb-2.5">
                      <label className="block font-heading text-sm font-semibold">
                        Kostnad spart ved løst samtale (valgfritt)
                      </label>
                      <div
                        onClick={() => setIsPopUpOpen(true)}
                        className="text-primary cursor-pointer"
                      >
                        <LuMessageCircleQuestion size={16} />
                      </div>
                      {isPopUpOpen && (
                        <div
                          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                          onClick={() => setIsPopUpOpen(false)} // background click closes
                        >
                          <div
                            className="bg-highlight p-6 rounded-lg relative max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()} // prevent modal close on inner click
                          >
                            <button
                              className="absolute top-2 right-2 text-gray-500 cursor-pointer"
                              onClick={() => setIsPopUpOpen(false)}
                            >
                              <LuX size={20} />
                            </button>
                            <h2 className="text-lg font-semibold mb-4">
                              Kostnad spart ved løst samtale
                            </h2>
                            <p className="text-sm text-gray-700">
                              Dette kan være kostnad ved å sende ut tekniker,
                              kjøring og timekost. Dette er et valgfritt felt og
                              vil brukes til å utregne litt statistikk for dere.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      className="py-2.5 px-3.5 text-sm w-full hover:bg-gray-50 outline-none placeholder-neutral-400 border border-neutral-200 rounded-lg focus-within:border-neutral-600"
                      type="number"
                      placeholder=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* GENERELL STATISTIKK*/}
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="flex flex-wrap -m-3">
                <div className="w-full sm:w-1/2 lg:w-1/4 p-3">
                  <div className="px-5 py-3 h-full bg-white rounded-lg">
                    <p className="mb-2.5 text-sm text-neutral-500 font-medium">
                      Videosamtaler
                    </p>
                    <div className="flex flex-wrap items-center mb-2 -m-1">
                      <div className="w-auto p-1">
                        <h3 className="font-heading text-3xl font-semibold">
                          943
                        </h3>
                      </div>
                      <div className="w-auto p-1">
                        <div className="flex flex-wrap items-center py-px px-1 border border-green-500 rounded-full">
                          <svg
                            className="mr-0.5"
                            width={15}
                            height={10}
                            viewBox="0 0 15 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8.16667 0.916748C7.75245 0.916748 7.41667 1.25253 7.41667 1.66675C7.41667 2.08096 7.75245 2.41675 8.16667 2.41675V0.916748ZM13.5 1.66675H14.25C14.25 1.25253 13.9142 0.916748 13.5 0.916748V1.66675ZM12.75 7.00008C12.75 7.41429 13.0858 7.75008 13.5 7.75008C13.9142 7.75008 14.25 7.41429 14.25 7.00008H12.75ZM0.96967 7.80308C0.676777 8.09598 0.676777 8.57085 0.96967 8.86374C1.26256 9.15664 1.73744 9.15664 2.03033 8.86374L0.96967 7.80308ZM5.5 4.33341L6.03033 3.80308C5.73744 3.51019 5.26256 3.51019 4.96967 3.80308L5.5 4.33341ZM8.16667 7.00008L7.63634 7.53041C7.92923 7.8233 8.4041 7.8233 8.697 7.53041L8.16667 7.00008ZM8.16667 2.41675H13.5V0.916748H8.16667V2.41675ZM12.75 1.66675V7.00008H14.25V1.66675H12.75ZM2.03033 8.86374L6.03033 4.86374L4.96967 3.80308L0.96967 7.80308L2.03033 8.86374ZM4.96967 4.86374L7.63634 7.53041L8.697 6.46975L6.03033 3.80308L4.96967 4.86374ZM8.697 7.53041L14.0303 2.19708L12.9697 1.13642L7.63634 6.46975L8.697 7.53041Z"
                              fill="#20C43A"
                            />
                          </svg>
                          <span className="text-xs text-green-500 font-medium">
                            16%
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 font-medium">
                      Totalt
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/4 p-3">
                  <div className="px-5 py-3 h-full bg-white rounded-lg">
                    <p className="mb-2.5 text-sm text-neutral-500 font-medium">
                      Antall løste saker
                    </p>
                    <div className="flex flex-wrap items-center mb-2 -m-1">
                      <div className="w-auto p-1">
                        <h3 className="font-heading text-3xl font-semibold">
                          855
                        </h3>
                      </div>
                      <div className="w-auto p-1">
                        <div className="flex flex-wrap items-center py-px px-1 border border-green-500 rounded-full">
                          <span className="text-xs text-green-500 font-medium">
                            86%
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 font-medium">
                      Totalt
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/4 p-3">
                  <div className="px-5 py-3 h-full bg-white rounded-lg">
                    <p className="mb-2.5 text-sm text-neutral-500 font-medium">
                      Antall ikke løste saker
                    </p>
                    <div className="flex flex-wrap items-center mb-2 -m-1">
                      <div className="w-auto p-1">
                        <h3 className="font-heading text-3xl font-semibold">
                          94
                        </h3>
                      </div>
                      <div className="w-auto p-1">
                        <div className="flex flex-wrap items-center py-px px-1 border border-red-500 rounded-full">
                          <span className="text-xs text-red-500 font-medium">
                            14%
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 font-medium">
                      Totalt
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/4 p-3">
                  <div className="px-5 py-3 h-full bg-white rounded-lg">
                    <p className="mb-2.5 text-sm text-neutral-500 font-medium">
                      Spart på utsendinger
                    </p>
                    <div className="flex flex-wrap items-center mb-2 -m-1">
                      <div className="w-auto p-1">
                        <h3 className="font-heading text-3xl font-semibold">
                          24k
                        </h3>
                      </div>
                      <div className="w-auto p-1">
                        <div className="flex flex-wrap items-center py-px px-1 border border-green-500 rounded-full">
                          <svg
                            className="mr-0.5"
                            width={15}
                            height={10}
                            viewBox="0 0 15 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8.16667 0.916748C7.75245 0.916748 7.41667 1.25253 7.41667 1.66675C7.41667 2.08096 7.75245 2.41675 8.16667 2.41675V0.916748ZM13.5 1.66675H14.25C14.25 1.25253 13.9142 0.916748 13.5 0.916748V1.66675ZM12.75 7.00008C12.75 7.41429 13.0858 7.75008 13.5 7.75008C13.9142 7.75008 14.25 7.41429 14.25 7.00008H12.75ZM0.96967 7.80308C0.676777 8.09598 0.676777 8.57085 0.96967 8.86374C1.26256 9.15664 1.73744 9.15664 2.03033 8.86374L0.96967 7.80308ZM5.5 4.33341L6.03033 3.80308C5.73744 3.51019 5.26256 3.51019 4.96967 3.80308L5.5 4.33341ZM8.16667 7.00008L7.63634 7.53041C7.92923 7.8233 8.4041 7.8233 8.697 7.53041L8.16667 7.00008ZM8.16667 2.41675H13.5V0.916748H8.16667V2.41675ZM12.75 1.66675V7.00008H14.25V1.66675H12.75ZM2.03033 8.86374L6.03033 4.86374L4.96967 3.80308L0.96967 7.80308L2.03033 8.86374ZM4.96967 4.86374L7.63634 7.53041L8.697 6.46975L6.03033 3.80308L4.96967 4.86374ZM8.697 7.53041L14.0303 2.19708L12.9697 1.13642L7.63634 6.46975L8.697 7.53041Z"
                              fill="#20C43A"
                            />
                          </svg>
                          <span className="text-xs text-green-500 font-medium">
                            6%
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 font-medium">
                      Totalt
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/5 p-3 hidden">
                  <div className="px-5 py-3 h-full bg-white rounded-lg">
                    <p className="mb-2.5 text-sm text-neutral-500 font-medium">
                      Kostnad for bruk
                    </p>
                    <div className="flex flex-wrap items-center mb-2 -m-1">
                      <div className="w-auto p-1">
                        <h3 className="font-heading text-3xl font-semibold">
                          7k
                        </h3>
                      </div>
                      <div className="w-auto p-1">
                        <div className="flex flex-wrap items-center py-px px-1 border border-red-500 rounded-full">
                          <svg
                            className="mr-0.5"
                            width={14}
                            height={10}
                            viewBox="0 0 14 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.66667 7.58341C7.25245 7.58341 6.91667 7.9192 6.91667 8.33341C6.91667 8.74763 7.25245 9.08341 7.66667 9.08341V7.58341ZM13 8.33341V9.08341C13.4142 9.08341 13.75 8.74763 13.75 8.33341H13ZM13.75 3.00008C13.75 2.58587 13.4142 2.25008 13 2.25008C12.5858 2.25008 12.25 2.58587 12.25 3.00008H13.75ZM1.53033 1.13642C1.23744 0.843525 0.762563 0.843525 0.46967 1.13642C0.176777 1.42931 0.176777 1.90418 0.46967 2.19708L1.53033 1.13642ZM5 5.66675L4.46967 6.19708C4.76256 6.48997 5.23744 6.48997 5.53033 6.19708L5 5.66675ZM7.66667 3.00008L8.197 2.46975C7.9041 2.17686 7.42923 2.17686 7.13634 2.46975L7.66667 3.00008ZM7.66667 9.08341H13V7.58341H7.66667V9.08341ZM13.75 8.33341V3.00008H12.25V8.33341H13.75ZM0.46967 2.19708L4.46967 6.19708L5.53033 5.13642L1.53033 1.13642L0.46967 2.19708ZM5.53033 6.19708L8.197 3.53041L7.13634 2.46975L4.46967 5.13642L5.53033 6.19708ZM7.13634 3.53041L12.4697 8.86374L13.5303 7.80308L8.197 2.46975L7.13634 3.53041Z"
                              fill="#FF3131"
                            />
                          </svg>
                          <span className="text-xs text-red-500 font-medium">
                            5%
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 font-medium">
                      Totalt
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/*
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="px-6 pt-5 pb-7 bg-white border rounded-xl">
                <div className="flex flex-wrap items-center justify-between -m-2">
                  <div className="w-auto p-2">
                    <h3 className="font-heading text-lg font-semibold">
                      Henvendelser
                    </h3>
                  </div>
                  <div className="w-auto p-2">
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 3.75C10 3.19772 9.55228 2.75 9 2.75C8.44772 2.75 8 3.19772 8 3.75L10 3.75ZM8 3.7575C8 4.30978 8.44771 4.7575 9 4.7575C9.55228 4.7575 10 4.30978 10 3.7575L8 3.7575ZM10 9C10 8.44772 9.55228 8 9 8C8.44771 8 8 8.44772 8 9L10 9ZM8 9.0075C8 9.55978 8.44771 10.0075 9 10.0075C9.55228 10.0075 10 9.55978 10 9.0075L8 9.0075ZM10 14.25C10 13.6977 9.55228 13.25 9 13.25C8.44771 13.25 8 13.6977 8 14.25L10 14.25ZM8 14.2575C8 14.8098 8.44771 15.2575 9 15.2575C9.55228 15.2575 10 14.8098 10 14.2575L8 14.2575ZM9 3.5C9.13807 3.5 9.25 3.61193 9.25 3.75L7.25 3.75C7.25 4.7165 8.0335 5.5 9 5.5L9 3.5ZM9.25 3.75C9.25 3.88807 9.13807 4 9 4L9 2C8.0335 2 7.25 2.7835 7.25 3.75L9.25 3.75ZM9 4C8.86193 4 8.75 3.88807 8.75 3.75L10.75 3.75C10.75 2.7835 9.9665 2 9 2L9 4ZM8.75 3.75C8.75 3.61193 8.86193 3.5 9 3.5L9 5.5C9.9665 5.5 10.75 4.7165 10.75 3.75L8.75 3.75ZM9 8.75C9.13807 8.75 9.25 8.86193 9.25 9L7.25 9C7.25 9.9665 8.0335 10.75 9 10.75L9 8.75ZM9.25 9C9.25 9.13807 9.13807 9.25 9 9.25L9 7.25C8.0335 7.25 7.25 8.0335 7.25 9L9.25 9ZM9 9.25C8.86193 9.25 8.75 9.13807 8.75 9L10.75 9C10.75 8.0335 9.9665 7.25 9 7.25L9 9.25ZM8.75 9C8.75 8.86193 8.86193 8.75 9 8.75L9 10.75C9.9665 10.75 10.75 9.9665 10.75 9L8.75 9ZM9 14C9.13807 14 9.25 14.1119 9.25 14.25L7.25 14.25C7.25 15.2165 8.0335 16 9 16L9 14ZM9.25 14.25C9.25 14.3881 9.13807 14.5 9 14.5L9 12.5C8.0335 12.5 7.25 13.2835 7.25 14.25L9.25 14.25ZM9 14.5C8.86193 14.5 8.75 14.3881 8.75 14.25L10.75 14.25C10.75 13.2835 9.9665 12.5 9 12.5L9 14.5ZM8.75 14.25C8.75 14.1119 8.86193 14 9 14L9 16C9.9665 16 10.75 15.2165 10.75 14.25L8.75 14.25ZM8 3.75L8 3.7575L10 3.7575L10 3.75L8 3.75ZM8 9L8 9.0075L10 9.0075L10 9L8 9ZM8 14.25L8 14.2575L10 14.2575L10 14.25L8 14.25Z"
                        fill="#B8C1CC"
                      />
                    </svg>
                  </div>
                </div>
                <div className="chart" data-type="bar-graph10" />
                <div className="flex flex-wrap -m-8">
                  <div className="w-auto p-8">
                    <p className="mb-1 text-sm text-neutral-400 font-medium">
                      Mål
                    </p>
                    <div className="flex items-center">
                      <svg
                        className="mr-1"
                        width={18}
                        height={18}
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.75 4.5C9.33579 4.5 9 4.83579 9 5.25C9 5.66421 9.33579 6 9.75 6V4.5ZM15.75 5.25H16.5C16.5 4.83579 16.1642 4.5 15.75 4.5V5.25ZM15 11.25C15 11.6642 15.3358 12 15.75 12C16.1642 12 16.5 11.6642 16.5 11.25H15ZM1.71967 12.2197C1.42678 12.5126 1.42678 12.9874 1.71967 13.2803C2.01256 13.5732 2.48744 13.5732 2.78033 13.2803L1.71967 12.2197ZM6.75 8.25L7.28033 7.71967C6.98744 7.42678 6.51256 7.42678 6.21967 7.71967L6.75 8.25ZM9.75 11.25L9.21967 11.7803C9.51256 12.0732 9.98744 12.0732 10.2803 11.7803L9.75 11.25ZM9.75 6H15.75V4.5H9.75V6ZM15 5.25V11.25H16.5V5.25H15ZM2.78033 13.2803L7.28033 8.78033L6.21967 7.71967L1.71967 12.2197L2.78033 13.2803ZM6.21967 8.78033L9.21967 11.7803L10.2803 10.7197L7.28033 7.71967L6.21967 8.78033ZM10.2803 11.7803L16.2803 5.78033L15.2197 4.71967L9.21967 10.7197L10.2803 11.7803Z"
                          fill="#564AF7"
                        />
                      </svg>
                      <p className="font-semibold">245</p>
                    </div>
                  </div>
                  <div className="w-auto p-8">
                    <p className="mb-1 text-sm text-neutral-400 font-medium">
                      Forrige uke
                    </p>
                    <div className="flex items-center">
                      <svg
                        className="mr-1"
                        width={14}
                        height={10}
                        viewBox="0 0 14 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.66667 7.58341C7.25245 7.58341 6.91667 7.9192 6.91667 8.33341C6.91667 8.74763 7.25245 9.08341 7.66667 9.08341V7.58341ZM13 8.33341V9.08341C13.4142 9.08341 13.75 8.74763 13.75 8.33341H13ZM13.75 3.00008C13.75 2.58587 13.4142 2.25008 13 2.25008C12.5858 2.25008 12.25 2.58587 12.25 3.00008H13.75ZM1.53033 1.13642C1.23744 0.843525 0.762563 0.843525 0.46967 1.13642C0.176777 1.42931 0.176777 1.90418 0.46967 2.19708L1.53033 1.13642ZM5 5.66675L4.46967 6.19708C4.76256 6.48997 5.23744 6.48997 5.53033 6.19708L5 5.66675ZM7.66667 3.00008L8.197 2.46975C7.9041 2.17686 7.42923 2.17686 7.13634 2.46975L7.66667 3.00008ZM7.66667 9.08341H13V7.58341H7.66667V9.08341ZM13.75 8.33341V3.00008H12.25V8.33341H13.75ZM0.46967 2.19708L4.46967 6.19708L5.53033 5.13642L1.53033 1.13642L0.46967 2.19708ZM5.53033 6.19708L8.197 3.53041L7.13634 2.46975L4.46967 5.13642L5.53033 6.19708ZM7.13634 3.53041L12.4697 8.86374L13.5303 7.80308L8.197 2.46975L7.13634 3.53041Z"
                          fill="#FF3131"
                        />
                      </svg>
                      <p className="font-semibold">91</p>
                    </div>
                  </div>
                  <div className="w-auto p-8">
                    <p className="mb-1 text-sm text-neutral-400 font-medium">
                      Forrige måned
                    </p>
                    <div className="flex items-center">
                      <svg
                        className="mr-1"
                        width={18}
                        height={18}
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.75 4.5C9.33579 4.5 9 4.83579 9 5.25C9 5.66421 9.33579 6 9.75 6V4.5ZM15.75 5.25H16.5C16.5 4.83579 16.1642 4.5 15.75 4.5V5.25ZM15 11.25C15 11.6642 15.3358 12 15.75 12C16.1642 12 16.5 11.6642 16.5 11.25H15ZM1.71967 12.2197C1.42678 12.5126 1.42678 12.9874 1.71967 13.2803C2.01256 13.5732 2.48744 13.5732 2.78033 13.2803L1.71967 12.2197ZM6.75 8.25L7.28033 7.71967C6.98744 7.42678 6.51256 7.42678 6.21967 7.71967L6.75 8.25ZM9.75 11.25L9.21967 11.7803C9.51256 12.0732 9.98744 12.0732 10.2803 11.7803L9.75 11.25ZM9.75 6H15.75V4.5H9.75V6ZM15 5.25V11.25H16.5V5.25H15ZM2.78033 13.2803L7.28033 8.78033L6.21967 7.71967L1.71967 12.2197L2.78033 13.2803ZM6.21967 8.78033L9.21967 11.7803L10.2803 10.7197L7.28033 7.71967L6.21967 8.78033ZM10.2803 11.7803L16.2803 5.78033L15.2197 4.71967L9.21967 10.7197L10.2803 11.7803Z"
                          fill="#564AF7"
                        />
                      </svg>
                      <p className="font-semibold">137</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 bg-white border rounded-lg">
                <div className="flex flex-wrap -m-2.5">
                  <div className="w-full sm:w-1/2 p-2.5">
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <h3 className="font-heading mb-2 text-lg font-semibold">
                          Generell Statistikk
                        </h3>
                        <p className="mb-6 text-neutral-500">beskrivelse</p>
                      </div>
                      <div className="block">
                        <a
                          className="inline-flex flex-wrap items-center justify-center px-5 py-3 text-center text-neutral-50 font-medium bg-primary hover:bg-secondary rounded-lg transition duration-300"
                          href="#"
                        >
                          <span className="mr-3 font-medium">Administrer</span>
                          <svg
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.33333 3.3335L14 8.00016M14 8.00016L9.33333 12.6668M14 8.00016L2 8.00016"
                              stroke="currentcolor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-1/2 p-2.5">
                    <div className="flex flex-wrap -m-3">
                      <div className="w-full sm:w-1/2 p-3">
                        <div className="p-3 bg-neutral-100 rounded-lg">
                          <div className="flex items-center justify-center mb-4 w-8 h-8 bg-white rounded-full">
                            <LuCreditCard className="text-gray-500" size={14} />
                          </div>
                          <p className="mb-0.5 text-xs font-medium text-neutral-400">
                            Penger spart
                          </p>
                          <h3 className="font-heading font-semibold">
                            38 570,-
                          </h3>
                        </div>
                      </div>
                      <div className="w-full sm:w-1/2 p-3">
                        <div className="p-3 bg-neutral-100 rounded-lg">
                          <div className="flex items-center justify-center mb-4 w-8 h-8 bg-white rounded-full">
                            <LuBugOff className="text-gray-500" size={14} />
                          </div>
                          <p className="mb-0.5 text-xs font-medium text-neutral-400">
                            Problemer løst
                          </p>
                          <h3 className="font-heading font-semibold">96%</h3>
                        </div>
                      </div>
                      <div className="w-full sm:w-1/2 p-3">
                        <div className="p-3 bg-neutral-100 rounded-lg">
                          <div className="flex items-center justify-center mb-4 w-8 h-8 bg-white rounded-full">
                            <LuPhoneCall className="text-gray-500" size={14} />
                          </div>
                          <p className="mb-0.5 text-xs font-medium text-neutral-400">
                            Samtaler
                          </p>
                          <h3 className="font-heading font-semibold">381</h3>
                        </div>
                      </div>
                      <div className="w-full sm:w-1/2 p-3">
                        <div className="p-3 bg-neutral-100 rounded-lg">
                          <div className="flex items-center justify-center mb-4 w-8 h-8 bg-white rounded-full">
                            <LuStar className="text-gray-500" size={14} />
                          </div>
                          <p className="mb-0.5 text-xs font-medium text-neutral-400">
                            Anmeldelser
                          </p>
                          <h3 className="font-heading font-semibold">249</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
*/}
          {/*PER BRUKER */}
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="pt-5 bg-neutral-50 overflow-hidden border border-neutral-100 rounded-xl">
                <div>
                  <div className="flex flex-wrap items-center justify-between px-6 -m-2 mb-6">
                    <div className="w-auto p-2">
                      <h3 className="font-heading text-lg text-neutral-600 font-semibold">
                        Brukerstatistikk
                      </h3>
                    </div>
                    <div className="w-auto p-2">
                      <a href="#">
                        <svg
                          width={16}
                          height={16}
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.00033 3.33317C9.00033 2.78089 8.55261 2.33317 8.00033 2.33317C7.44804 2.33317 7.00033 2.78089 7.00033 3.33317L9.00033 3.33317ZM7.00033 3.33984C7.00033 3.89212 7.44804 4.33984 8.00033 4.33984C8.55261 4.33984 9.00033 3.89212 9.00033 3.33984L7.00033 3.33984ZM9.00033 7.99984C9.00033 7.44755 8.55261 6.99984 8.00033 6.99984C7.44804 6.99984 7.00033 7.44755 7.00033 7.99984L9.00033 7.99984ZM7.00033 8.0065C7.00033 8.55879 7.44804 9.0065 8.00033 9.0065C8.55261 9.0065 9.00033 8.55879 9.00033 8.0065L7.00033 8.0065ZM9.00033 12.6665C9.00033 12.1142 8.55261 11.6665 8.00033 11.6665C7.44804 11.6665 7.00033 12.1142 7.00033 12.6665L9.00033 12.6665ZM7.00033 12.6732C7.00032 13.2255 7.44804 13.6732 8.00032 13.6732C8.55261 13.6732 9.00032 13.2255 9.00033 12.6732L7.00033 12.6732ZM8.00033 2.99984C8.18442 2.99984 8.33366 3.14908 8.33366 3.33317L6.33366 3.33317C6.33366 4.25365 7.07985 4.99984 8.00033 4.99984L8.00033 2.99984ZM8.33366 3.33317C8.33366 3.51727 8.18442 3.6665 8.00033 3.6665L8.00033 1.6665C7.07985 1.6665 6.33366 2.4127 6.33366 3.33317L8.33366 3.33317ZM8.00033 3.6665C7.81623 3.6665 7.66699 3.51727 7.66699 3.33317L9.66699 3.33317C9.66699 2.4127 8.9208 1.6665 8.00033 1.6665L8.00033 3.6665ZM7.66699 3.33317C7.66699 3.14908 7.81623 2.99984 8.00033 2.99984L8.00033 4.99984C8.9208 4.99984 9.66699 4.25365 9.66699 3.33317L7.66699 3.33317ZM8.00033 7.6665C8.18442 7.6665 8.33366 7.81574 8.33366 7.99984L6.33366 7.99984C6.33366 8.92031 7.07985 9.6665 8.00033 9.6665L8.00033 7.6665ZM8.33366 7.99984C8.33366 8.18393 8.18442 8.33317 8.00033 8.33317L8.00033 6.33317C7.07985 6.33317 6.33366 7.07936 6.33366 7.99984L8.33366 7.99984ZM8.00033 8.33317C7.81623 8.33317 7.66699 8.18393 7.66699 7.99984L9.66699 7.99984C9.66699 7.07936 8.9208 6.33317 8.00033 6.33317L8.00033 8.33317ZM7.66699 7.99984C7.66699 7.81574 7.81623 7.6665 8.00033 7.6665L8.00033 9.6665C8.9208 9.6665 9.66699 8.92031 9.66699 7.99984L7.66699 7.99984ZM8.00033 12.3332C8.18442 12.3332 8.33366 12.4824 8.33366 12.6665L6.33366 12.6665C6.33366 13.587 7.07985 14.3332 8.00032 14.3332L8.00033 12.3332ZM8.33366 12.6665C8.33366 12.8506 8.18442 12.9998 8.00032 12.9998L8.00033 10.9998C7.07985 10.9998 6.33366 11.746 6.33366 12.6665L8.33366 12.6665ZM8.00032 12.9998C7.81623 12.9998 7.66699 12.8506 7.66699 12.6665L9.66699 12.6665C9.66699 11.746 8.9208 10.9998 8.00033 10.9998L8.00032 12.9998ZM7.66699 12.6665C7.66699 12.4824 7.81623 12.3332 8.00033 12.3332L8.00032 14.3332C8.9208 14.3332 9.66699 13.587 9.66699 12.6665L7.66699 12.6665ZM7.00033 3.33317L7.00033 3.33984L9.00033 3.33984L9.00033 3.33317L7.00033 3.33317ZM7.00033 7.99984L7.00033 8.0065L9.00033 8.0065L9.00033 7.99984L7.00033 7.99984ZM7.00033 12.6665L7.00033 12.6732L9.00033 12.6732L9.00033 12.6665L7.00033 12.6665Z"
                            fill="#B8C1CC"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-max">
                      <thead>
                        <tr className="text-left">
                          <th className="px-6 w-1/12">
                            <div className="pb-3.5">
                              <a
                                className="text-sm text-gray-500 text-opacity-70 font-medium"
                                href="#"
                              >
                                No.
                              </a>
                            </div>
                          </th>
                          <th className="px-6">
                            <div className="pb-3.5">
                              <a
                                className="text-sm text-gray-500 text-opacity-70 font-medium"
                                href="#"
                              >
                                Navn
                              </a>
                            </div>
                          </th>
                          <th className="px-6">
                            <div className="pb-3.5">
                              <a
                                className="text-sm text-gray-500 text-opacity-70 font-medium"
                                href="#"
                              >
                                Samtaler
                              </a>
                            </div>
                          </th>
                          <th className="px-6">
                            <div className="pb-3.5">
                              <a
                                className="text-sm text-gray-500 text-opacity-70 font-medium"
                                href="#"
                              >
                                Løst
                              </a>
                            </div>
                          </th>
                          <th className="px-6">
                            <div className="pb-3.5">
                              <a
                                className="text-sm text-gray-500 text-opacity-70 font-medium"
                                href="#"
                              >
                                Lengde
                              </a>
                            </div>
                          </th>
                          <th className="px-6">
                            <div className="pb-3.5">
                              <a
                                className="text-sm text-gray-500 text-opacity-70 font-medium"
                                href="#"
                              >
                                Rangering
                              </a>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, index) => (
                          <tr key={index}>
                            <td className="py-4 px-6 bg-light">
                              <span className="text-sm font-medium">
                                {user.id}.
                              </span>
                            </td>
                            <td className="py-4 px-6 bg-light">
                              <div className="flex flex-wrap items-center -m-2">
                                <div className="w-auto p-2">
                                  <img
                                    className="h-10"
                                    src={user.image}
                                    alt={user.name}
                                  />
                                </div>
                                <div className="w-auto p-2">
                                  <span className="block font-semibold">
                                    {user.name} {user.lastname}
                                  </span>
                                  <span className="block font-medium text-sm text-gray-500 text-opacity-70">
                                    Lisens {user.id}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 bg-light">
                              <span className="text-sm font-medium">164</span>
                            </td>
                            <td className="py-4 px-6 bg-light">
                              <span className="text-sm font-medium">135</span>
                            </td>
                            <td className="py-4 px-6 bg-light">
                              <span className="text-sm font-medium">26</span>
                            </td>
                            <td className="py-6 px-6 bg-light">
                              <div className="flex flex-wrap items-center">
                                <LuStar />
                                <span className="ml-2 text-sm font-medium">
                                  {user.reviews}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/*ANMELDELSER */}
          <section className="py-4 overflow-hidden">
            <div className="container px-4 mx-auto">
              <div className="p-6 pb-0 bg-white border rounded-xl">
                <h3 className="font-heading mb-8 text-lg font-semibold">
                  Anmeldelser
                </h3>
                <div className="flex flex-wrap -m-1.5">
                  <div className="w-auto p-1.5">
                    <img src="/assets/elements/stars.svg" alt="alt" />
                  </div>
                  <div className="w-auto p-1.5">
                    <p className="font-medium">249 anmeldelser</p>
                  </div>
                </div>
                <div className="chart" data-type="bar-graph15" />
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
