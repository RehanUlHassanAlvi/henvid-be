import React from "react";

interface LogEntry {
  id: number;
  phone: string;
  employee: string;
  comment: string;
  date: string;
  length: number;
  rating: string;
  resolved: boolean;
}

const logEntries: LogEntry[] = [
  {
    id: 244,
    phone: "+47 38604455",
    employee: "Jonas",
    comment: "",
    date: "22/05/2025 08:30",
    length: 23,
    rating: "5/5",
    resolved: true,
  },
  {
    id: 243,
    phone: "+47 48057158",
    employee: "Hans",
    comment: "Fungerte etter restart",
    date: "21/05/2025 14:26",
    length: 60,
    rating: "5/5",
    resolved: true,
  },
  {
    id: 242,
    phone: "+47 38601617",
    employee: "Hans",
    comment: "",
    date: "21/05/2025 12:31",
    length: 29,
    rating: "5/5",
    resolved: true,
  },
  {
    id: 241,
    phone: "+47 97295021",
    employee: "Jonas",
    comment:
      "Prøvd å se på inntak men ser ut som problemet ligger utenfor vår rekkevidde.",
    date: "21/05/2025 09:08",
    length: 12,
    rating: "4/5",
    resolved: false,
  },
  {
    id: 240,
    phone: "+47 48057158",
    employee: "Karl",
    comment: "Restartet ruter",
    date: "19/05/2025 15:48",
    length: 45,
    rating: "5/5",
    resolved: true,
  },
];

export default function Log() {
  return (
    <section className="relative w-full h-full">
      <div className="mx-auto container">
        <section className="py-4 overflow-hidden">
          <div className=" px-4 mx-auto">
            <div className="pt-5 bg-white border border-neutral-100 rounded-xl">
              <div className="px-6">
                <h3 className="font-heading pb-8 text-lg text-neutral-600 font-semibold">
                  Historikk
                </h3>
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="text-left">
                        {[
                          "#",
                          "Telefonnummer",
                          "Ansatt",
                          "Kommentar",
                          "Tidspunkt",
                          "Lengde",
                          "Anmeldelse",
                          "Løst?",
                          "",
                        ].map((col) => (
                          <th
                            key={col}
                            className="p-0 border-b border-neutral-100"
                          >
                            <div className="pb-3.5">
                              <span className="text-sm text-gray-400 font-medium">
                                {col}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span className="text-sm">{entry.id}</span>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span className="text-sm">{entry.phone}</span>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span className="text-sm font-semibold">
                              {entry.employee}
                            </span>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span className="text-sm font-semibold">
                              {entry.comment}
                            </span>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span className="text-sm">{entry.date}</span>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span className="text-sm">{entry.length}</span>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span className="text-sm">{entry.rating}</span>
                          </td>
                          <td className="py-3 pr-4 border-b border-neutral-100">
                            <span className="text-sm">
                              {entry.resolved ? "✔️" : "❌"}
                            </span>
                          </td>
                          <td className="py-3 border-b border-neutral-100">
                            <button
                              aria-label="toggle row"
                              className="opacity-25"
                            >
                              <svg
                                width={20}
                                height={20}
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <circle
                                  cx={10}
                                  cy={10}
                                  r="9.25"
                                  fill="white"
                                  stroke="#B8C1CC"
                                  strokeWidth="1.5"
                                />
                                <path
                                  d="M13.5 8.5L10 12L6.5 8.5"
                                  stroke="#B8C1CC"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
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
      </div>
    </section>
  );
}
