import { UserType } from "@/utils/types2";
import Image from "next/image";
import React, { useState } from "react";
import {
  LuBadge,
  LuClock,
  LuFileKey2,
  LuMail,
  LuPencil,
  LuPhone,
  LuX,
} from "react-icons/lu";
import EditUser from "@/components/user/EditUser";
import DeleteUser from "@/components/user/DeleteUser";

interface UserProps {
  user: UserType;
  onClose: () => void;
}

export default function User({ user, onClose }: UserProps) {
  const [editUserModal, setEditUserModal] = useState(false);
  const [deleteUserModal, setDeleteUserModal] = useState(false);

  const handleEditUserModal = () => {
    setEditUserModal(true);
  };
  const handleDeleteUserModal = () => {
    setDeleteUserModal(true);
  };

  function formatDate(dateString: string): string {
    const date = new Date(dateString);

    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    const formattedDate = new Intl.DateTimeFormat("nb-NO", dateOptions).format(
      date
    );
    const formattedTime = new Intl.DateTimeFormat("nb-NO", timeOptions).format(
      date
    );

    return `${formattedDate} - ${formattedTime}`;
  }

  return (
    <>
      <section className="fixed inset-0 flex items-center justify-center flex-wrap overflow-y-auto">
        <div
          onClick={onClose}
          className="w-full h-full bg-neutral-500 bg-opacity-80 z-40 relative"
        />
        <div className="ml-auto w-full min-h-full max-w-sm bg-white rounded-l-2xl z-50 absolute right-0">
          <div className="p-6 border-b">
            <div className="flex flex-wrap justify-between -m-2">
              <div className="w-auto p-2">
                <div className="flex flex-wrap -m-2">
                  <div className="w-auto p-2">
                    <Image
                      src={user.image}
                      alt={user.name}
                      height={200}
                      width={200}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div className="w-auto p-2">
                    <h3 className="font-heading mb-1 font-semibold">
                      {user.name} {user.lastname}
                    </h3>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="w-auto p-2">
                <button onClick={onClose} className="relative top-1">
                  <LuX size={20} className="text-tertiary" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 border-b">
            <h3 className="font-heading mb-6 text-lg text-neutral-600 font-semibold">
              Profil informasjon
            </h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-max">
                <tbody>
                  <tr>
                    <td className="py-2">
                      <div className="flex flex-wrap items-center">
                        <LuMail className="mr-3 text-gray-500" />
                        <span className="font-medium">{user.email}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <div className="flex flex-wrap items-center">
                        <LuPhone className="mr-3 text-gray-500" />
                        <span className="font-medium">{user.phone}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <div className="flex flex-wrap items-center">
                        <LuClock className="mr-3 text-gray-500" />
                        <div className="flex flex-col flex-wrap">
                          <span className="mb-1 text-neutral-500 font-medium">
                            Siste samtale
                          </span>
                          <span className="text-neutral-600 font-medium">
                            3:07 am, 20 Mar 2025
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <div className="flex flex-wrap items-center">
                        <LuBadge className="mr-3 text-gray-500" />
                        <div className="flex flex-col flex-wrap">
                          <span className="mb-1 text-neutral-500 font-medium">
                            Opprettet
                          </span>
                          <span className="text-neutral-600 font-medium">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-6 border-b">
            <h3 className="font-heading mb-7 text-lg font-semibold">Lisens</h3>
            <div className="flex flex-wrap -m-2 items-center">
              <div className="w-auto p-2">
                <LuFileKey2 />
              </div>
              <div>
                <p>Lisens 1</p>
              </div>
            </div>
            <div className="chart" data-type="area-graph6" />
          </div>
          {/*
          <div className="p-6">
            <div className="flex flex-wrap justify-between mb-5 -m-2">
              <div className="w-auto p-2">
                <h3 className="font-heading mb-1 text-lg text-neutral-600 font-semibold">
                  Tasks
                </h3>
                <p className="text-sm text-neutral-400 font-medium">
                  4 to 8 remaining
                </p>
              </div>
              <div className="w-auto p-2">
                <svg
                  className="relative top-1 text-neutral-300"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.00033 3.33341C9.00033 2.78113 8.55261 2.33341 8.00033 2.33341C7.44804 2.33341 7.00033 2.78113 7.00033 3.33341L9.00033 3.33341ZM7.00033 3.34008C7.00033 3.89237 7.44804 4.34008 8.00033 4.34008C8.55261 4.34008 9.00033 3.89237 9.00033 3.34008L7.00033 3.34008ZM9.00033 8.00008C9.00033 7.4478 8.55261 7.00008 8.00033 7.00008C7.44804 7.00008 7.00033 7.4478 7.00033 8.00008L9.00033 8.00008ZM7.00033 8.00675C7.00033 8.55903 7.44804 9.00675 8.00033 9.00675C8.55261 9.00675 9.00033 8.55903 9.00033 8.00675L7.00033 8.00675ZM9.00033 12.6667C9.00033 12.1145 8.55261 11.6667 8.00033 11.6667C7.44804 11.6667 7.00033 12.1145 7.00033 12.6667L9.00033 12.6667ZM7.00033 12.6734C7.00032 13.2257 7.44804 13.6734 8.00032 13.6734C8.55261 13.6734 9.00032 13.2257 9.00033 12.6734L7.00033 12.6734ZM8.00033 3.00008C8.18442 3.00008 8.33366 3.14932 8.33366 3.33341L6.33366 3.33341C6.33366 4.25389 7.07985 5.00008 8.00033 5.00008L8.00033 3.00008ZM8.33366 3.33341C8.33366 3.51751 8.18442 3.66675 8.00033 3.66675L8.00033 1.66675C7.07985 1.66675 6.33366 2.41294 6.33366 3.33341L8.33366 3.33341ZM8.00033 3.66675C7.81623 3.66675 7.66699 3.51751 7.66699 3.33341L9.66699 3.33341C9.66699 2.41294 8.9208 1.66675 8.00033 1.66675L8.00033 3.66675ZM7.66699 3.33341C7.66699 3.14932 7.81623 3.00008 8.00033 3.00008L8.00033 5.00008C8.9208 5.00008 9.66699 4.25389 9.66699 3.33341L7.66699 3.33341ZM8.00033 7.66675C8.18442 7.66675 8.33366 7.81599 8.33366 8.00008L6.33366 8.00008C6.33366 8.92056 7.07985 9.66675 8.00033 9.66675L8.00033 7.66675ZM8.33366 8.00008C8.33366 8.18418 8.18442 8.33341 8.00033 8.33341L8.00033 6.33341C7.07985 6.33341 6.33366 7.07961 6.33366 8.00008L8.33366 8.00008ZM8.00033 8.33341C7.81623 8.33341 7.66699 8.18418 7.66699 8.00008L9.66699 8.00008C9.66699 7.07961 8.9208 6.33341 8.00033 6.33341L8.00033 8.33341ZM7.66699 8.00008C7.66699 7.81599 7.81623 7.66675 8.00033 7.66675L8.00033 9.66675C8.9208 9.66675 9.66699 8.92056 9.66699 8.00008L7.66699 8.00008ZM8.00033 12.3334C8.18442 12.3334 8.33366 12.4827 8.33366 12.6667L6.33366 12.6667C6.33366 13.5872 7.07985 14.3334 8.00032 14.3334L8.00033 12.3334ZM8.33366 12.6667C8.33366 12.8508 8.18442 13.0001 8.00032 13.0001L8.00033 11.0001C7.07985 11.0001 6.33366 11.7463 6.33366 12.6667L8.33366 12.6667ZM8.00032 13.0001C7.81623 13.0001 7.66699 12.8508 7.66699 12.6667L9.66699 12.6667C9.66699 11.7463 8.9208 11.0001 8.00033 11.0001L8.00032 13.0001ZM7.66699 12.6667C7.66699 12.4827 7.81623 12.3334 8.00033 12.3334L8.00032 14.3334C8.9208 14.3334 9.66699 13.5872 9.66699 12.6667L7.66699 12.6667ZM7.00033 3.33341L7.00033 3.34008L9.00033 3.34008L9.00033 3.33341L7.00033 3.33341ZM7.00033 8.00008L7.00033 8.00675L9.00033 8.00675L9.00033 8.00008L7.00033 8.00008ZM7.00033 12.6667L7.00033 12.6734L9.00033 12.6734L9.00033 12.6667L7.00033 12.6667Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            <div className="pb-3.5 w-full overflow-x-auto">
              <table className="w-full min-w-max">
                <tbody>
                  <tr>
                    <td className="py-2.5">
                      <div className="flex items-center">
                        <input
                          className="opacity-0 absolute h-5 w-5"
                          id="modalCheckbox6-1"
                          type="checkbox"
                        />
                        <div className="flex flex-shrink-0 justify-center items-center w-5 h-5 mr-3 bg-white border-2 border-neutral-200 rounded">
                          <svg
                            width={12}
                            height={10}
                            viewBox="0 0 12 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.33301 5.66675L3.99967 8.33341L10.6663 1.66675"
                              stroke="white"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <label
                          className="font-medium"
                          htmlFor="modalCheckbox6-1"
                        >
                          Project planning
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5">
                      <div className="flex items-center">
                        <input
                          className="opacity-0 absolute h-5 w-5"
                          id="modalCheckbox6-2"
                          defaultChecked
                          type="checkbox"
                        />
                        <div className="flex flex-shrink-0 justify-center items-center w-5 h-5 mr-3 bg-white border-2 border-neutral-200 rounded">
                          <svg
                            width={12}
                            height={10}
                            viewBox="0 0 12 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.33301 5.66675L3.99967 8.33341L10.6663 1.66675"
                              stroke="white"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <label
                          className="font-medium"
                          htmlFor="modalCheckbox6-2"
                        >
                          Company organizing
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5">
                      <div className="flex items-center">
                        <input
                          className="opacity-0 absolute h-5 w-5"
                          id="modalCheckbox6-3"
                          type="checkbox"
                        />
                        <div className="flex flex-shrink-0 justify-center items-center w-5 h-5 mr-3 bg-white border-2 border-neutral-200 rounded">
                          <svg
                            width={12}
                            height={10}
                            viewBox="0 0 12 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.33301 5.66675L3.99967 8.33341L10.6663 1.66675"
                              stroke="white"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <label
                          className="font-medium"
                          htmlFor="modalCheckbox6-3"
                        >
                          HR management
                        </label>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5">
                      <div className="flex items-center">
                        <input
                          className="opacity-0 absolute h-5 w-5"
                          id="modalCheckbox6-4"
                          defaultChecked
                          type="checkbox"
                        />
                        <div className="flex flex-shrink-0 justify-center items-center w-5 h-5 mr-3 bg-white border-2 border-neutral-200 rounded">
                          <svg
                            width={12}
                            height={10}
                            viewBox="0 0 12 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.33301 5.66675L3.99967 8.33341L10.6663 1.66675"
                              stroke="white"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <label
                          className="font-medium"
                          htmlFor="modalCheckbox6-4"
                        >
                          Proper directing
                        </label>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          */}
          <div className="w-auto p-6 border-b">
            <div
              onClick={handleEditUserModal}
              className="cursor-pointer inline-flex flex-wrap gap-2 items-center px-2.5 py-2.5 text-sm font-medium text-white bg-tertiary hover:bg-tertiary/90 rounded-lg transition duration-300"
            >
              <LuPencil />
              <p>Rediger bruker</p>
            </div>
          </div>
          {editUserModal && (
            <EditUser onClose={() => setEditUserModal(false)} />
          )}
          <div className="w-auto p-6">
            <div
              onClick={handleDeleteUserModal}
              className="cursor-pointer inline-flex flex-wrap gap-2 items-center px-2.5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-lg transition duration-300"
            >
              <LuX />
              <p>Slett bruker</p>
            </div>
          </div>
          {deleteUserModal && (
            <DeleteUser onClose={() => setDeleteUserModal(false)} />
          )}
        </div>
      </section>
    </>
  );
}
