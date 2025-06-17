import React, { useState, useEffect } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";

interface VideoCallControlsProps {
  room: any;
  localVideoTrack: any;
  localAudioTrack: any;
  isVisible?: boolean;
  className?: string;
}

const VideoCallControls: React.FC<VideoCallControlsProps> = ({
  room,
  localVideoTrack,
  localAudioTrack,
  isVisible = true,
  className = ""
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");

  useEffect(() => {
    if (room) {
      updateDevices();
    }
  }, [room]);

  const updateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videos = devices.filter((d) => d.kind === "videoinput");
      const audios = devices.filter((d) => d.kind === "audioinput");
      setVideoDevices(videos);
      setAudioDevices(audios);

      if (!selectedVideoDevice && videos.length > 0) {
        setSelectedVideoDevice(videos[0].deviceId);
      }
      if (!selectedAudioDevice && audios.length > 0) {
        setSelectedAudioDevice(audios[0].deviceId);
      }
    } catch (err) {
      console.error("Error enumerating devices:", err);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.enable(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.enable(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const switchVideoDevice = async (deviceId: string) => {
    if (!room || !localVideoTrack) return;
    
    try {
      const { Video } = await import("twilio-video");
      const newVideoTrack = await Video.createLocalVideoTrack({
        deviceId: { exact: deviceId },
      });

      await room.localParticipant.unpublishTrack(localVideoTrack);
      await room.localParticipant.publishTrack(newVideoTrack);

      localVideoTrack.stop();
      setSelectedVideoDevice(deviceId);
    } catch (error) {
      console.error("Error switching video device:", error);
    }
  };

  const switchAudioDevice = async (deviceId: string) => {
    if (!room || !localAudioTrack) return;
    
    try {
      const { Video } = await import("twilio-video");
      const newAudioTrack = await Video.createLocalAudioTrack({
        deviceId: { exact: deviceId },
      });

      await room.localParticipant.unpublishTrack(localAudioTrack);
      await room.localParticipant.publishTrack(newAudioTrack);

      localAudioTrack.stop();
      setSelectedAudioDevice(deviceId);
    } catch (error) {
      console.error("Error switching audio device:", error);
    }
  };

  if (!isVisible || !room) {
    return null;
  }

  return (
    <div className={`absolute bottom-4 left-4 flex gap-2 ${className}`}>
      {/* Microphone Toggle */}
      <button
        onClick={toggleAudio}
        className={`p-3 rounded-lg transition-all duration-200 ${
          isAudioEnabled
            ? "bg-white/90 hover:bg-white text-gray-800"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
        title={isAudioEnabled ? "Skru av mikrofon" : "Skru på mikrofon"}
      >
        {isAudioEnabled ? <FaMicrophone size={16} /> : <FaMicrophoneSlash size={16} />}
      </button>

      {/* Camera Toggle */}
      <button
        onClick={toggleVideo}
        className={`p-3 rounded-lg transition-all duration-200 ${
          isVideoEnabled
            ? "bg-white/90 hover:bg-white text-gray-800"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
        title={isVideoEnabled ? "Skru av kamera" : "Skru på kamera"}
      >
        {isVideoEnabled ? <FaVideo size={16} /> : <FaVideoSlash size={16} />}
      </button>

      {/* Device Selectors - Hidden on mobile */}
      <div className="hidden md:flex gap-2">
        {/* Camera Selector */}
        {videoDevices.length > 1 && (
          <select
            value={selectedVideoDevice}
            onChange={(e) => switchVideoDevice(e.target.value)}
            className="bg-white/90 text-gray-800 text-sm rounded-lg px-2 py-1 border-none focus:ring-2 focus:ring-orange-200"
            title="Velg kamera"
          >
            {videoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                📹 {device.label || "Kamera"}
              </option>
            ))}
          </select>
        )}

        {/* Microphone Selector */}
        {audioDevices.length > 1 && (
          <select
            value={selectedAudioDevice}
            onChange={(e) => switchAudioDevice(e.target.value)}
            className="bg-white/90 text-gray-800 text-sm rounded-lg px-2 py-1 border-none focus:ring-2 focus:ring-orange-200"
            title="Velg mikrofon"
          >
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                🎤 {device.label || "Mikrofon"}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default VideoCallControls; 