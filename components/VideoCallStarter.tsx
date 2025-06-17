import React, { useState } from 'react';
import { LuPhone, LuSend, LuLoader } from 'react-icons/lu';
import { useAuth } from '@/utils/auth-context';

interface VideoCallStarterProps {
  onCallCreated?: (roomCode: string, roomUrl: string) => void;
  className?: string;
}

const VideoCallStarter: React.FC<VideoCallStarterProps> = ({ 
  onCallCreated,
  className = ""
}) => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as Norwegian phone number (XXX XX XXX)
    if (digits.length <= 8) {
      return digits.replace(/(\d{3})(\d{2})(\d{3})/, '$1 $2 $3').trim();
    }
    
    return digits.slice(0, 8).replace(/(\d{3})(\d{2})(\d{3})/, '$1 $2 $3').trim();
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    // Norwegian mobile numbers: 8 digits starting with 4 or 9
    return /^[49]\d{7}$/.test(digits);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
    
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (!cleanPhone) {
      setError('Vennligst skriv inn et telefonnummer');
      return;
    }

    if (!validatePhoneNumber(cleanPhone)) {
      setError('Vennligst skriv inn et gyldig norsk mobilnummer');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/videocalls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `+47${cleanPhone}`,
          companyId: user?.company?.id,
          userId: user?.id,
          guestName: 'Kunde'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kunne ikke starte videosamtale');
      }

      setSuccess('SMS sendt! Kunden vil motta en link til videosamtalen.');
      setPhoneNumber('');
      
      // Notify parent component
      if (onCallCreated) {
        onCallCreated(data.videoCall.code, data.roomUrl);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white p-8 rounded-lg shadow-sm ${className}`}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <LuPhone className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Start a video call 📞
        </h2>
        <p className="text-gray-600">
          Enter the customer's phone number to start the call.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          {/* Country code selector */}
          <div className="flex items-center gap-2 px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg">
            <span className="text-lg">🇳🇴</span>
            <span className="text-gray-600 font-medium">+47</span>
          </div>
          
          {/* Phone number input */}
          <div className="flex-1">
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Telephone number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-lg"
              disabled={loading}
            />
          </div>
          
          {/* Send button */}
          <button
            type="submit"
            disabled={loading || !phoneNumber.trim()}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <LuLoader className="w-5 h-5 animate-spin" />
            ) : (
              <LuSend className="w-5 h-5" />
            )}
            Send
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {/* Help text */}
        <div className="text-center text-sm text-gray-500">
          <p>The customer will receive an SMS with a link to join the video call.</p>
        </div>
      </form>
    </div>
  );
};

export default VideoCallStarter; 