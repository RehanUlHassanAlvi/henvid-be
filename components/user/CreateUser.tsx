"use client";
import Image from "next/image";
import React, { useState, useRef } from "react";
import { LuX, LuUpload, LuImage } from "react-icons/lu";
import { userApi, handleApiError } from "@/utils/api";
import { useAuth } from "@/utils/auth-context";
import { SupabaseImageService } from "@/utils/supabase";

interface CreateUserProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateUser({ onClose, onSuccess }: CreateUserProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    image: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setError(null);

    try {
      // Generate a temporary user ID for the avatar filename
      const tempUserId = `temp_${Date.now()}`;
      const imageUrl = await SupabaseImageService.uploadAvatar(file, tempUserId);
      
      setFormData(prev => ({ ...prev, image: imageUrl }));
      setSelectedImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke laste opp bilde');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Fornavn, etternavn og epost er påkrevd');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating user with company ID:', user?.company?.id);
      console.log('Full company object:', user?.company);
      console.log('Full form data:', formData);
      
      const payload = {
        ...formData,
        companyId: user?.company?.id || (user?.company as any)?._id
      };
      
      console.log('Final payload:', payload);
      
      const response = await userApi.createUser(payload);

      if (response.error) {
        setError(handleApiError(response));
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError('Kunne ikke opprette bruker');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <section className="fixed inset-0 flex items-center justify-center flex-wrap overflow-y-auto">
        <div
          onClick={onClose}
          className="w-full h-full bg-neutral-500 bg-opacity-80 z-20 relative py-20"
        />
        <div className="container px-4 mx-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="pt-5 max-w-lg mx-auto bg-neutral-50 border border-neutral-100 rounded-xl">
            <div className="px-6 pb-7">
              <div className="flex flex-nowrap justify-between mb-5 -m-2">
                <div className="w-auto p-2">
                  <h3 className="font-heading mb-1 text-lg text-neutral-600 font-semibold">
                    Opprett bruker
                  </h3>
                  <p className="text-sm text-neutral-400 font-medium">
                    Legg inn informasjon om brukeren
                  </p>
                  {error && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
                      {error}
                    </div>
                  )}
                </div>
                <div className="w-10 p-2">
                  <button onClick={onClose} className="relative top-1">
                    <LuX size={20} className="text-tertiary" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
              {/*
              <div className="pb-3.5 w-full overflow-x-auto">
                <table className="w-full min-w-max">
                  <tbody>
                    <tr>
                      <td className="py-2.5">
                        <div className="flex items-center">
                          <input
                            className="opacity-0 absolute h-5 w-5"
                            id="modalCheckbox5-1"
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
                            htmlFor="modalCheckbox5-1"
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
                            id="modalCheckbox5-2"
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
                            htmlFor="modalCheckbox5-2"
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
                            id="modalCheckbox5-3"
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
                            htmlFor="modalCheckbox5-3"
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
                            id="modalCheckbox5-4"
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
                            htmlFor="modalCheckbox5-4"
                          >
                            Proper directing
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <div className="flex items-center">
                          <input
                            className="opacity-0 absolute h-5 w-5"
                            id="modalCheckbox5-5"
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
                            htmlFor="modalCheckbox5-5"
                          >
                            Coordinating all tools
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <div className="flex items-center">
                          <input
                            className="opacity-0 absolute h-5 w-5"
                            id="modalCheckbox5-6"
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
                            htmlFor="modalCheckbox5-6"
                          >
                            Reporting and budgeting
                          </label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              */}
              <div></div>
              <div className="w-full p-3">
                <label
                  className="block mb-2 text-sm text-gray-500 font-bold"
                  htmlFor="createuser-image"
                >
                  Bilde
                </label>
                <div className="flex flex-row items-center gap-3">
                  <div className="w-auto">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {selectedImage ? (
                        <Image
                          src={selectedImage}
                          alt="User avatar"
                          height={48}
                          width={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <LuImage className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="createuser-image"
                    />
                    <div
                      onClick={triggerFileSelect}
                      className="flex items-center justify-center px-4 py-3 text-sm text-gray-600 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:text-primary cursor-pointer transition-colors"
                    >
                      <LuUpload className="h-4 w-4 mr-2" />
                      {uploadingImage ? 'Laster opp...' : 'Last opp profilbilde'}
                    </div>
                  </div>
                </div>

              </div>
              <div className="flex flex-row gap-0">
                <div className="w-full p-3">
                  <label
                    className="block mb-2 text-sm text-gray-500 font-bold"
                    htmlFor="createuser-name"
                  >
                    Fornavn *
                  </label>

                  <input
                    className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                    id="createuser-name"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Fornavn"
                    required
                  />
                </div>
                <div className="w-full p-3">
                  <label
                    className="block mb-2 text-sm text-gray-500 font-bold"
                    htmlFor="createuser-lastname"
                  >
                    Etternavn *
                  </label>

                  <input
                    className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                    id="createuser-lastname"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Etternavn"
                    required
                  />
                </div>
              </div>
              <div className="w-full p-3">
                <label
                  className="block mb-2 text-sm text-gray-500 font-bold"
                  htmlFor="createuser-email"
                >
                  Epostadresse *
                </label>
                <input
                  className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                  id="createuser-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="bruker@firma.no"
                  required
                />
              </div>
              <div className="w-full p-3">
                <label
                  className="block mb-2 text-sm text-gray-500 font-bold"
                  htmlFor="createuser-phone"
                >
                  Telefonnummer
                </label>
                <input
                  className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                  id="createuser-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="12345678"
                />
              </div>
              <div className="w-full p-3">
                <div className="flex flex-nowrap md:justify-end -m-2">
                  <div className="w-full p-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="block cursor-pointer px-8 py-3.5 text-lg text-center text-tertiary font-bold bg-bg hover:bg-white border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl w-full"
                    >
                      Avbryt
                    </button>
                  </div>
                  <div className="w-full p-2">
                    <button
                      type="submit"
                      disabled={loading || !formData.firstName || !formData.lastName || !formData.email}
                      className="block cursor-pointer px-8 py-3.5 text-lg text-center text-white font-bold bg-primary hover:bg-secondary focus:ring-4 focus:ring-red-200 rounded-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Oppretter...' : 'Opprett'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
