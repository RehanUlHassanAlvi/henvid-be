import React, { useState, useEffect, useRef } from "react";
import Video, { Room } from "twilio-video";

interface VideoCallComponentProps {
  meetingStatus: string;
  roomCode: string;
  onStatusChange?: (status: string) => void;
  identity?: string;
  className?: string;
}

const VideoCallComponent: React.FC<VideoCallComponentProps> = ({
  meetingStatus,
  roomCode,
  onStatusChange,
  identity = "User",
  className = ""
}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteParticipants, setRemoteParticipants] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const localMediaRef = useRef<HTMLDivElement>(null);
  const remoteMediaRef = useRef<HTMLDivElement>(null);
  const [localVideoTrackState, setLocalVideoTrackState] = useState<any | null>(null);
  const [localAudioTrackState, setLocalAudioTrackState] = useState<any | null>(null);

  // Auto-join room when component mounts or when we want to start the call
  useEffect(() => {
    // Auto-join for guests immediately, for hosts when status becomes active
    const shouldJoin = identity.includes('guest') || meetingStatus === "active" || meetingStatus === "ringing";
    
    if (shouldJoin && !room && !isConnecting) {
      joinRoom();
    }
    
    // Cleanup on unmount
    return () => {
      if (room) {
        disconnectRoom();
      }
    };
  }, [meetingStatus, roomCode]);

  const joinRoom = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      console.log('Joining room:', roomCode, 'as:', identity);
      
      // Get token from our API
      const res = await fetch("/api/videocalls/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          roomCode, 
          participantType: identity.includes('host') ? 'host' : 'guest',
          participantId: identity
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get token');
      }
      
      const data = await res.json();
      console.log('Got token data:', data);

      // Create local audio track (always available)
      const localAudioTrack = await Video.createLocalAudioTrack();
      setLocalAudioTrackState(localAudioTrack);

      // Try to create local video track – if webcam is missing we'll continue with audio-only
      let localVideoTrack: any = null;
      try {
        localVideoTrack = await Video.createLocalVideoTrack();
        setLocalVideoTrackState(localVideoTrack);
      } catch (trackErr: any) {
        console.warn('🎥  Could not get webcam, continuing audio-only:', trackErr?.message || trackErr);
      }

      const initialTracks = localVideoTrack ? [localAudioTrack, localVideoTrack] : [localAudioTrack];

      // Connect to Twilio Video room
      const connectedRoom = await Video.connect(data.accessToken, {
        name: roomCode,
        tracks: initialTracks,
      });

      setRoom(connectedRoom);
      setIsConnected(true);
      setIsConnecting(false);

      // Attach local video if we have it
      if (localVideoTrack && localMediaRef.current) {
        localMediaRef.current.innerHTML = '';
        const element = localVideoTrack.attach();
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.objectFit = 'cover';
        element.style.borderRadius = '0.75rem';
        localMediaRef.current.appendChild(element);
      }

      // If audio-only, show placeholder text in local tile
      if (!localVideoTrack && localMediaRef.current) {
        localMediaRef.current.innerHTML = '<div style="color:white;text-align:center;font-size:12px;padding-top:14px">Ingen kamera</div>'; 
      }

      // Handle participant events
      const updateRemoteParticipantCount = () => {
        const count = connectedRoom.participants.size;
        setRemoteParticipants(count);
        console.log('Remote participants in room:', count);
        
        // Update status based on participant count
        if (onStatusChange) {
          if (count >= 1) {
            onStatusChange('active');
          } else {
            onStatusChange('pending');
          }
        }
      };

      // Show remote participant tracks when they connect
      connectedRoom.on("participantConnected", participant => {
        console.log('Participant connected:', participant.identity);
        updateRemoteParticipantCount();
        
        participant.on("trackSubscribed", track => {
          console.log('Track subscribed:', track.kind);
          if (remoteMediaRef.current) {
            const element = (track as any).attach();
            if (track.kind === 'video') {
              element.style.width = '100%';
              element.style.height = '100%';
              element.style.objectFit = 'cover';
              element.style.borderRadius = '0.75rem';
            }
            remoteMediaRef.current.appendChild(element);
          }
        });
        
        participant.on("trackUnsubscribed", track => {
          console.log('Track unsubscribed:', track.kind);
          (track as any).detach().forEach((element: any) => element.remove());
        });
      });

      // Handle participant disconnection
      connectedRoom.on("participantDisconnected", participant => {
        console.log('Participant disconnected:', participant.identity);
        updateRemoteParticipantCount();
        
        // Clear remote video when participant leaves
        if (remoteMediaRef.current) {
          remoteMediaRef.current.innerHTML = '';
        }
      });

      // Show tracks for already connected participants
      connectedRoom.participants.forEach(participant => {
        participant.tracks.forEach(publication => {
          if (publication.track && remoteMediaRef.current) {
            const element = (publication.track as any).attach();
            if (publication.track.kind === 'video') {
              element.style.width = '100%';
              element.style.height = '100%';
              element.style.objectFit = 'cover';
              element.style.borderRadius = '0.75rem';
            }
            remoteMediaRef.current.appendChild(element);
          }
        });
      });

      updateRemoteParticipantCount();

    } catch (error) {
      console.error("Error joining room:", error);
      setError(`Failed to join room: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsConnecting(false);
      setIsConnected(false);
    }
  };

  const disconnectRoom = () => {
    if (room) {
      console.log('Disconnecting from room');
      room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setRemoteParticipants(0);

      // Clear video containers
      if (localMediaRef.current) localMediaRef.current.innerHTML = "";
      if (remoteMediaRef.current) remoteMediaRef.current.innerHTML = "";
    }
  };

  // Show error state
  if (error) {
    return (
      <div className={`h-full w-full bg-red-50 rounded-xl ${className} flex items-center justify-center p-4`}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <p className="text-red-700 font-semibold mb-2">Video Call Error</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              joinRoom();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show connecting state
  if (isConnecting) {
    return (
      <div className={`h-full w-full bg-tertiary rounded-xl ${className} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-highlight">Kobler til video...</p>
        </div>
      </div>
    );
  }

  // Show waiting state for pending calls
  if (meetingStatus === "pending" && !isConnected) {
    return (
      <div className={`h-full w-full bg-tertiary rounded-xl ${className} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-highlight text-4xl mb-4">⏳</div>
          <p className="text-highlight">
            {identity.includes('guest') ? 'Venter på support agent...' : 'Venter på kunden skal koble til...'}
          </p>
          {!identity.includes('guest') && (
            <button 
              onClick={joinRoom}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
            >
              Start Video Call
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show connected video call
  return (
    <div className={`h-full w-full bg-tertiary rounded-xl ${className} relative overflow-hidden`}>
      {/* Remote video (main view) - shows the OTHER person's video */}
      <div className="w-full h-full">
        <div 
          ref={remoteMediaRef} 
          className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center"
        >
          {remoteParticipants < 1 && (
            <div className="text-center text-white">
              <div className="text-4xl mb-4">👤</div>
              <p>
                {identity.includes('guest') 
                  ? 'Venter på support agent...' 
                  : 'Venter på kunden skal koble til...'
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Local video (picture-in-picture) - shows YOUR video */}
      <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white shadow-lg">
        <div 
          ref={localMediaRef} 
          className="w-full h-full bg-gray-700 flex items-center justify-center"
        >
          <div className="text-white text-sm">Din video</div>
        </div>
      </div>
      
      {/* Connection status */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
        {remoteParticipants >= 1 
          ? `${remoteParticipants + 1} personer tilkoblet`
          : 'Venter på deltaker...'
        }
      </div>
      
      {/* Disconnect button */}
      <div className="absolute top-4 right-4">
        <button 
          onClick={disconnectRoom}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Forlat samtale
        </button>
      </div>
    </div>
  );
};

export default VideoCallComponent; 