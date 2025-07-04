import React, { useState } from "react";
import { userApi, handleApiError } from "@/utils/api";

interface DeleteUserProps {
  user: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteUser({ user, onClose, onSuccess }: DeleteUserProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userApi.deleteUser(user.id);
      
      if (response.error) {
        setError(handleApiError(response));
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center flex-wrap py-20 bg-neutral-500 bg-opacity-80 overflow-y-auto">
      <div className="container px-4 mx-auto">
        <div className="pt-10 px-6 pb-12 text-center max-w-lg mx-auto bg-white border rounded-xl shadow-3xl">
          <svg
            className="mb-4 mx-auto"
            width={28}
            height={28}
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.9141 8.2201C22.9436 7.80694 22.6326 7.44808 22.2195 7.41857C21.8063 7.38906 21.4474 7.70007 21.4179 8.11323L22.9141 8.2201ZM21.1541 22.3329L20.406 22.2795L21.1541 22.3329ZM6.84456 22.3329L7.59265 22.2795L6.84456 22.3329ZM6.58078 8.11323C6.55126 7.70007 6.19241 7.38906 5.77925 7.41857C5.36609 7.44808 5.05508 7.80694 5.08459 8.2201L6.58078 8.11323ZM12.416 12.8333C12.416 12.4191 12.0802 12.0833 11.666 12.0833C11.2518 12.0833 10.916 12.4191 10.916 12.8333H12.416ZM10.916 19.8333C10.916 20.2475 11.2518 20.5833 11.666 20.5833C12.0802 20.5833 12.416 20.2475 12.416 19.8333H10.916ZM17.0827 12.8333C17.0827 12.4191 16.7469 12.0833 16.3327 12.0833C15.9185 12.0833 15.5827 12.4191 15.5827 12.8333H17.0827ZM15.5827 19.8333C15.5827 20.2475 15.9185 20.5833 16.3327 20.5833C16.7469 20.5833 17.0827 20.2475 17.0827 19.8333H15.5827ZM16.7493 8.16667C16.7493 8.58088 17.0851 8.91667 17.4993 8.91667C17.9136 8.91667 18.2493 8.58088 18.2493 8.16667H16.7493ZM9.74935 8.16667C9.74935 8.58088 10.0851 8.91667 10.4993 8.91667C10.9136 8.91667 11.2493 8.58088 11.2493 8.16667H9.74935ZM4.66602 7.41667C4.2518 7.41667 3.91602 7.75245 3.91602 8.16667C3.91602 8.58088 4.2518 8.91667 4.66602 8.91667V7.41667ZM23.3327 8.91667C23.7469 8.91667 24.0827 8.58088 24.0827 8.16667C24.0827 7.75245 23.7469 7.41667 23.3327 7.41667V8.91667ZM21.4179 8.11323L20.406 22.2795L21.9022 22.3863L22.9141 8.2201L21.4179 8.11323ZM18.8267 23.75H9.17196V25.25H18.8267V23.75ZM7.59265 22.2795L6.58078 8.11323L5.08459 8.2201L6.09646 22.3863L7.59265 22.2795ZM9.17196 23.75C8.34128 23.75 7.65183 23.108 7.59265 22.2795L6.09646 22.3863C6.21171 23.9999 7.55432 25.25 9.17196 25.25V23.75ZM20.406 22.2795C20.3469 23.108 19.6574 23.75 18.8267 23.75V25.25C20.4444 25.25 21.787 23.9999 21.9022 22.3863L20.406 22.2795ZM10.916 12.8333V19.8333H12.416V12.8333H10.916ZM15.5827 12.8333V19.8333H17.0827V12.8333H15.5827ZM11.666 4.25H16.3327V2.75H11.666V4.25ZM16.7493 4.66667V8.16667H18.2493V4.66667H16.7493ZM11.2493 8.16667V4.66667H9.74935V8.16667H11.2493ZM16.3327 4.25C16.5628 4.25 16.7493 4.43655 16.7493 4.66667H18.2493C18.2493 3.60812 17.3912 2.75 16.3327 2.75V4.25ZM11.666 2.75C10.6075 2.75 9.74935 3.60812 9.74935 4.66667H11.2493C11.2493 4.43655 11.4359 4.25 11.666 4.25V2.75ZM4.66602 8.91667H23.3327V7.41667H4.66602V8.91667Z"
              fill="#7F8995"
            />
          </svg>

          <h3 className="font-heading mb-2 text-xl font-semibold">
            Er du sikker på at du ønsker slette brukeren?
          </h3>
          <p className="mb-2 text-neutral-700 font-medium">
            {user.firstName || user.name} {user.lastName || user.lastname}
          </p>
          <p className="mb-6 text-neutral-500">
            Det kan ikke reverseres men brukeren kan opprettes på nytt senere om
            ønskelig.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-wrap justify-center -m-1">
            <div className="w-auto p-1">
              <button
                className="inline-flex cursor-pointer px-5 py-2.5 text-sm font-medium border border-neutral-200 hover:border-neutral-300 rounded-lg disabled:opacity-50"
                onClick={onClose}
                disabled={loading}
              >
                Avbryt
              </button>
            </div>
            <div className="w-auto p-1">
              <button
                className="inline-flex cursor-pointer px-5 py-2.5 text-sm text-neutral-50 font-medium bg-red-500 hover:bg-red-600 rounded-lg transition duration-300 disabled:opacity-50"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Sletter...' : 'Ja, slett'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
