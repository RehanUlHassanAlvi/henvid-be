"use client";
import { logo } from "@/utils/constants";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuMail, LuClock, LuCheck } from "react-icons/lu";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [formData, setFormData] = useState({
    email: email,
    verificationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  // Countdown timer for resend cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Estimate time left (15 minutes from now)
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const expiryTime = new Date(now.getTime() + 15 * 60 * 1000);
      const diff = expiryTime.getTime() - now.getTime();
      
      if (diff > 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('Expired');
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For verification code, only allow numbers and limit to 6 digits
    if (name === 'verificationCode') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (error) setError('');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.verificationCode) {
      setError('Please enter your email and verification code');
      return;
    }

    if (formData.verificationCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          verificationCode: formData.verificationCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend code');
        return;
      }

      setResendCooldown(60); // 60 seconds cooldown
      alert('Verification code sent successfully!');

    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <section className="py-10 bg-bg overflow-hidden lg:pt-20">
        <div className="container mx-auto px-2 lg:px-4">
          <div className="pt-16 pb-24 md:pb-52 md:max-w-3xl mx-auto bg-highlight rounded-3xl px-4">
            <img
              className="mb-16 lg:mb-24 mx-auto max-h-14"
              src={logo}
              alt="Henvid.com"
            />
            <div className="md:max-w-md mx-auto text-center">
              <div className="mb-10">
                                 <LuCheck className="mx-auto mb-4 text-green-500" size={64} />
                <h2 className="font-heading mb-4 text-4xl md:text-5xl text-black font-black tracking-tight">
                  Email Verified!
                </h2>
                <p className="text-gray-500 font-bold">
                  Your email has been successfully verified. You'll be redirected to your dashboard shortly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
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
              <LuMail className="mx-auto mb-4 text-primary" size={64} />
              <h2 className="font-heading mb-4 text-4xl md:text-5xl text-black font-black tracking-tight">
                Verify Your Email
              </h2>
              <p className="text-gray-500 font-bold">
                We've sent a verification code to your email address. Enter the code below to verify your account.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div className="flex flex-wrap -m-3">
                <div className="w-full p-3">
                  <label
                    className="block mb-2 text-sm text-gray-500 font-bold"
                    htmlFor="verify-email"
                  >
                    Epostadresse
                  </label>
                  <input
                    className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
                    id="verify-email"
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
                    htmlFor="verification-code"
                  >
                    Verification Code
                  </label>
                  <input
                    className="appearance-none px-6 py-3.5 w-full text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl text-center tracking-wider"
                    id="verification-code"
                    name="verificationCode"
                    type="text"
                    value={formData.verificationCode}
                    onChange={handleInputChange}
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <LuClock size={16} className="mr-1" />
                      <span>Expires in: {timeLeft}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full p-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="block w-full px-8 py-3.5 text-lg text-center text-white font-bold bg-primary hover:bg-secondary focus:ring-4 focus:ring-red-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </div>

                <div className="w-full p-3 text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading || resendCooldown > 0}
                    className="text-primary hover:text-secondary font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading 
                      ? 'Sending...' 
                      : resendCooldown > 0 
                        ? `Resend in ${resendCooldown}s` 
                        : 'Resend Code'
                    }
                  </button>
                </div>

                <div className="w-full p-3 text-center">
                  <Link href="/login" className="text-primary hover:text-secondary font-bold text-sm">
                    ← Back to Login
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
} 