// import React, {
//   useState,
//   useImperativeHandle,
//   forwardRef,
//   useRef,
// } from "react";
// import videojs from "video.js";
// import "video.js/dist/video-js.css";
// import "./VideoJS-custom.css";
// // import "videojs-seek-buttons";

// export const VideoJS = forwardRef((props, ref) => {
//   const videoRef = React.useRef(null);
//   const playerRef = React.useRef(null);
//   const { options, onReady } = props;

//   const videoURLRef = useRef("");
//   const baseURLRef = useRef("");
//   const videoKeyRef = useRef("");

//   //const lastTSUrlRef = useRef("");

//   const fromHexStr = (hex) => {
//     let bytes = [];
//     for (let i = 0; i < hex.length; i += 2) {
//       bytes.push(parseInt(hex.substr(i, 2), 16));
//     }
//     return new Uint8Array(bytes);
//   };

//   useImperativeHandle(ref, () => ({
//     play: (_url, _key) => {
//       // In play()
//       videoURLRef.current = _url;
//       baseURLRef.current = _url.substring(0, _url.lastIndexOf("/") + 1);
//       videoKeyRef.current = _key;

//       if (playerRef.current) {
//         playerRef.current.src({ src: _url, type: "application/x-mpegURL" });
//         playerRef.current.play();
//       }

//       console.log([
//         videoURLRef.current,
//         baseURLRef.current,
//         videoKeyRef.current,
//       ]);
//     },
//     pause: () => {
//       playerRef.current?.pause();
//     },
//     isFS: () => {
//       return playerRef.current?.isFullscreen();
//     },
//     exitFS: () => {
//       playerRef.current?.exitFullscreen();
//     },
//     //getLastTSUrl: () => lastTSUrlRef.current,
//   }));

//   React.useEffect(() => {
//     // Make sure Video.js player is only initialized once
//     if (!playerRef.current) {
//       // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
//       const videoElement = document.createElement("video-js");

//       videoElement.classList.add("vjs-big-play-centered");
//       videoRef.current.appendChild(videoElement);

//       const player = (playerRef.current = videojs(videoElement, options, () => {
//         videojs.log("player is ready");
//         onReady && onReady(player);

//         // player.seekButtons({
//         //   forward: 30,
//         //   back: 10
//         // });

//         player.on("xhr-hooks-ready", () => {
//           const playerRequestHook = (options) => {
//             console.log("playerRequestHook > ", options);

//             if (options.uri.includes(".key")) {
//               const keyBytes = fromHexStr(videoKeyRef.current);
//               const blob = new Blob([keyBytes.buffer], {
//                 type: "application/octet-stream",
//               });
//               const blobUrl = URL.createObjectURL(blob);
//               options.uri = blobUrl;
//             } else if (options.uri.includes(".ts")) {
//               const file_name_ext = options.uri.substring(
//                 options.uri.lastIndexOf("/") + 1
//               );
//               const altURL = baseURLRef.current + file_name_ext;
//               const encodedURL = encodeURIComponent(altURL);
//               console.log([baseURLRef.current, file_name_ext, altURL]);
//               options.uri = `${altURL}`;
//               //lastTSUrlRef.current = altURL;
//               //console.log(lastTSUrlRef.current);
//             }

//             return options;
//           };

//           // player.on("fullscreenchange", async () => {
//           //   try {
//           //     if (player.isFullscreen()) {
//           //       if (
//           //         window.screen.orientation &&
//           //         window.screen.orientation.lock
//           //       ) {
//           //         await window.screen.orientation.lock("landscape");
//           //       }
//           //     } else {
//           //       if (
//           //         window.screen.orientation &&
//           //         window.screen.orientation.unlock
//           //       ) {
//           //         window.screen.orientation.unlock();
//           //       }
//           //     }
//           //   } catch (err) {
//           //     console.warn("🔁 Orientation lock failed", err);
//           //   }
//           // });

//           playerRef.current.tech().vhs.xhr.onRequest(playerRequestHook);
//           // setTimeout(() => {
//           //   const tech = playerRef.current?.tech(true);
//           //   if (tech?.vhs?.xhr) {
//           //     tech.vhs.xhr.onRequest(playerRequestHook);
//           //   } else {
//           //     console.warn("VHS or XHR not available on tech");
//           //   }
//           // }, 100);
//         });
//       }));

//       // new code

//       // You could update an existing player in the `else` block here
//       // on prop change, for example:
//     } else {
//       const player = playerRef.current;

//       player.autoplay(options.autoplay);
//       player.src(options.sources);
//     }
//   }, [options, videoRef]);

//   // Dispose the Video.js player when the functional component unmounts
//   React.useEffect(() => {
//     const player = playerRef.current;

//     return () => {
//       if (player && !player.isDisposed()) {
//         player.dispose();
//         playerRef.current = null;
//       }
//     };
//   }, [playerRef]);

//   return (
//     <div data-vjs-player>
//       <div ref={videoRef} />
//     </div>
//   );
// });

// export default VideoJS;



import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect
} from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "./VideoJS-custom.css";

export const VideoJS = forwardRef((props, ref) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { options, onReady } = props;

  const videoURLRef = useRef("");
  const baseURLRef = useRef("");
  const videoKeyRef = useRef("");

  const fromHexStr = (hex) => {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
  };

  useImperativeHandle(ref, () => ({
    play: (_url, _key) => {
      videoURLRef.current = _url;
      baseURLRef.current = _url.substring(0, _url.lastIndexOf("/") + 1);
      videoKeyRef.current = _key;

      if (playerRef.current) {
        playerRef.current.src({ src: _url, type: "application/x-mpegURL" });
        playerRef.current.play();
      }
    },
    pause: () => {
      playerRef.current?.pause();
    },
    isFS: () => {
      return playerRef.current?.isFullscreen();
    },
    exitFS: () => {
      playerRef.current?.exitFullscreen();
    },
  }));

  useEffect(() => {
    // Initialize Video.js once
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(
        videoElement,
        options,
        () => {
          videojs.log("player is ready");
          onReady && onReady(player);
        }
      ));

      // XHR hooks for key/ts
      player.on("xhr-hooks-ready", () => {
        const playerRequestHook = (opts) => {
          if (opts.uri.includes(".key")) {
            const keyBytes = fromHexStr(videoKeyRef.current);
            const blob = new Blob([keyBytes.buffer], {
              type: "application/octet-stream",
            });
            opts.uri = URL.createObjectURL(blob);
          } else if (opts.uri.includes(".ts")) {
            const file_name_ext = opts.uri.substring(
              opts.uri.lastIndexOf("/") + 1
            );
            opts.uri = `${baseURLRef.current}${file_name_ext}`;
          }
          return opts;
        };
        player.tech().vhs.xhr.onRequest(playerRequestHook);
      });

      // === ROTATION LOGIC ===
      // 1) Lock to landscape on entering fullscreen
      // 2) Unlock on exit
      player.on("fullscreenchange", async () => {
        try {
          if (player.isFullscreen()) {
            if (
              window.screen.orientation &&
              window.screen.orientation.lock
            ) {
              await window.screen.orientation.lock("landscape");
            }
          } else {
            if (
              window.screen.orientation &&
              window.screen.orientation.unlock
            ) {
              window.screen.orientation.unlock();
            }
          }
        } catch (err) {
          console.warn("Orientation lock failed:", err);
        }
      });
      // ========================
    } else {
      // Update existing player on prop change
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, onReady]);

  // Dispose player on unmount
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
});

export default VideoJS;
