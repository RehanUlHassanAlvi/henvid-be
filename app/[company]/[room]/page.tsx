"use client";

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { LuCamera, LuCameraOff, LuCopy, LuPhoneOff } from "react-icons/lu";
import { MdOutlineStar, MdOutlineStarOutline } from "react-icons/md";
import VideoCallComponent from "../../../components/VideoCallComponent";
import { useParams } from "next/navigation";

interface VideoCallInfo {
  customer: {
    name: string;
    phone: string;
    email?: string;
    initials: string;
    image?: string;
  };
  company: {
    name: string;
    logo?: string;
  };
  supportAgent?: {
    firstName: string;
    lastName: string;
    image?: string;
  };
  status: string;
}

export default function Meetingpage() {
  const [meetingStatus, setMeetingStatus] = useState("initiated");
  const [supportCam, setSupportCam] = useState(true);
  const [videoCallInfo, setVideoCallInfo] = useState<VideoCallInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  const handleSupportCam = () => {
    setSupportCam(!supportCam);
  };

  // Get room code from URL parameters
  const roomcode = params.room as string;

  // Fetch video call information
  useEffect(() => {
    const fetchVideoCallInfo = async () => {
      if (!roomcode) {
        console.log('No room code provided');
        setLoading(false);
        return;
      }
      
      console.log('Fetching video call info for room:', roomcode);
      
      try {
        // Use absolute URL to handle network access properly
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const url = `${baseUrl}/api/videocalls/${roomcode}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
          setVideoCallInfo(data);
          // Update meeting status based on video call status
          setMeetingStatus(data.status);
          console.log('Video call info set successfully');
        } else {
          console.error('Failed to fetch video call info:', data.error);
          toast.error(`Kunne ikke hente samtaleinfo: ${data.error || 'Ukjent feil'}`);
        }
      } catch (error) {
        console.error('Error fetching video call info:', error);
        toast.error(`Feil ved lasting av samtaleinfo: ${error instanceof Error ? error.message : 'Ukjent feil'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoCallInfo();
  }, [roomcode]);

  const handleCopyRoomcode = () => {
    navigator.clipboard.writeText(roomcode);
    toast.success("Romkode kopiert");
  };

  const handleClose = () => {
    setMeetingStatus("review");
    window.close();
  };

  //STAR RATING
  const [currentStarRating, setCurrentStarRating] = useState(0);
  const handleStarHover = (rating: number) => {
    setCurrentStarRating(rating);
  };

  const handleStarLeave = () => {
    if (currentStarRating > 4) {
      setCurrentStarRating(5);
    } else {
      setCurrentStarRating(0);
    }
  };

  const handleStarClick = (index: number) => {
    setCurrentStarRating(index);
  };

  const [currentStarRating2, setCurrentStarRating2] = useState(0);
  const handleStarHover2 = (rating: number) => {
    setCurrentStarRating2(rating);
  };

  const handleStarLeave2 = () => {
    if (currentStarRating2 > 4) {
      setCurrentStarRating2(5);
    } else {
      setCurrentStarRating2(0);
    }
  };

  const handleStarClick2 = (index: number) => {
    setCurrentStarRating2(index);
  };

  //temp
  const LoggedIn = false;

  // Show loading state
  if (loading) {
    return (
      <main className="flex flex-col w-full items-center justify-center p-8 min-h-screen">
        <Toaster />
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Laster samtaleinfo...</p>
          <p className="mt-2 text-sm text-gray-500">Romkode: {roomcode}</p>
        </div>
      </main>
    );
  }

  // Show error state if loading failed
  if (!loading && !videoCallInfo) {
    return (
      <main className="flex flex-col w-full items-center justify-center p-8 min-h-screen">
        <Toaster />
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Kunne ikke laste samtaleinfo</h1>
          <p className="text-gray-600 mb-4">Romkode: {roomcode}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Prøv igjen
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full items-center justify-start p-8">
      <Toaster />
      {meetingStatus === "review" ? (
        LoggedIn ? (
          <div className="w-full h-full flex flex-col bg-highlight rounded-2xl p-4 min-h-[50dvh]">
            <div className="flex w-full h-full items-center justify-center flex-wrap gap-4 mb-6">
              <div className="w-full items-center flex flex-col justify-center pb-10">
                <h1 className="text-xl md:text-3xl font-semibold text-center">
                  Hvordan gikk det? 👏
                </h1>
                <p className="text-sm pt-2 text-center">
                  Fullfør kommentaren til samtalen og svar på om problemet ble
                  løst
                </p>
                <br />
                <br />
                <div>
                  <p className="hidden">Ble problemet løst?</p>
                </div>
                <div className="flex flex-col w-full gap-4 justify-start pt-4 max-w-lg">
                  <div className="w-full">
                    <textarea
                      rows={4}
                      placeholder="Skriv en kommentar om ønskelig"
                      className="w-full shadow-sm shadow-black/25 rounded-2xl p-4"
                    />
                  </div>
                  <div className="flex flex-row gap-2 justify-between items-center bg-white p-4 rounded-2xl shadow-sm shadow-black/25">
                    <div className="w-full">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 text-start">
                        Ble problemet løst?
                      </h3>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div
                        className="whitespace-nowrap cursor-pointer py-3 px-4 rounded-xl border text-white border-gray-200 bg-red-100 hover:bg-red-200 focus:ring focus:ring-red-200 transition duration-200 flex items-center gap-2"
                        onClick={handleClose}
                      >
                        <span className="font-semibold text-xl ">❌</span>
                      </div>

                      <div
                        className="whitespace-nowrap cursor-pointer py-3 px-4 rounded-xl border text-white border-gray-200 bg-green-100 hover:bg-green-200 focus:ring focus:ring-red-200 transition duration-200 flex items-center gap-2"
                        onClick={handleClose}
                      >
                        <span className="font-semibold text-xl">✔️</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full hidden justify-center items-center">
                    <p>Videre uten å svare</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col bg-highlight rounded-2xl p-4 min-h-[50dvh]">
            <div className="flex w-full h-full items-center justify-center flex-wrap gap-4 mb-6">
              <div className="w-full items-center flex flex-col justify-center pb-10">
                <h1 className="text-xl md:text-3xl font-semibold text-center">
                  Hva synes du om hjelpen du fikk? 💌
                </h1>
                <p className="text-sm pt-2 text-center">
                  Vi setter på pris på om du svarer på spørsmålene under. <br />
                  Tar 20 sekunder.
                </p>
                <br />
                <br />

                <div className="flex flex-col w-full gap-4 justify-start pt-4 max-w-xl">
                  <div className="flex flex-row gap-2 justify-between items-center bg-white p-4 rounded-2xl shadow-sm shadow-black/25">
                    <div className="w-full">
                      <h3 className="text-sm md:text-base font-semibold text-gray-800 text-start">
                        Hva synes du om denne måten å få hjelp på?
                      </h3>
                    </div>

                    <div className="flex gap-0 justify-center">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <div
                          key={index}
                          className="group"
                          onMouseEnter={() => handleStarHover(index)}
                          onMouseLeave={handleStarLeave}
                          onClick={() => handleStarClick(index)}
                        >
                          <MdOutlineStarOutline
                            size={24}
                            className={`group-hover:hidden my-2 cursor-pointer flex mx-0.5 ${
                              index <= currentStarRating ? "hidden" : ""
                            }`}
                          />
                          <MdOutlineStar
                            size={24}
                            className={`text-yellow-400 my-2 cursor-pointer scale-110 mx-0.5 group-hover:flex ${
                              index <= currentStarRating ? "" : "hidden"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row gap-2 justify-between items-center bg-white p-4 rounded-2xl shadow-sm shadow-black/25">
                    <div className="w-full">
                      <h3 className="text-sm md:text-base font-semibold text-gray-800 text-start">
                        Hva synes du om arbeideren som hjalp deg?
                      </h3>
                    </div>
                    <div className="flex gap-0 justify-center">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <div
                          key={index}
                          className="group"
                          onMouseEnter={() => handleStarHover2(index)}
                          onMouseLeave={handleStarLeave2}
                          onClick={() => handleStarClick2(index)}
                        >
                          <MdOutlineStarOutline
                            size={24}
                            className={`group-hover:hidden my-2 cursor-pointer flex mx-0.5 ${
                              index <= currentStarRating2 ? "hidden" : ""
                            }`}
                          />
                          <MdOutlineStar
                            size={24}
                            className={`text-yellow-400 my-2 cursor-pointer scale-110 mx-0.5 group-hover:flex ${
                              index <= currentStarRating2 ? "" : "hidden"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row gap-2 justify-between items-center bg-white p-4 rounded-2xl shadow-sm shadow-black/25">
                    <div className="w-full">
                      <h3 className="text-sm md:text-base font-semibold text-gray-800 text-start">
                        Ble problemet løst?
                      </h3>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="whitespace-nowrap cursor-pointer py-3 px-4 rounded-xl border text-white border-gray-200 bg-red-100 hover:bg-red-200 focus:ring focus:ring-red-200 transition duration-200 flex items-center gap-2">
                        <span className="font-semibold text-xl ">❌</span>
                      </div>

                      <div className="whitespace-nowrap cursor-pointer py-3 px-4 rounded-xl border text-white border-gray-200 bg-green-100 hover:bg-green-200 focus:ring focus:ring-red-200 transition duration-200 flex items-center gap-2">
                        <span className="font-semibold text-xl">✔️</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full">
                    <textarea
                      rows={4}
                      placeholder="Skriv en kommentar om ønskelig"
                      className="w-full shadow-sm shadow-black/25 rounded-2xl p-4"
                    />
                  </div>
                  <div className="w-full p-3">
                    <div className="flex flex-wrap md:justify-end -m-2">
                      <div className="w-full p-2">
                        <div
                          className="block cursor-pointer px-8 py-3.5 text-lg text-center text-white font-bold bg-primary hover:bg-secondary focus:ring-4 focus:ring-red-200 rounded-xl"
                          onClick={handleClose}
                        >
                          Lukk
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full hidden justify-center items-center">
                    <p>Videre uten å svare</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="w-full h-auto flex flex-col bg-highlight rounded-2xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex">
                {/* Support Agent Avatar - Show image if available, otherwise initials */}
                <div className="relative rounded-full bg-red-500 overflow-hidden h-10 w-10 border-2 border-white flex items-center justify-center">
                  {videoCallInfo?.supportAgent?.image ? (
                    <img
                      className="w-full h-full object-cover"
                      src={videoCallInfo.supportAgent.image}
                      alt={`${videoCallInfo.supportAgent.firstName} ${videoCallInfo.supportAgent.lastName}`}
                    />
                  ) : (
                    <span className="text-white text-sm font-bold">
                      {loading ? '...' : 
                        videoCallInfo?.supportAgent ? 
                          `${videoCallInfo.supportAgent.firstName[0]}${videoCallInfo.supportAgent.lastName[0]}`.toUpperCase() : 
                          'SA'
                      }
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 bg-opacity-50 rounded-lg py-2 px-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M17.8251 6.50695V6.50832V13.4917C17.8251 14.9089 17.4046 15.9801 16.6882 16.6964C15.9718 17.4128 14.9006 17.8333 13.4834 17.8333H6.50841C5.09119 17.8333 4.02017 17.4128 3.30386 16.6956C2.58747 15.9783 2.16675 14.9051 2.16675 13.4833V6.50832C2.16675 5.09109 2.58726 4.01992 3.30363 3.30354C4.02001 2.58717 5.09118 2.16666 6.50841 2.16666H13.4917C14.9091 2.16666 15.9801 2.58721 16.6953 3.30332C17.4104 4.01933 17.829 5.09004 17.8251 6.50695ZM13.6667 15.9167C14.3411 15.9167 14.9432 15.7849 15.3641 15.364C15.7849 14.9431 15.9167 14.341 15.9167 13.6667V12.1667C15.9167 11.4923 15.7849 10.8902 15.3641 10.4694C14.9432 10.0485 14.3411 9.91666 13.6667 9.91666H10.5001C9.82577 9.91666 9.22367 10.0485 8.80278 10.4694C8.38188 10.8902 8.25008 11.4923 8.25008 12.1667V13.6667C8.25008 14.341 8.38188 14.9431 8.80278 15.364C9.22367 15.7849 9.82577 15.9167 10.5001 15.9167H13.6667Z"
                    fill="#A3A3A3"
                    stroke="#A3A3A3"
                  />
                </svg>
                <p className="text-xs">
                  <span className="font-semibold ">
                    {loading ? 'Laster...' : 
                      videoCallInfo?.supportAgent ? 
                        `${videoCallInfo.supportAgent.firstName} ${videoCallInfo.supportAgent.lastName}` : 
                        'Support Agent'
                    }
                  </span>
                  <span />
                  <span className="text-gray-700">
                    &nbsp;deler kameraet sitt
                  </span>
                </p>
              </div>
            </div>
            <div
              onClick={handleCopyRoomcode}
              className="flex items-center gap-2 cursor-pointer bg-highlight hover:bg-white py-2 px-4 hover:border hover:border-gray-200 rounded-lg"
            >
              <span className="font-semibold">{roomcode}</span>
              <LuCopy />
            </div>
            <div className="flex gap-2 flex-wrap">
              <a
                className="whitespace-nowrap p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:ring focus:ring-orange-200 transition duration-200 flex items-center gap-2"
                href="#"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M14.1666 2.02502H5.83329C3.33329 2.02502 1.66663 3.69169 1.66663 6.19169V11.1917C1.66663 13.6917 3.33329 15.3584 5.83329 15.3584H9.16663L12.875 17.825C13.425 18.1917 14.1666 17.8 14.1666 17.1334V15.3584C16.6666 15.3584 18.3333 13.6917 18.3333 11.1917V6.19169C18.3333 3.69169 16.6666 2.02502 14.1666 2.02502ZM12.9166 9.37502H7.08329C6.74163 9.37502 6.45829 9.09169 6.45829 8.75002C6.45829 8.40836 6.74163 8.12502 7.08329 8.12502H12.9166C13.2583 8.12502 13.5416 8.40836 13.5416 8.75002C13.5416 9.09169 13.2583 9.37502 12.9166 9.37502Z"
                    fill="#282828"
                  />
                </svg>
              </a>
              <a
                className="whitespace-nowrap py-3 px-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:ring focus:ring-orange-200 transition duration-200 flex items-center gap-2"
                href="#"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M2.16663 10C2.16663 5.6845 5.68443 2.16669 9.99996 2.16669C14.3155 2.16669 17.8333 5.6845 17.8333 10C17.8333 14.3155 14.3155 17.8334 9.99996 17.8334C5.68443 17.8334 2.16663 14.3155 2.16663 10ZM11.125 13.3334V11.125H13.3333C13.9511 11.125 14.4583 10.6178 14.4583 10C14.4583 9.38221 13.9511 8.87502 13.3333 8.87502H11.125V6.66669C11.125 6.04888 10.6178 5.54169 9.99996 5.54169C9.38215 5.54169 8.87496 6.04888 8.87496 6.66669V8.87502H6.66663C6.04882 8.87502 5.54163 9.38221 5.54163 10C5.54163 10.6178 6.04882 11.125 6.66663 11.125H8.87496V13.3334C8.87496 13.9512 9.38215 14.4584 9.99996 14.4584C10.6178 14.4584 11.125 13.9512 11.125 13.3334Z"
                    fill="#282828"
                    stroke="#282828"
                  />
                </svg>
                <span className="font-semibold text-sm ">Inviter</span>
              </a>
            </div>
          </div>
          <div className="relative bg-tertiary w-full rounded-2xl min-h-[50dvh] max-h-[60dvh]">
                      <VideoCallComponent 
            meetingStatus={meetingStatus}
            roomCode={roomcode}
            onStatusChange={setMeetingStatus}
            identity="guest"
          />

            {/*
                <div className="absolute top-3 left-3 mr-8">
                  <div className="bg-white rounded-xl border border-gray-100 p-2 flex gap-3 flex-wrap items-start mb-2">
                    <div className="rounded-xl border border-gray-100 w-10 h-10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M3.27499 11.1C3.27499 7.39281 6.2928 4.375 9.99999 4.375C13.7064 4.375 16.725 7.40039 16.725 11.1083C16.725 14.8155 13.7072 17.8333 9.99999 17.8333C6.29355 17.8333 3.27499 14.8079 3.27499 11.1ZM9.99999 11.9583C10.6178 11.9583 11.125 11.4511 11.125 10.8333V6.66667C11.125 6.04886 10.6178 5.54167 9.99999 5.54167C9.38219 5.54167 8.87499 6.04886 8.87499 6.66667V10.8333C8.87499 11.4511 9.38219 11.9583 9.99999 11.9583Z"
                          fill="#8C8C8C"
                          stroke="#8C8C8C"
                        />
                        <path
                          d="M12.4083 2.87502H7.59167C7.25833 2.87502 6.99167 2.60835 6.99167 2.27502C6.99167 1.94169 7.25833 1.66669 7.59167 1.66669H12.4083C12.7417 1.66669 13.0083 1.93335 13.0083 2.26669C13.0083 2.60002 12.7417 2.87502 12.4083 2.87502Z"
                          fill="#8C8C8C"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Study timer</p>
                      <h2 className="text-xs font-semibold">01:24:34</h2>
                    </div>
                    <a
                      className="text-gray-300 hover:text-gray-500 transition duration-200 ml-auto"
                      href="#"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_211_9422)">
                          <path
                            d="M3.33334 8H12.6667"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_211_9422">
                            <rect width={16} height={16} fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </a>
                  </div>
                  <div className="bg-white rounded-xl p-3">
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={16}
                          height={16}
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_211_9429)">
                            <path
                              d="M10.6667 2C10.8366 2.00019 11 2.06525 11.1236 2.1819C11.2471 2.29855 11.3215 2.45797 11.3314 2.6276C11.3414 2.79722 11.2862 2.96425 11.1772 3.09455C11.0681 3.22486 10.9134 3.3086 10.7447 3.32867L10.6667 3.33333V6.50933L11.9293 9.03533C11.9642 9.10446 11.9868 9.17913 11.996 9.256L12 9.33333V10.6667C12 10.83 11.94 10.9876 11.8315 11.1096C11.723 11.2316 11.5735 11.3096 11.4113 11.3287L11.3333 11.3333H8.66667V14C8.66648 14.1699 8.60141 14.3334 8.48477 14.4569C8.36812 14.5805 8.2087 14.6548 8.03907 14.6648C7.86944 14.6747 7.70241 14.6196 7.57211 14.5105C7.44181 14.4014 7.35807 14.2467 7.338 14.078L7.33333 14V11.3333H4.66667C4.50338 11.3333 4.34578 11.2734 4.22375 11.1649C4.10173 11.0563 4.02377 10.9068 4.00467 10.7447L4 10.6667V9.33333C4.00009 9.25603 4.01363 9.17933 4.04 9.10667L4.07067 9.03533L5.33333 6.508V3.33333C5.16341 3.33314 4.99998 3.26808 4.87642 3.15143C4.75286 3.03479 4.67851 2.87536 4.66855 2.70574C4.65859 2.53611 4.71378 2.36908 4.82284 2.23878C4.9319 2.10848 5.0866 2.02474 5.25533 2.00467L5.33333 2H10.6667Z"
                              fill="#B8B8B8"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_211_9429">
                              <rect width={16} height={16} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                        <h2 className="text-sm font-bold font-heading">Todo</h2>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-gray-500 text-xs">
                          <span className="text-orange-500 font-bold font-heading">
                            1
                          </span>
                          <span>/2</span>
                        </p>
                        <a
                          className="text-gray-300 hover:text-gray-500 transition duration-200"
                          href="#"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <g clipPath="url(#clip0_211_9422)">
                              <path
                                d="M3.33334 8H12.6667"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_211_9422">
                                <rect width={16} height={16} fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                        </a>
                      </div>
                    </div>
                    <div className="mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={164}
                        height={4}
                        viewBox="0 0 164 4"
                        fill="none"
                      >
                        <rect width={164} height={4} rx={2} fill="#F0F0F0" />
                        <rect width={82} height={4} rx={2} fill="#FF7100" />
                      </svg>
                    </div>
                    <div className="relative flex items-center gap-2 flex-wrap mb-2">
                      <input
                        className="custom-checkbox-1 opacity-0 absolute z-10 h-4 w-4 top-0 left-0"
                        id="checkbox-1"
                        type="checkbox"
                        defaultChecked
                      />
                      <div className="border border-gray-200 bg-white w-4 h-4 flex justify-center items-center rounded-sm">
                        <svg
                          className="hidden"
                          width={10}
                          height={7}
                          viewBox="0 0 10 7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.76764 0.22597C9.45824 -0.0754185 8.95582 -0.0752285 8.64601 0.22597L3.59787 5.13702L1.35419 2.95437C1.04438 2.65298 0.542174 2.65298 0.23236 2.95437C-0.0774534 3.25576 -0.0774534 3.74431 0.23236 4.0457L3.03684 6.77391C3.19165 6.92451 3.39464 7 3.59765 7C3.80067 7 4.00386 6.9247 4.15867 6.77391L9.76764 1.31727C10.0775 1.01609 10.0775 0.52734 9.76764 0.22597Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <label className="text-xs" htmlFor="checkbox-1">
                        Read about the subject
                      </label>
                    </div>
                    <div className="relative flex items-center gap-2 flex-wrap">
                      <input
                        className="custom-checkbox-1 opacity-0 absolute z-10 h-4 w-4 top-0 left-0"
                        id="checkbox-2"
                        type="checkbox"
                      />
                      <div className="border border-gray-200 bg-white w-4 h-4 flex justify-center items-center rounded-sm">
                        <svg
                          className="hidden"
                          width={10}
                          height={7}
                          viewBox="0 0 10 7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.76764 0.22597C9.45824 -0.0754185 8.95582 -0.0752285 8.64601 0.22597L3.59787 5.13702L1.35419 2.95437C1.04438 2.65298 0.542174 2.65298 0.23236 2.95437C-0.0774534 3.25576 -0.0774534 3.74431 0.23236 4.0457L3.03684 6.77391C3.19165 6.92451 3.39464 7 3.59765 7C3.80067 7 4.00386 6.9247 4.15867 6.77391L9.76764 1.31727C10.0775 1.01609 10.0775 0.52734 9.76764 0.22597Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <label className="text-xs" htmlFor="checkbox-2">
                        Write learning summary
                      </label>
                    </div>
                  </div>
                </div>
                */}
            <div className="absolute bottom-3 left-3">
              <div className="border border-orange-100 rounded-lg px-3 py-2 flex items-center gap-2 bg-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={10}
                  height={10}
                  viewBox="0 0 10 10"
                  fill="none"
                >
                  <circle cx={5} cy={5} r={5} fill="#FF0000" />
                </svg>
                <p className="text-xs">
                  <span className="font-semibold">
                    {videoCallInfo?.status === "pending"
                      ? "Venter på kunde"
                      : videoCallInfo?.status === "active"
                      ? "2 personer"
                      : videoCallInfo?.status === "ringing"
                      ? "Ringer kunde..."
                      : "Kobler til..."}
                  </span>
                  <span />
                  <span className="text-gray-700">&nbsp;</span>
                </p>
              </div>
            </div>
            <div className="hidden md:block absolute bottom-3 right-3">
              <div
                className={`${
                  supportCam ? "bg-secondary" : "bg-black"
                } rounded-xl pt-4 px-6 relative`}
              >
                <div className="absolute bottom-2 left-2 z-30">
                  <div className="bg-white p-1 rounded-md flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={16}
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <mask id="path-1-inside-1_587_1759" fill="white">
                        <path d="M11.9999 11.1666C11.8933 11.1666 11.7933 11.1333 11.6999 11.0666C11.4799 10.9 11.4333 10.5866 11.5999 10.3666C12.6466 8.97331 12.6466 7.02665 11.5999 5.63331C11.4333 5.41331 11.4799 5.09998 11.6999 4.93331C11.9199 4.76665 12.2333 4.81331 12.3999 5.03331C13.7066 6.77998 13.7066 9.21998 12.3999 10.9666C12.2999 11.1 12.1533 11.1666 11.9999 11.1666Z" />
                      </mask>
                      <path
                        d="M11.9999 11.1666C11.8933 11.1666 11.7933 11.1333 11.6999 11.0666C11.4799 10.9 11.4333 10.5866 11.5999 10.3666C12.6466 8.97331 12.6466 7.02665 11.5999 5.63331C11.4333 5.41331 11.4799 5.09998 11.6999 4.93331C11.9199 4.76665 12.2333 4.81331 12.3999 5.03331C13.7066 6.77998 13.7066 9.21998 12.3999 10.9666C12.2999 11.1 12.1533 11.1666 11.9999 11.1666Z"
                        fill="#FF0000"
                      />
                      <path
                        d="M11.6999 11.0666L11.0961 11.8637L11.1073 11.8722L11.1187 11.8804L11.6999 11.0666ZM11.5999 10.3666L12.397 10.9705L12.3995 10.9673L11.5999 10.3666ZM11.5999 5.63331L12.3995 5.03269L12.397 5.02945L11.5999 5.63331ZM12.3999 5.03331L13.2007 4.43428L13.197 4.42945L12.3999 5.03331ZM12.3999 10.9666L13.1999 11.5666L13.2007 11.5657L12.3999 10.9666ZM11.9999 10.1666C12.0528 10.1666 12.108 10.1752 12.1612 10.193C12.2137 10.2105 12.2538 10.2334 12.2812 10.2529L11.1187 11.8804C11.3682 12.0586 11.6689 12.1666 11.9999 12.1666V10.1666ZM12.3038 10.2696C12.514 10.4288 12.5714 10.7403 12.397 10.9705L10.8028 9.76279C10.2951 10.433 10.4459 11.3712 11.0961 11.8637L12.3038 10.2696ZM12.3995 10.9673C13.7134 9.21812 13.7134 6.78184 12.3995 5.0327L10.8004 6.23392C11.5798 7.27145 11.5798 8.72851 10.8004 9.76603L12.3995 10.9673ZM12.397 5.02945C12.5714 5.25967 12.514 5.57119 12.3038 5.7304L11.0961 4.13622C10.4459 4.62877 10.2951 5.56695 10.8028 6.23717L12.397 5.02945ZM12.3038 5.7304C12.0736 5.90481 11.7621 5.84733 11.6028 5.63717L13.197 4.42945C12.7045 3.77929 11.7663 3.62848 11.0961 4.13622L12.3038 5.7304ZM11.5992 5.63233C12.6402 7.02384 12.6402 8.97611 11.5992 10.3676L13.2007 11.5657C14.773 9.46384 14.773 6.53611 13.2007 4.43429L11.5992 5.63233ZM11.5999 10.3666C11.6975 10.2366 11.8533 10.1666 11.9999 10.1666V12.1666C12.4533 12.1666 12.9024 11.9634 13.1999 11.5666L11.5999 10.3666Z"
                        fill="#FF0000"
                        mask="url(#path-1-inside-1_587_1759)"
                      />
                      <path
                        d="M13.2199 12.8334C13.1132 12.8334 13.0132 12.8 12.9199 12.7334C12.6999 12.5667 12.6532 12.2534 12.8199 12.0334C14.5999 9.66002 14.5999 6.34002 12.8199 3.96669C12.6532 3.74669 12.6999 3.43335 12.9199 3.26669C13.1399 3.10002 13.4532 3.14669 13.6199 3.36669C15.6666 6.09335 15.6666 9.90669 13.6199 12.6334C13.5266 12.7667 13.3732 12.8334 13.2199 12.8334Z"
                        fill="#FF0000"
                      />
                      <path
                        d="M9.34659 2.52002C8.59992 2.10669 7.64659 2.21335 6.67325 2.82002L4.72659 4.04002C4.59325 4.12002 4.43992 4.16669 4.28659 4.16669H3.66659H3.33325C1.71992 4.16669 0.833252 5.05335 0.833252 6.66669V9.33335C0.833252 10.9467 1.71992 11.8334 3.33325 11.8334H3.66659H4.28659C4.43992 11.8334 4.59325 11.88 4.72659 11.96L6.67325 13.18C7.25992 13.5467 7.83325 13.7267 8.36659 13.7267C8.71325 13.7267 9.04659 13.6467 9.34659 13.48C10.0866 13.0667 10.4999 12.2067 10.4999 11.06V4.94002C10.4999 3.79335 10.0866 2.93335 9.34659 2.52002Z"
                        fill="#FF0000"
                      />
                    </svg>
                    <span className="text-sm font-semibold">Ola</span>
                  </div>
                </div>
                <div className="w-auto h-auto relative z-20 group">
                  {supportCam ? (
                    <div onClick={handleSupportCam}>
                      <div className="absolute opacity-0 group-hover:opacity-100 group-hover:backdrop-blur-sm w-full h-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 transition-all duration-300 ease-out">
                        <div className="flex justify-center items-center w-full h-full">
                          <LuCameraOff size={30} className="text-highlight" />
                        </div>
                      </div>
                      <img
                        src="/assets/temp/man-picture.png"
                        className="group-hover:opacity-400"
                        alt="alt"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={handleSupportCam}
                      className="w-56 h-44 bg-black flex justify-center items-center text-highlight"
                    >
                      <LuCamera size={30} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row w-full gap-4 justify-start pt-4">
            <div className="w-full">
              <textarea
                rows={4}
                placeholder="Skriv en kommentar om ønskelig"
                className="w-full shadow-sm shadow-black/25 rounded-2xl p-4"
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              <div
                className="whitespace-nowrap py-3 px-4 rounded-xl border text-white border-gray-200 bg-secondary hover:bg-primary focus:ring focus:ring-red-200 transition duration-200 flex items-center gap-2"
                onClick={() => setMeetingStatus("review")}
              >
                <LuPhoneOff />
                <span className="font-semibold text-sm ">Avslutt</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
