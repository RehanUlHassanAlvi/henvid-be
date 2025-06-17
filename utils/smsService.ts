import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export class SMSService {
  
  /**
   * Generate a random verification code
   * @returns 4-digit verification code
   */
  static generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Send verification code SMS
   * @param phone - Phone number to send to
   * @param code - Verification code to send
   */
  static async sendVerificationCode(phone: string, code: string): Promise<void> {
    const message = `Panteinnsamling verifikasjonskode: ${code}`;
    await this.sendSMS(phone, message);
  }

  /**
   * Send video call invitation SMS with room link
   * @param phone - Phone number to send to
   * @param roomCode - Video call room code
   * @param companyName - Name of the company
   * @param userName - Name of the user initiating the call
   */
  static async sendVideoCallInvitation(
    phone: string, 
    roomCode: string, 
    companyName: string, 
    userName?: string
  ): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const callLink = `${baseUrl}/${companyName}/${roomCode}`;
    
    const message = userName 
      ? `${userName} fra ${companyName} vil starte en videosamtale med deg. Klikk på lenken for å delta: ${callLink}`
      : `${companyName} vil starte en videosamtale med deg. Klikk på lenken for å delta: ${callLink}`;
    
    await this.sendSMS(phone, message);
  }

  /**
   * Send custom SMS message
   * @param phone - Phone number to send to
   * @param message - Message to send
   */
  static async sendCustomSMS(phone: string, message: string): Promise<void> {
    await this.sendSMS(phone, message);
  }

  /**
   * Core SMS sending function using SMSTeknik SOAP API
   * @param phone - Phone number to send to
   * @param text - SMS text content
   */
  private static async sendSMS(phone: string, text: string): Promise<void> {
    // Validate environment variables
    if (!process.env.SMS_API_ID || !process.env.SMS_API_USER || !process.env.SMS_API_PASS) {
      throw new Error('SMS configuration missing. Please check environment variables.');
    }

    // Clean phone number (remove spaces and non-digits except +)
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Ensure Norwegian format if not international
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+47${cleanPhone.replace(/^47/, '')}`;

    const soapRequest = 
    `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
      <soap:Body>
        <SendSMSSingle xmlns="https://api.smsteknik.se/send/ws/v1.1">
          <id>${process.env.SMS_API_ID}</id>
          <user>${process.env.SMS_API_USER}</user>
          <pass>${process.env.SMS_API_PASS}</pass>
          <multisms>0</multisms>
          <maxmultisms>0</maxmultisms>
          <text>${text}</text>
          <smssender>${process.env.SMS_SENDER || 'Henvid'}</smssender>
          <recipient>${formattedPhone}</recipient>
        </SendSMSSingle>
      </soap:Body>
    </soap:Envelope>`;

    const config = {
      headers: { 'Content-Type': 'text/xml' },
      timeout: 10000 // 10 second timeout
    };

    try {
      console.log(`Sending SMS to ${formattedPhone}: ${text}`);
      
      const res = await axios.post(
        'https://api.smsteknik.se/send/ws/v1.1?op=SendSMSSingle', 
        soapRequest, 
        config
      );

      // Parse the SOAP response
      const parser = new XMLParser();
      const parsedResponse = parser.parse(res.data);

      // Extract the result message
      const result = parsedResponse?.['soap:Envelope']?.['soap:Body']?.SendSMSSingleResponse?.SendSMSSingleResult;

      if (result?.startsWith("0:No SMS left")) {
        throw new Error('No SMS credits left to send');
      }

      if (result?.startsWith("1:")) {
        throw new Error(`SMS API Error: ${result}`);
      }

      console.log('SMS sent successfully:', result);
      
    } catch (error) {
      console.error('Error sending SMS:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('SMS service timeout. Please try again.');
        }
        throw new Error(`SMS service error: ${error.message}`);
      }
      
      throw new Error('Failed to send SMS');
    }
  }

  /**
   * Validate Norwegian phone number format
   * @param phone - Phone number to validate
   * @returns boolean indicating if valid
   */
  static isValidNorwegianPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Norwegian mobile numbers: +47 followed by 8 digits starting with 4, 9, or some 3s
    const norwegianMobileRegex = /^(\+47)?[49]\d{7}$/;
    
    return norwegianMobileRegex.test(cleanPhone.replace('+47', ''));
  }

  /**
   * Format phone number for display
   * @param phone - Phone number to format
   * @returns formatted phone number
   */
  static formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const withoutCountry = cleanPhone.replace(/^\+47/, '');
    
    if (withoutCountry.length === 8) {
      return `+47 ${withoutCountry.slice(0, 3)} ${withoutCountry.slice(3, 5)} ${withoutCountry.slice(5)}`;
    }
    
    return phone; // Return original if can't format
  }
}

export default SMSService; 