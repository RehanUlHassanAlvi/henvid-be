"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { LuX, LuUpload, LuImage } from "react-icons/lu";
import { userApi, handleApiError } from "@/utils/api";
import { SupabaseImageService } from "@/utils/supabase";
import PhoneInput from "../PhoneInput";

interface EditUserProps {
  onClose: () => void;
  userId: string;
  onUserUpdated?: () => void;
}

export default function EditUser({ onClose, userId, onUserUpdated }: EditUserProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneCountryCode: '+47',
    phoneNumber: '',
    image: ''
  });

  // Load user data on component mount
  useEffect(() => {
    if (userId && userId !== 'undefined' && userId !== 'null') {
      fetchUserData();
    } else {
      setError('Invalid user ID provided');
      setLoadingData(false);
    }
  }, [userId]);

  const fetchUserData = async () => {
    setLoadingData(true);
    try {
      console.log('Fetching user data for ID:', userId);
      const response = await userApi.getUser(userId);
      console.log('API response:', response);
      
      if (response.error) {
        console.error('API error:', response.error);
        setError(handleApiError(response));
      } else if (response.data) {
        const userData = response.data;
        console.log('User data received:', userData);
        
        // Parse phone data
        let phoneCountryCode = '+47';
        let phoneNumber = '';
        
        if (userData.phone) {
          if (typeof userData.phone === 'object' && userData.phone.countryCode && userData.phone.number) {
            // New structured format
            phoneCountryCode = userData.phone.countryCode;
            phoneNumber = userData.phone.number;
          } else if (typeof userData.phone === 'string') {
            // Legacy format - try to parse
            const phoneStr = userData.phone.toString();
            if (phoneStr.startsWith('+')) {
              const match = phoneStr.match(/^(\+\d{1,4})(.+)$/);
              if (match) {
                phoneCountryCode = match[1];
                phoneNumber = match[2];
              } else {
                phoneNumber = phoneStr.slice(1);
              }
            } else {
              phoneNumber = phoneStr;
            }
          }
        }
        
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phoneCountryCode,
          phoneNumber,
          image: userData.image || ''
        });
        setSelectedImage(userData.image || null);
        setError(null); // Clear any previous errors
      } else {
        console.error('No data in response:', response);
        setError('No user data received');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Kunne ikke laste brukerdata');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handlePhoneCountryCodeChange = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      phoneCountryCode: countryCode
    }));
    if (error) setError(null);
  };

  const handlePhoneNumberChange = (phoneNumber: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: phoneNumber
    }));
    if (error) setError(null);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setError(null);

    try {
      const imageUrl = await SupabaseImageService.uploadAvatar(file, userId);
      
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
      const response = await userApi.updateUser(userId, formData);

      if (response.error) {
        setError(handleApiError(response));
      } else {
        // Success - close modal and refresh
        onUserUpdated?.();
        onClose();
      }
    } catch (err) {
      setError('Kunne ikke oppdatere bruker');
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
                    Rediger bruker
                  </h3>
                  <p className="text-sm text-neutral-400 font-medium">
                    Oppdater informasjonen om brukeren
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
                {loadingData ? (
                  <div className="w-full p-3">
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3 text-gray-600">Laster brukerdata...</span>
                    </div>
                  </div>
                ) : (
                <>
                <div className="w-full p-3">
                  <label
                    className="block mb-2 text-sm text-gray-500 font-bold"
                    htmlFor="edituser-image"
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
                        id="edituser-image"
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
                      htmlFor="edituser-firstname"
                    >
                      Fornavn *
                    </label>
                    <input
                      className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                      id="edituser-firstname"
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
                      htmlFor="edituser-lastname"
                    >
                      Etternavn *
                    </label>
                    <input
                      className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                      id="edituser-lastname"
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
                    htmlFor="edituser-email"
                  >
                    Epostadresse *
                  </label>
                  <input
                    className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                    id="edituser-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="bruker@firma.no"
                    required
                  />
                </div>
                
                <div className="w-full p-3">
                  <PhoneInput
                    countryCode={formData.phoneCountryCode}
                    phoneNumber={formData.phoneNumber}
                    onCountryCodeChange={handlePhoneCountryCodeChange}
                    onPhoneNumberChange={handlePhoneNumberChange}
                    id="edituser-phone"
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
                        {loading ? 'Oppdaterer...' : 'Oppdater'}
                      </button>
                    </div>
                  </div>
                </div>
                </>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
