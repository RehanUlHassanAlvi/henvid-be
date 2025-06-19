"use client";
import React, { useState, useEffect } from "react";
import { LuFileKey2 } from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";

interface EditLicenseProps {
  license?: any;
  users?: any[];
  onClose: () => void;
  onSave?: (licenseId: string, licenseData: any) => Promise<void>;
  onDelete?: (licenseId: string) => Promise<void>;
  onAssign?: (licenseId: string, userId: string) => Promise<void>;
  onUnassign?: (licenseId: string) => Promise<void>;
  saving?: boolean;
}

export default function EditLicense({ 
  license, 
  users = [], 
  onClose, 
  onSave, 
  onDelete, 
  onAssign, 
  onUnassign, 
  saving = false 
}: EditLicenseProps) {
  const [deleteState, setDeleteState] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [formData, setFormData] = useState({
    type: 'standard',
    status: 'active',
    validFrom: '',
    validUntil: '',
    maxUsers: 1,
    maxCalls: 100,
    maxStorage: 1000
  });

  useEffect(() => {
    if (license) {
      setFormData({
        type: license.type || 'standard',
        status: license.status || 'active',
        validFrom: license.validFrom ? new Date(license.validFrom).toISOString().split('T')[0] : '',
        validUntil: license.validUntil ? new Date(license.validUntil).toISOString().split('T')[0] : '',
        maxUsers: license.maxUsers || 1,
        maxCalls: license.maxCalls || 100,
        maxStorage: license.maxStorage || 1000
      });
      setSelectedUserId(license.user?._id || license.user?.id || '');
    }
  }, [license]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (onSave && license) {
      await onSave(license.id || license._id, formData);
    }
  };

  const handleDelete = async () => {
    if (onDelete && license) {
      await onDelete(license.id || license._id);
    }
  };

  const handleUserAssignment = async () => {
    if (!license) return;
    
    const licenseId = license.id || license._id;
    const currentUserId = license.user?._id || license.user?.id;
    
    if (selectedUserId === '') {
      // Unassign license
      if (currentUserId && onUnassign) {
        await onUnassign(licenseId);
        onClose(); // Close modal after successful unassignment
      }
    } else if (selectedUserId !== currentUserId) {
      // Assign to new user
      if (onAssign) {
        await onAssign(licenseId, selectedUserId);
        onClose(); // Close modal after successful assignment
      }
    } else {
      // No change, just close modal
      onClose();
    }
  };

  const handleDeleteState = () => {
    setDeleteState(true);
  };

  const availableUsers = users.filter(user => 
    !user.licenses || user.licenses.length === 0 || 
    user.id === (license?.user?._id || license?.user?.id)
  );

  console.log('EditLicense - users prop:', users);
  console.log('EditLicense - availableUsers:', availableUsers);
  console.log('EditLicense - license:', license);

  if (!license) {
    return null;
  }

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center flex-wrap py-20 bg-neutral-500 bg-opacity-80 overflow-y-auto">
      <div className="container px-4 mx-auto">
        {deleteState ? (
          <div className="pt-10 px-6 pb-12 text-center max-w-lg mx-auto bg-white border rounded-xl shadow-3xl">
            <div className="w-full mx-auto text-center flex justify-center items-center py-4">
              <LuFileKey2 size={30} />
            </div>

            <h3 className="font-heading mb-2 text-xl font-semibold">
              Slett Lisens
            </h3>
            <p className="mb-6 text-neutral-500">
              Er du sikker på at du vil slette denne lisensen? Denne handlingen kan ikke angres.
              {license.user && (
                <span className="block mt-2 text-red-600">
                  Lisensen er tildelt {license.user.firstName} {license.user.lastName} og må fjernes først.
                </span>
              )}
            </p>
            <div className="flex flex-wrap justify-center -m-1">
              <div className="w-auto p-1">
                <button
                  className="inline-flex cursor-pointer px-5 py-2.5 text-sm font-medium border border-neutral-200 hover:border-neutral-300 rounded-lg"
                  onClick={() => setDeleteState(false)}
                  disabled={saving}
                >
                  Avbryt
                </button>
              </div>
              <div className="w-auto p-1">
                <button
                  className={`inline-flex cursor-pointer px-5 py-2.5 text-sm text-neutral-50 font-medium rounded-lg transition duration-300 ${
                    saving || license.user
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  onClick={handleDelete}
                  disabled={saving || license.user}
                >
                  {saving ? 'Sletter...' : 'Slett'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative pt-10 px-6 pb-12 text-center max-w-lg mx-auto bg-white border rounded-xl shadow-3xl">
            <div
              onClick={handleDeleteState}
              className="absolute cursor-pointer top-6 right-6 group"
            >
              <RiDeleteBin6Line
                size={20}
                className="text-sm text-primary group-hover:text-secondary"
              />
            </div>
            <div className="w-full mx-auto text-center flex justify-center items-center py-4">
              <LuFileKey2 size={30} />
            </div>

            <h3 className="font-heading mb-2 text-xl font-semibold">
              Tildel Lisens
            </h3>
            <p className="mb-6 text-neutral-500">
              Tildel lisensen til en tilgjengelig bruker.<br/>
              Hvis du velger "Ikke tildelt" vil den være tilgjengelig.
            </p>

            <div className="space-y-4 mb-6 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tildelt bruker
                </label>
                <select
                  className="w-full py-2 px-3 border border-neutral-200 rounded-lg focus:border-neutral-600"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Ikke tildelt</option>
                  {availableUsers.map((user) => (
                    <option key={user.id || user._id} value={user.id || user._id}>
                      {user.firstName} {user.lastName} - {user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-nowrap justify-center -m-1">
              <div className="w-auto p-1">
                <button
                  className="inline-flex cursor-pointer px-5 py-2.5 text-sm font-medium border border-neutral-200 hover:border-neutral-300 rounded-lg"
                  onClick={onClose}
                  disabled={saving}
                >
                  Avbryt
                </button>
              </div>
              <div className="w-auto p-1">
                <button
                  className={`inline-flex cursor-pointer px-5 py-2.5 text-sm text-neutral-50 font-medium rounded-lg transition duration-300 ${
                    saving 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary hover:bg-secondary'
                  }`}
                  onClick={handleUserAssignment}
                  disabled={saving}
                >
                  {saving ? 'Lagrer...' : 'Lagre'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
