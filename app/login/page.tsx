"use client";
import { logo } from "@/utils/constants";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useAuth, useGuestGuard } from "@/utils/auth-context";
import { useRouter } from "next/navigation";

export default function Loginpage() {
  const { login, error, loading, clearError } = useAuth();
  const { shouldRedirect, redirectTo } = useGuestGuard('/dashboard');
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [resendingVerification, setResendingVerification] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  useEffect(() => {
    if (shouldRedirect) {
      router.push(redirectTo);
    }
  }, [shouldRedirect, redirectTo, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    const success = await login(formData.email, formData.password);
    if (success) {
      router.push('/dashboard');
    } else if (error && error.includes('Email not verified')) {
      setShowResendButton(true);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Redirect to verification page
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        clearError();
        // The verification API will handle the error display
      }
    } catch (err) {
      console.error('Failed to resend verification:', err);
    } finally {
      setResendingVerification(false);
    }
  };
  return (
    <>
      <section className="py-10 bg-bg overflow-hidden lg:pt-20">
        <div className="container mx-auto px-2 lg:px-4">
          <div className="pt-16 pb-24 md:pb-52 md:max-w-3xl mx-auto bg-highlight rounded-3xl px-4">
            <img
              className="mb-16 lg:mb-24 mx-auto max-h-14"
              src={logo}
              alt="Henvid.com"
            />
            <div className="md:max-w-md mx-auto">
              <div className="mb-10 text-center">
                <h2 className="font-heading mb-4 text-4xl md:text-5xl text-black font-black tracking-tight">
                  Velkommen
                </h2>
                <p className="text-gray-500 font-bold">
                  Fyll ut dine detaljer for å logge inn
                </p>
                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                    {error}
                    {showResendButton && (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={resendingVerification}
                          className="px-4 py-2 text-sm bg-primary hover:bg-secondary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resendingVerification ? 'Sender...' : 'Send ny kode'}
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)}
                          className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                        >
                          Gå til verifisering
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-wrap -m-3">
                  <div className="w-full p-3">
                    <label
                      className="block mb-2 text-sm text-gray-500 font-bold"
                      htmlFor="login-email"
                    >
                      Epostadresse
                    </label>
                    <input
                      className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                      id="login-email"
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
                      htmlFor="login-password"
                    >
                      Passord
                    </label>
                    <div className="border border-gray-200 overflow-hidden rounded-xl focus-within:ring-4 focus-within:ring-red-200">
                      <div className="flex flex-wrap">
                        <div className="flex-1">
                          <input
                            className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none"
                            id="login-password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Ditt passord"
                            required
                          />
                        </div>
                        <div className="w-auto">
                          <Link
                            className="flex items-center pr-4 text-primary hover:text-secondary h-full bg-white font-bold"
                            href="/forgot-password"
                          >
                            Glemt passord?
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full p-3">
                    <div className="flex flex-wrap md:justify-end -m-2">
                      <div className="w-full p-2">
                        <button
                          type="submit"
                          disabled={loading || !formData.email || !formData.password}
                          className="block px-8 py-3.5 text-lg text-center text-white font-bold bg-primary hover:bg-secondary focus:ring-4 focus:ring-red-200 rounded-xl w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Logger inn...' : 'Logg inn'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full p-3 hidden">
                    <p className="text-gray-600 text-center font-bold">
                      <span>Har du ikke konto?</span>
                      <a
                        className="text-primary hover:text-secondary font-bold"
                        href="#"
                      >
                        Registrer ditt firma her
                      </a>
                    </p>
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
