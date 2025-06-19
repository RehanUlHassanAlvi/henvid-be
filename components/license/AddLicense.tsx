"use client";
import React, { useState } from "react";
import { LuFileKey2 } from "react-icons/lu";

interface AddLicenseProps {
  onClose: () => void;
  onSave?: (licenseData: any) => Promise<void>;
  saving?: boolean;
}

export default function AddLicense({ onClose, onSave, saving = false }: AddLicenseProps) {
  const [formData, setFormData] = useState({
    type: 'standard',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    maxUsers: 1,
    maxCalls: 100,
    maxStorage: 1000
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (onSave) {
      await onSave(formData);
    }
  };

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center flex-wrap py-20 bg-neutral-500 bg-opacity-80 overflow-y-auto">
      <div className="container px-4 mx-auto">
        <div className="pt-10 px-6 pb-12 text-center max-w-lg mx-auto bg-white border rounded-xl shadow-3xl">
          <div className="w-full mx-auto text-center flex justify-center items-center py-4">
            <LuFileKey2 size={30} />
          </div>
          <h3 className="font-heading mb-2 text-xl font-semibold">
            Legg til Lisens
          </h3>
          <p className="mb-6 text-neutral-500">
            Opprett en ny lisens for din organisasjon. Etter opprettelse kan du tildele den til en bruker.
          </p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lisenstype
              </label>
              <select
                className="w-full py-2 px-3 border border-neutral-200 rounded-lg focus:border-neutral-600"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gyldig fra
                </label>
                <input
                  type="date"
                  className="w-full py-2 px-3 border border-neutral-200 rounded-lg focus:border-neutral-600"
                  value={formData.validFrom}
                  onChange={(e) => handleInputChange('validFrom', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gyldig til
                </label>
                <input
                  type="date"
                  className="w-full py-2 px-3 border border-neutral-200 rounded-lg focus:border-neutral-600"
                  value={formData.validUntil}
                  onChange={(e) => handleInputChange('validUntil', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maks brukere
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full py-2 px-3 border border-neutral-200 rounded-lg focus:border-neutral-600"
                  value={formData.maxUsers}
                  onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maks anrop
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full py-2 px-3 border border-neutral-200 rounded-lg focus:border-neutral-600"
                  value={formData.maxCalls}
                  onChange={(e) => handleInputChange('maxCalls', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lagring (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full py-2 px-3 border border-neutral-200 rounded-lg focus:border-neutral-600"
                  value={formData.maxStorage}
                  onChange={(e) => handleInputChange('maxStorage', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center -m-1">
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
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Lagrer...' : 'Legg til'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
