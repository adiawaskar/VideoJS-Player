import React, { useRef, useEffect } from "react";
import VideoJS from "../../components/VideoJS/VideoJS";
import "./VideoPlayer.css";

const VideoPlayer = () => {
  const playerRef = useRef(null);

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Replace this with your actual m3u8 URL
        type: "application/x-mpegURL",
      },
    ],
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;
  };

  return (
    <div className="video-container">
      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} ref={playerRef} />
    </div>
  );
};

export default VideoPlayer;
