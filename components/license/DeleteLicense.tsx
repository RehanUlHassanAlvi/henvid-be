import React from "react";
import { LuFileKey2 } from "react-icons/lu";
interface DeleteLicenseProps {
  onClose: () => void;
}

export default function DeleteLicense({ onClose }: DeleteLicenseProps) {
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center flex-wrap py-20 bg-neutral-500 bg-opacity-80 overflow-y-auto">
      <div className="container px-4 mx-auto">
        <div className="pt-10 px-6 pb-12 text-center max-w-lg mx-auto bg-white border rounded-xl shadow-3xl">
          <div className="w-full mx-auto text-center flex justify-center items-center py-4">
            <LuFileKey2 size={30} />
          </div>

          <h3 className="font-heading mb-2 text-xl font-semibold">
            Slett Lisens
          </h3>
          <p className="mb-6 text-neutral-500">
            Du kan kun slette overflødig lisenser, den må altså fjernes fra en
            bruker før den kan slettes.
          </p>
          <div className="flex flex-wrap justify-center -m-1">
            <div className="w-auto p-1">
              <div
                className="inline-flex cursor-pointer px-5 py-2.5 text-sm font-medium border border-neutral-200 hover:border-neutral-300 rounded-lg"
                onClick={onClose}
              >
                Avbryt
              </div>
            </div>
            <div className="w-auto p-1">
              <div
                className="inline-flex cursor-pointer px-5 py-2.5 text-sm text-neutral-50 font-medium bg-primary hover:bg-secondary rounded-lg transition duration-300"
                onClick={onClose}
              >
                Slett
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
