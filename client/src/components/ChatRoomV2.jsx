import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

// Utils
import {
  createEmptyAudioTrack,
  createEmptyVideoTrack,
  createMediaStream,
} from "../utils/mediaStream";

const ChatRoom = () => {
  const [peer, setPeer] = useState(null);
  const [localPeerId, setLocalPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  useEffect(() => {
    const peer = new Peer({
      host: import.meta.env.VITE_SERVER_HOST,
      port: import.meta.env.VITE_SERVER_PORT,
      path: import.meta.env.VITE_PEER_SERVER_PATH,
    });

    peer.on("open", (id) => {
      setLocalPeerId(id);
    });

    peer.on("call", (call) => {
      call.answer(localStreamRef.current.srcObject);
      console.log("answer sent");
      call.on("stream", (remoteStream) => {
        remoteStreamRef.current.srcObject = remoteStream;
      });
    });

    setPeer(peer);

    return () => {
      peer.disconnect();
    };
  }, []);

  useEffect(() => {
    const setupMediaStream = async () => {
      try {
        let audioTrack;
        let videoTrack;

        if (isAudioEnabled) {
          audioTrack = await getMicrophoneAccess();
        } else {
          audioTrack = createEmptyAudioTrack();
        }

        if (isVideoEnabled) {
          videoTrack = await getCameraAccess();
        } else {
          videoTrack = createEmptyVideoTrack();
        }

        if (audioTrack && videoTrack) {
          const stream = createMediaStream(audioTrack, videoTrack);
          localStreamRef.current.srcObject = stream;

          if (remotePeerId !== "") {
            callPeer();
          }
        } else {
          throw error("Audio or video track is missing");
        }
      } catch (error) {
        console.error("Error setting up media stream:", error);
      }
    };

    setupMediaStream();
  }, [isAudioEnabled, isVideoEnabled]);

  const getMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: isAudioEnabled,
      });
      const audioTrack = stream.getAudioTracks()[0];

      return audioTrack;
    } catch (error) {
      console.error("Error accessing the camera and the microphone:", error);
    }
  };

  const getCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
      });
      const videoTrack = stream.getVideoTracks()[0];

      return videoTrack;
    } catch (error) {
      console.error("Error accessing the camera and the microphone:", error);
    }
  };

  const callPeer = () => {
    const call = peer.call(remotePeerId, localStreamRef.current.srcObject);

    call.on("stream", (remoteStream) => {
      remoteStreamRef.current.srcObject = remoteStream;
    });

    call.on("error", (error) => {
      console.error("Call error:", error);
    });
  };

  const hangUp = () => {};

  const toggleAudio = () => {
    localStreamRef.current.srcObject.getAudioTracks().forEach((track) => {
      track.enabled = !isAudioEnabled;
      track.stop();
    });
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    localStreamRef.current.srcObject.getVideoTracks().forEach((track) => {
      track.enabled = !isVideoEnabled;
      track.stop();
    });
    setIsVideoEnabled(!isVideoEnabled);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex">
        <video
          ref={localStreamRef}
          autoPlay
          playsInline
          disablePictureInPicture
          muted
        />
        <video
          ref={remoteStreamRef}
          autoPlay
          playsInline
          disablePictureInPicture
        />
      </div>
      <div className="flex gap-4">
        <button onClick={() => navigator.clipboard.writeText(localPeerId)}>
          Copy Room ID
        </button>
        <button onClick={toggleAudio}>
          Mic: {isAudioEnabled ? "ON" : "OFF"}
        </button>
        <button onClick={toggleVideo}>
          Camera: {isVideoEnabled ? "ON" : "OFF"}
        </button>
        <button onClick={hangUp}>Hang Up</button>
        <input
          type="text"
          placeholder="Enter remote peer ID"
          value={remotePeerId}
          onChange={(event) => setRemotePeerId(event.target.value)}
        />
        <button onClick={callPeer}>Call</button>
      </div>
    </div>
  );
};

export default ChatRoom;
