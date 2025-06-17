"use client";
import { logo } from "@/utils/constants";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { LuCheck } from "react-icons/lu";
import { useAuth, useGuestGuard } from "@/utils/auth-context";
import { useRouter } from "next/navigation";

export default function Registerpage() {
  const { register, error, loading, clearError } = useAuth();
  const { shouldRedirect, redirectTo } = useGuestGuard('/dashboard');
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    orgNumber: '',
    companyName: '',
    industry: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptTerms: true
  });

  useEffect(() => {
    if (shouldRedirect) {
      router.push(redirectTo);
    }
  }, [shouldRedirect, redirectTo, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      return;
    }

    const success = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      companyName: formData.companyName,
      orgNumber: formData.orgNumber
    });
    
    if (success) {
      // Redirect to email verification page
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    }
  };
  return (
    <>
      <section className="py-10 bg-bg overflow-hidden min-h-dvh">
        <div className="container mx-auto px-4">
          <div className="p-10 bg-highlight rounded-3xl">
            <div className="flex flex-wrap md:items-center -m-8">
              <div className="w-full md:w-1/2 p-8">
                <div className="py-20 px-8 lg:px-20 bg-white rounded-3xl">
                  <img
                    className="mb-20 md:mb-40 max-h-14"
                    src={logo}
                    alt="Henvid.com"
                  />
                  <h2 className="font-heading mb-20 md:mb-40 text-4xl md:text-5xl text-tertiary font-black">
                    Registrer deg og kom i gang.
                  </h2>
                  {error && (
                    <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}
                  <ul className="max-w-xs">
                    <h3 className="font-heading mb-6 text-xl text-gray-500 font-bold">
                      Hvorfor bli med?
                    </h3>
                    <li className="flex flex-wrap mb-6">
                      <svg
                        className="w-auto mr-2.5"
                        width={25}
                        height={26}
                        viewBox="0 0 25 26"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12.5 23C18.0228 23 22.5 18.5228 22.5 13C22.5 7.47715 18.0228 3 12.5 3C6.97715 3 2.5 7.47715 2.5 13C2.5 18.5228 6.97715 23 12.5 23ZM17.1339 11.3839C17.622 10.8957 17.622 10.1043 17.1339 9.61612C16.6457 9.12796 15.8543 9.12796 15.3661 9.61612L11.25 13.7322L9.63388 12.1161C9.14573 11.628 8.35427 11.628 7.86612 12.1161C7.37796 12.6043 7.37796 13.3957 7.86612 13.8839L10.3661 16.3839C10.8543 16.872 11.6457 16.872 12.1339 16.3839L17.1339 11.3839Z"
                          fill="#FF5555"
                        />
                      </svg>
                      <p className="flex-1 font-bold">
                        Spar tid og penger på support, effektiviser prosessen.
                      </p>
                    </li>
                    <li className="flex flex-wrap">
                      <svg
                        className="w-auto mr-2.5"
                        width={25}
                        height={26}
                        viewBox="0 0 25 26"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12.5 23C18.0228 23 22.5 18.5228 22.5 13C22.5 7.47715 18.0228 3 12.5 3C6.97715 3 2.5 7.47715 2.5 13C2.5 18.5228 6.97715 23 12.5 23ZM17.1339 11.3839C17.622 10.8957 17.622 10.1043 17.1339 9.61612C16.6457 9.12796 15.8543 9.12796 15.3661 9.61612L11.25 13.7322L9.63388 12.1161C9.14573 11.628 8.35427 11.628 7.86612 12.1161C7.37796 12.6043 7.37796 13.3957 7.86612 13.8839L10.3661 16.3839C10.8543 16.872 11.6457 16.872 12.1339 16.3839L17.1339 11.3839Z"
                          fill="#FF5555"
                        />
                      </svg>
                      <p className="flex-1 font-bold">
                        Ta i mot og løs enda flere henvendelser per
                        supportarbeider.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="w-full md:w-1/2 p-8">
                <form className="md:max-w-md mx-auto" onSubmit={handleSubmit}>
                  <div className="flex flex-wrap -m-3">
                    <div className="w-full p-3">
                      <label
                        className="block mb-2 text-sm text-gray-500 font-bold"
                        htmlFor="signup-orgnr"
                      >
                        Organisasjonsnummer
                      </label>
                      <input
                        className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                        id="signup-orgnr"
                        name="orgNumber"
                        type="text"
                        value={formData.orgNumber}
                        onChange={handleInputChange}
                        placeholder="123456789"
                      />
                    </div>
                    <div className="w-full p-3">
                      <label
                        className="block mb-2 text-sm text-gray-500 font-bold"
                        htmlFor="signup-orgname"
                      >
                        Firmanavn
                      </label>
                      <input
                        className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                        id="signup-orgname"
                        name="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Ditt firmanavn"
                      />
                    </div>
                    <div className="w-full p-3">
                      <label
                        className="block mb-2 text-sm text-gray-500 font-bold"
                        htmlFor="signup-field"
                      >
                        Bransje
                      </label>
                      <div className="relative h-full">
                        <select
                          className="appearance-none py-0 px-6 pr-10 text-lg w-full h-full bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 cursor-pointer rounded-xl"
                          id="signup-field"
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                        >
                          <option value="">Velg bransje</option>
                          <option value="telecom">Telecom</option>
                          <option value="it">IT</option>
                          <option value="finance">Finans</option>
                          <option value="retail">Handel</option>
                          <option value="healthcare">Helse</option>
                          <option value="education">Utdanning</option>
                          <option value="annet">Annet</option>
                        </select>
                        <svg
                          className="absolute top-1/2 right-4 transform -translate-y-1/2"
                          width={16}
                          height={22}
                          viewBox="0 0 16 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.6673 9L8.00065 13.6667L3.33398 9"
                            stroke="#0C1523"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="p-3 font-bold text-tertiary"></p>
                    <div className="w-full border-b border-gray-200 mx-4 my-2" />
                    <div className="flex flex-nowrap flex-row gap-0 items-center">
                      <div className="w-full p-3">
                        <label
                          className="block mb-2 text-sm text-gray-500 font-bold"
                          htmlFor="signup-name"
                        >
                          Fornavn *
                        </label>
                        <input
                          className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                          id="signup-name"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Ditt fornavn"
                          required
                        />
                      </div>
                      <div className="w-full p-3">
                        <label
                          className="block mb-2 text-sm text-gray-500 font-bold"
                          htmlFor="signup-lastname"
                        >
                          Etternavn *
                        </label>
                        <input
                          className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                          id="signup-lastname"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Ditt etternavn"
                          required
                        />
                      </div>
                    </div>
                    <div className="w-full p-3">
                      <label
                        className="block mb-2 text-sm text-gray-500 font-bold"
                        htmlFor="signup-email"
                      >
                        Epostadresse *
                      </label>
                      <input
                        className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                        id="signup-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="din@epost.no"
                        required
                      />
                    </div>
                    <div className="w-full p-3">
                      <label
                        className="block mb-2 text-sm text-gray-500 font-bold"
                        htmlFor="signup-password"
                      >
                        Passord *
                      </label>
                      <input
                        className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                        id="signup-password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Minimum 8 tegn"
                        required
                        minLength={8}
                      />
                    </div>
                    <div className="w-full p-3">
                      <div className="flex flex-wrap items-center justify-between -m-3">
                        <div className="w-auto p-3">
                          <div className="flex items-center">
                            {/*
                            <input
                              type="checkbox"
                              id="signup-checkbox"
                              defaultChecked={true}
                              className="appearance-none marker:white checked:border-4 checked:border-bg checked:rounded-lg checked:bg-primary w-5 h-5 mr-3 rounded border border-gray-200"
                            />
*/}
                            <div className="w-5 h-5 bg-white border border-gray-200 mr-3">
                              <LuCheck className="text-primary" />
                            </div>
                            <label
                              className="text-gray-500 text-sm font-bold"
                              htmlFor="signup-checkbox"
                            >
                              <span>Ved å registrere, godtar jeg&nbsp;</span>
                              <a
                                className="text-primary hover:text-secondary"
                                href="https://www.henvid.com/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Bruksvilkårene
                              </a>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full p-3">
                      <div className="flex flex-wrap md:justify-end -m-2">
                        <div className="w-full p-2">
                          <button
                            type="submit"
                            disabled={loading || !formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.acceptTerms}
                            className="block px-8 py-3.5 text-lg text-center text-white font-bold bg-primary hover:bg-secondary focus:ring-4 focus:ring-red-200 rounded-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Oppretter konto...' : 'Kom i gang'}
                          </button>
                        </div>
                      </div>
                    </div>
                    {/*
                    <div className="w-full p-3 hidden">
                      <div className="flex flex-wrap items-center -m-2">
                        <div className="flex-1 p-2">
                          <div className="h-px bg-gray-200" />
                        </div>
                        <div className="w-auto p-2">
                          <p className="text-gray-600 font-bold uppercase">
                            Eller
                          </p>
                        </div>
                        <div className="flex-1 p-2">
                          <div className="h-px bg-gray-200" />
                        </div>
                      </div>
                    </div>
                    <div className="w-full p-3 hidden">
                      <div className="flex flex-wrap md:justify-end -m-2">
                        <div className="w-full p-2">
                          <a
                            className="flex items-center cursor-not-allowed opacity-50 justify-center px-8 py-3.5 bg-gray-100 hovver:bg-gray-50 hover:border-gray-200 border border-highlight focus:ring-4 focus:ring-red-200 rounded-xl"
                            href="#"
                          >
                            <MdOutlineTextsms className="mr-2" />
                            <span className="text-lg text-gray-900 text-center font-bold">
                              Logg inn via SMS
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                    */}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
