import React from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { NO } from './flags';

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (countryCode: string) => void;
  onPhoneNumberChange: (phoneNumber: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
  id?: string;
}

// Common country codes (can be expanded)
const countryCodes = [
  { code: '+47', country: 'NO', name: 'Norge', flag: NO },
  { code: '+46', country: 'SE', name: 'Sverige', flag: null },
  { code: '+45', country: 'DK', name: 'Danmark', flag: null },
  { code: '+358', country: 'FI', name: 'Finland', flag: null },
  { code: '+49', country: 'DE', name: 'Tyskland', flag: null },
  { code: '+44', country: 'GB', name: 'Storbritannia', flag: null },
  { code: '+1', country: 'US', name: 'USA', flag: null },
];

export default function PhoneInput({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  placeholder = "12345678",
  required = false,
  className = "",
  label = "Telefonnummer",
  id = "phone-input"
}: PhoneInputProps) {
  const selectedCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[0];

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '');
    onPhoneNumberChange(value);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          className="block mb-2 text-sm text-gray-500 font-bold"
          htmlFor={id}
        >
          {label} {required && '*'}
        </label>
      )}
      
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <div className="relative">
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            className="appearance-none px-3 py-3.5 pr-8 text-lg text-gray-500 font-bold bg-white border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl cursor-pointer"
          >
            {countryCodes.map((country) => (
              <option key={country.code} value={country.code}>
                {country.country} {country.code}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <LuChevronDown className="opacity-50" size={16} />
          </div>
        </div>

        {/* Phone Number Input */}
        <input
          id={id}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder={placeholder}
          required={required}
          className="flex-1 appearance-none px-6 py-3.5 text-lg text-gray-500 font-bold bg-white placeholder-gray-500 outline-none border border-gray-200 focus:ring-4 focus:ring-red-200 rounded-xl"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>
      
      {/* Preview of full phone number */}
      {phoneNumber && (
        <div className="mt-1 text-xs text-gray-400">
          Fullt nummer: {countryCode}{phoneNumber}
        </div>
      )}
    </div>
  );
} 