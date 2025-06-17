import { AccessToken, VideoGrant } from 'twilio';

export class TwilioVideoService {
  
  /**
   * Generate a Twilio Video access token for a participant
   * @param identity - Unique identifier for the participant
   * @param roomName - Name of the video room
   * @returns Twilio Video access token
   */
  static generateAccessToken(identity: string, roomName: string): string {
    // Validate environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY;
    const apiSecret = process.env.TWILIO_API_SECRET;

    if (!accountSid || !apiKey || !apiSecret) {
      throw new Error('Twilio configuration missing. Please check environment variables.');
    }

    // Create an access token
    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: identity,
      ttl: 14400, // Token valid for 4 hours
    });

    // Create a video grant for this token
    const videoGrant = new VideoGrant({
      room: roomName,
    });

    // Add the video grant to the token
    token.addGrant(videoGrant);

    // Serialize the token to JWT
    return token.toJwt();
  }

  /**
   * Generate a unique room code for video calls
   * @param companyId - Company ID for prefixing
   * @returns Unique room code
   */
  static generateRoomCode(companyId?: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const prefix = companyId ? companyId.slice(-4) : 'room';
    
    return `${prefix}-${timestamp}-${random}`.toLowerCase();
  }

  /**
   * Generate participant identity
   * @param type - Type of participant ('host' or 'guest')
   * @param id - User ID or phone number
   * @returns Participant identity string
   */
  static generateParticipantIdentity(type: 'host' | 'guest', id: string): string {
    const timestamp = Date.now();
    return `${type}_${id}_${timestamp}`;
  }

  /**
   * Validate room code format
   * @param roomCode - Room code to validate
   * @returns boolean indicating if valid
   */
  static isValidRoomCode(roomCode: string): boolean {
    // Format: prefix-timestamp-random (e.g., comp-1234567890-abc123)
    const roomCodeRegex = /^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/;
    return roomCodeRegex.test(roomCode);
  }

  /**
   * Extract company prefix from room code
   * @param roomCode - Room code
   * @returns Company prefix or null
   */
  static extractCompanyPrefix(roomCode: string): string | null {
    const parts = roomCode.split('-');
    return parts.length >= 3 ? parts[0] : null;
  }
}

export default TwilioVideoService; 