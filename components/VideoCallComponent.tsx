import React, { useState, useEffect, useRef } from "react";
import Video, { Room, LocalVideoTrack, LocalAudioTrack, RemoteParticipant } from "twilio-video";
import VideoCallControls from "./VideoCallControls";

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
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const localVideoTrackRef = useRef<LocalVideoTrack | null>(null);
  const localAudioTrackRef = useRef<LocalAudioTrack | null>(null);

  // Auto-connect when meeting status changes to "started"
  useEffect(() => {
    if (meetingStatus === "started" && !room && !isConnecting) {
      joinRoom();
    }
    
    // Cleanup on unmount or when meeting ends
    return () => {
      if (room) {
        disconnectRoom();
      }
    };
  }, [meetingStatus]);

  const joinRoom = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Get token from our local API
      const res = await fetch("/api/videocalls/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          roomCode, 
          participantType: identity.includes('host') ? 'host' : 'guest',
          participantId: identity
        }),
      });
      const data = await res.json();

      // Create local tracks
      const [localVideoTrack, localAudioTrack] = await Promise.all([
        Video.createLocalVideoTrack(),
        Video.createLocalAudioTrack()
      ]);

      localVideoTrackRef.current = localVideoTrack;
      localAudioTrackRef.current = localAudioTrack;

      // Connect to room
      const joinedRoom = await Video.connect(data.token, {
        name: roomCode,
        tracks: [localAudioTrack, localVideoTrack],
      });

      setRoom(joinedRoom);
      setIsConnecting(false);

      // Attach local video
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = "";
        const videoElement = localVideoTrack.attach();
        videoElement.style.width = "100%";
        videoElement.style.height = "100%";
        videoElement.style.objectFit = "cover";
        videoElement.style.borderRadius = "0.75rem"; // rounded-xl
        localVideoRef.current.appendChild(videoElement);
      }

      // Handle participants
      const updateParticipants = () => {
        setParticipants(Array.from(joinedRoom.participants.values()));
      };

      // Handle existing participants
      joinedRoom.participants.forEach((participant) => {
        participant.tracks.forEach((publication) => {
          if (publication.isSubscribed && publication.track) {
            attachTrack(publication.track);
          }
        });
        participant.on("trackSubscribed", attachTrack);
        participant.on("trackUnsubscribed", detachTrack);
      });

      // Handle new participants
      joinedRoom.on("participantConnected", (participant) => {
        updateParticipants();
        participant.tracks.forEach((publication) => {
          if (publication.isSubscribed && publication.track) {
            attachTrack(publication.track);
          }
        });
        participant.on("trackSubscribed", attachTrack);
        participant.on("trackUnsubscribed", detachTrack);
      });

      joinedRoom.on("participantDisconnected", () => {
        updateParticipants();
        if (remoteVideoRef.current) {
          remoteVideoRef.current.innerHTML = "";
        }
      });

      updateParticipants();
      
      // Auto-transition to "done" status when video is ready
      if (onStatusChange) {
        setTimeout(() => {
          onStatusChange("done");
        }, 1000);
      }

    } catch (error) {
      console.error("Error joining room:", error);
      setError(`Failed to join room: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsConnecting(false);
    }
  };

  const attachTrack = (track) => {
    if (!track || !remoteVideoRef.current) return;
    
    const trackElement = track.attach();
    trackElement.style.width = "100%";
    trackElement.style.height = "100%";
    trackElement.style.objectFit = "cover";
    trackElement.style.borderRadius = "0.75rem"; // rounded-xl
    
    remoteVideoRef.current.innerHTML = "";
    remoteVideoRef.current.appendChild(trackElement);
  };

  const detachTrack = (track) => {
    if (track) {
      const elements = track.detach();
      elements.forEach((element) => element.remove());
    }
  };

  const disconnectRoom = () => {
    if (room) {
      // Stop and detach local tracks
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.detach().forEach((element) => element.remove());
        localVideoTrackRef.current = null;
      }
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.detach().forEach((element) => element.remove());
        localAudioTrackRef.current = null;
      }

      room.disconnect();
      setRoom(null);
      setParticipants([]);

      // Clear video containers
      if (localVideoRef.current) localVideoRef.current.innerHTML = "";
      if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = "";
    }
  };

  // Render different states based on meetingStatus - matching existing UI exactly
  if (meetingStatus === "initiated") {
    return (
      <div className={`h-full w-full bg-tertiary rounded-xl ${className}`}>
        <div className="w-full h-full flex justify-center items-center">
          <p className="text-highlight text-center">
            Venter på kunden skal koble til...
          </p>
        </div>
      </div>
    );
  }

  if (meetingStatus === "started") {
    return (
      <div className={`h-full w-full bg-tertiary rounded-xl ${className}`}>
        <div className="w-full h-full flex justify-center items-center">
          <p className="text-highlight text-center">
            {isConnecting 
              ? "Kobler til videosignal..." 
              : "Kunden har koblet til, venter på videosignal"
            }
          </p>
        </div>
      </div>
    );
  }

  // When meetingStatus === "done", show the video interface
  if (meetingStatus === "done" && room) {
    return (
      <div className={`relative w-full h-full rounded-xl overflow-hidden ${className}`}>
        {/* Main video area - Remote participant or local if no remote */}
        <div ref={remoteVideoRef} className="w-full h-full bg-gray-800 rounded-xl">
          {participants.length === 0 && (
            <div ref={localVideoRef} className="w-full h-full bg-gray-800 rounded-xl" />
          )}
        </div>
        
        {/* Picture-in-picture local video when there are remote participants */}
        {participants.length > 0 && (
          <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <div ref={localVideoRef} className="w-full h-full" />
          </div>
        )}

        {/* Video Call Controls */}
        <VideoCallControls
          room={room}
          localVideoTrack={localVideoTrackRef.current}
          localAudioTrack={localAudioTrackRef.current}
          isVisible={true}
        />
        
        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-xl">
            <div className="text-white text-center p-4">
              <p className="text-sm">{error}</p>
              <button 
                onClick={joinRoom}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
              >
                Prøv igjen
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback to original placeholder (shouldn't normally reach here)
  return (
    <img
      className={`w-full h-full object-contain rounded-xl ${className}`}
      src="/assets/images/customer1.jpg"
      alt="Main"
    />
  );
};

export default VideoCallComponent; 