import React from "react";

export default function PaymentHistory() {
  return (
    <section className="py-4 overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="py-5 bg-white border rounded-xl">
          <div className="px-6">
            <h3 className="font-heading pb-8 text-lg text-neutral-600 font-semibold">
              Betalingsoversikt
            </h3>
            <div className="mb-5 w-full overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3.5 border-b border-neutral-100">
                      <a
                        className="inline-flex items-center text-sm text-gray-500 font-medium uppercase"
                        href="#"
                      >
                        <span className="mr-1.5">Id</span>
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.7636 6.56365C5.11508 6.21218 5.68492 6.21218 6.0364 6.56365L9 9.52726L11.9636 6.56365C12.3151 6.21218 12.8849 6.21218 13.2364 6.56365C13.5879 6.91512 13.5879 7.48497 13.2364 7.83645L9.6364 11.4364C9.28492 11.7879 8.71508 11.7879 8.3636 11.4364L4.7636 7.83645C4.41213 7.48497 4.41213 6.91512 4.7636 6.56365Z"
                            fill="#7F8995"
                          />
                        </svg>
                      </a>
                    </th>
                    <th className="pb-3.5 border-b border-neutral-100">
                      <a
                        className="inline-flex items-center text-sm text-gray-500 font-medium"
                        href="#"
                      >
                        <span className="mr-1.5">Beskrivelse</span>
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.7636 6.56365C5.11508 6.21218 5.68492 6.21218 6.0364 6.56365L9 9.52726L11.9636 6.56365C12.3151 6.21218 12.8849 6.21218 13.2364 6.56365C13.5879 6.91512 13.5879 7.48497 13.2364 7.83645L9.6364 11.4364C9.28492 11.7879 8.71508 11.7879 8.3636 11.4364L4.7636 7.83645C4.41213 7.48497 4.41213 6.91512 4.7636 6.56365Z"
                            fill="#7F8995"
                          />
                        </svg>
                      </a>
                    </th>
                    <th className="pb-3.5 border-b border-neutral-100">
                      <a
                        className="inline-flex items-center text-sm text-gray-500 font-medium"
                        href="#"
                      >
                        <span className="mr-1.5">Pris</span>
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.7636 6.56365C5.11508 6.21218 5.68492 6.21218 6.0364 6.56365L9 9.52726L11.9636 6.56365C12.3151 6.21218 12.8849 6.21218 13.2364 6.56365C13.5879 6.91512 13.5879 7.48497 13.2364 7.83645L9.6364 11.4364C9.28492 11.7879 8.71508 11.7879 8.3636 11.4364L4.7636 7.83645C4.41213 7.48497 4.41213 6.91512 4.7636 6.56365Z"
                            fill="#7F8995"
                          />
                        </svg>
                      </a>
                    </th>
                    <th className="pb-3.5 border-b border-neutral-100">
                      <a
                        className="inline-flex items-center text-sm text-gray-500 font-medium"
                        href="#"
                      >
                        <span className="mr-1.5">Type</span>
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.7636 6.56365C5.11508 6.21218 5.68492 6.21218 6.0364 6.56365L9 9.52726L11.9636 6.56365C12.3151 6.21218 12.8849 6.21218 13.2364 6.56365C13.5879 6.91512 13.5879 7.48497 13.2364 7.83645L9.6364 11.4364C9.28492 11.7879 8.71508 11.7879 8.3636 11.4364L4.7636 7.83645C4.41213 7.48497 4.41213 6.91512 4.7636 6.56365Z"
                            fill="#7F8995"
                          />
                        </svg>
                      </a>
                    </th>
                    <th className="pb-3.5 border-b border-neutral-100">
                      <a
                        className="inline-flex items-center text-sm text-gray-500 font-medium"
                        href="#"
                      >
                        <span className="mr-1.5">Fakturadato</span>
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.7636 6.56365C5.11508 6.21218 5.68492 6.21218 6.0364 6.56365L9 9.52726L11.9636 6.56365C12.3151 6.21218 12.8849 6.21218 13.2364 6.56365C13.5879 6.91512 13.5879 7.48497 13.2364 7.83645L9.6364 11.4364C9.28492 11.7879 8.71508 11.7879 8.3636 11.4364L4.7636 7.83645C4.41213 7.48497 4.41213 6.91512 4.7636 6.56365Z"
                            fill="#7F8995"
                          />
                        </svg>
                      </a>
                    </th>
                    <th className="pb-3.5 border-b border-neutral-100">
                      <a
                        className="inline-flex items-center text-sm text-gray-500 font-medium"
                        href="#"
                      >
                        <span className="mr-1.5">Status</span>
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.7636 6.56365C5.11508 6.21218 5.68492 6.21218 6.0364 6.56365L9 9.52726L11.9636 6.56365C12.3151 6.21218 12.8849 6.21218 13.2364 6.56365C13.5879 6.91512 13.5879 7.48497 13.2364 7.83645L9.6364 11.4364C9.28492 11.7879 8.71508 11.7879 8.3636 11.4364L4.7636 7.83645C4.41213 7.48497 4.41213 6.91512 4.7636 6.56365Z"
                            fill="#7F8995"
                          />
                        </svg>
                      </a>
                    </th>
                    <th className="pb-3.5 border-b border-neutral-100" />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">#59</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <div className="flex flex-wrap items-center">
                        <span className="font-semibold">3x Lisenser</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">2970,-</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">Abonnement</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="text-neutral-500 font-medium">
                        15 Mai 2025 - 09:00
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="px-2.5 py-1 text-sm font-medium text-green-500 bg-green-500 bg-opacity-10 rounded-full">
                        Betalt
                      </span>
                    </td>
                    <td className="py-2.5 border-b border-neutral-100">
                      <a className="inline-flex py-2.5 pr-0" href="#">
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="mx-0.5 w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">#58</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <div className="flex flex-wrap items-center">
                        <span className="font-semibold">3x Lisenser</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">2970,-</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">Abonnement</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="text-neutral-500 font-medium">
                        15 April 2025 - 09:00
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="px-2.5 py-1 text-sm font-medium text-red-500 bg-red-500 bg-opacity-10 rounded-full">
                        Kansellert
                      </span>
                    </td>
                    <td className="py-2.5 border-b border-neutral-100">
                      <a className="inline-flex py-2.5 pr-0" href="#">
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="mx-0.5 w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">#57</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <div className="flex flex-wrap items-center">
                        <span className="font-semibold">3x Lisenser</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">2970,-</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">Abonnement</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="text-neutral-500 font-medium">
                        15 Mars 2025 - 09:00
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="px-2.5 py-1 text-sm font-medium text-green-500 bg-green-500 bg-opacity-10 rounded-full">
                        Betalt
                      </span>
                    </td>
                    <td className="py-2.5 border-b border-neutral-100">
                      <a className="inline-flex py-2.5 pr-0" href="#">
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="mx-0.5 w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">#56</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <div className="flex flex-wrap items-center">
                        <span className="font-semibold">3x Lisenser</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">2970,-</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">Abonnement</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="text-neutral-500 font-medium">
                        15 Februar 2025 - 09:00
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="px-2.5 py-1 text-sm font-medium text-green-500 bg-green-500 bg-opacity-10 rounded-full">
                        Betalt
                      </span>
                    </td>
                    <td className="py-2.5 border-b border-neutral-100">
                      <a className="inline-flex py-2.5 pr-0" href="#">
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="mx-0.5 w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">#55</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <div className="flex flex-wrap items-center">
                        <span className="font-semibold">3x Lisenser</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">2970,-</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">Abonnement</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="text-neutral-500 font-medium">
                        15 Januar 2025 - 09:00
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="px-2.5 py-1 text-sm font-medium text-yellow-500 bg-yellow-500 bg-opacity-10 rounded-full">
                        Venter
                      </span>
                    </td>
                    <td className="py-2.5 border-b border-neutral-100">
                      <a className="inline-flex py-2.5 pr-0" href="#">
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="mx-0.5 w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">#54</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <div className="flex flex-wrap items-center">
                        <span className="font-semibold">3x Lisenser</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">2970,-</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="font-medium">Abonnement</span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="text-neutral-500 font-medium">
                        15 Desember 2024 - 09:00
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 border-b border-neutral-100">
                      <span className="px-2.5 py-1 text-sm font-medium text-green-500 bg-green-500 bg-opacity-10 rounded-full">
                        Betalt
                      </span>
                    </td>
                    <td className="py-2.5 border-b border-neutral-100">
                      <a className="inline-flex py-2.5 pr-0" href="#">
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="mx-0.5 w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4">
                      <span className="font-medium">#53</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex flex-wrap items-center">
                        <span className="font-semibold">2x Lisenser</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="font-medium">1980,-</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="font-medium">Abonnement</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-neutral-500 font-medium">
                        15 November 2024 - 09:00
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="px-2.5 py-1 text-sm font-medium text-green-500 bg-green-500 bg-opacity-10 rounded-full">
                        Betalt
                      </span>
                    </td>
                    <td className="py-2.5">
                      <a className="inline-flex py-2.5 pr-0" href="#">
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="mx-0.5 w-1 h-1 bg-neutral-200 rounded-full" />
                        <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between -m-2">
              <div className="w-auto p-2">
                <div className="flex flex-wrap -m-0.5">
                  <div className="w-auto p-0.5">
                    <a
                      className="flex items-center justify-center w-9 h-9 border rounded-sm hover:border-neutral-300"
                      href="#"
                    >
                      <svg
                        width={7}
                        height={12}
                        viewBox="0 0 7 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 10.6666L1.33333 5.99998L6 1.33331"
                          stroke="#71717A"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                  <div className="w-auto p-0.5">
                    <a
                      className="flex items-center justify-center w-9 h-9 border border-neutral-600 rounded-sm"
                      href="#"
                    >
                      <span className="text-sm text-neutral-400 font-semibold">
                        1
                      </span>
                    </a>
                  </div>
                  <div className="w-auto p-0.5">
                    <a
                      className="flex items-center justify-center w-9 h-9 border hover:border-neutral-300 rounded-sm"
                      href="#"
                    >
                      <span className="text-sm text-neutral-400 font-semibold">
                        2
                      </span>
                    </a>
                  </div>
                  <div className="w-auto p-0.5">
                    <a
                      className="flex items-center justify-center w-9 h-9 border hover:border-neutral-300 rounded-sm"
                      href="#"
                    >
                      <span className="text-sm text-neutral-400 font-semibold">
                        3
                      </span>
                    </a>
                  </div>
                  <div className="w-auto p-0.5">
                    <a
                      className="flex items-center justify-center w-9 h-9 border hover:border-neutral-300 rounded-sm"
                      href="#"
                    >
                      <span className="text-sm text-neutral-400 font-semibold">
                        4
                      </span>
                    </a>
                  </div>
                  <div className="w-auto p-0.5">
                    <a
                      className="flex items-center justify-center w-9 h-9 border rounded-sm hover:border-neutral-300"
                      href="#"
                    >
                      <svg
                        width={7}
                        height={12}
                        viewBox="0 0 7 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1.33335L5.66667 6.00002L1 10.6667"
                          stroke="#71717A"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                  <div className="w-auto p-0.5">
                    <a
                      className="flex items-center justify-center w-9 h-9 border rounded-sm hover:border-neutral-300"
                      href="#"
                    >
                      <svg
                        width={7}
                        height={12}
                        viewBox="0 0 7 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1.33335L5.66667 6.00002L1 10.6667"
                          stroke="#71717A"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <svg
                        width={7}
                        height={12}
                        viewBox="0 0 7 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1.33335L5.66667 6.00002L1 10.6667"
                          stroke="#71717A"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className="w-auto p-2">
                <p className="text-sm text-neutral-400">
                  Showing 1 of 7 out of 59 results
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
