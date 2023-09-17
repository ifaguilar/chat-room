export const createEmptyAudioTrack = () => {
  const audioContext = new AudioContext();

  const audioMediaStream = audioContext.createMediaStreamDestination().stream;

  const audioTrack = audioMediaStream.getAudioTracks()[0];

  return audioTrack;
};

export const createEmptyVideoTrack = (width = 100, height = 100) => {
  const canvas = document.createElement("canvas");
  canvas.getContext("2d").fillRect(0, 0, width, height);

  const videoTrack = canvas.captureStream().getVideoTracks()[0];

  return videoTrack;
};

export const createMediaStream = (audioTrack, videoTrack) => {
  const mediaStream = new MediaStream([audioTrack, videoTrack]);

  return mediaStream;
};
