import { useEffect } from "react";
import videoSrc from "./assets/video.mp4";
import "./App.css";

export default function App() {

  useEffect(() => {
    // Disable right click
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    // Disable some function keys and shortcuts
    const handleKeyDown = (e) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === "U")
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // Prevent navigation to other pages
    if (window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
    }

    // Load A-Frame
    const aframeScript = document.createElement("script");
    aframeScript.src = "https://aframe.io/releases/1.4.2/aframe.min.js";
    aframeScript.async = true;

    // Load MindAR
    const mindarScript = document.createElement("script");
    mindarScript.src =
      "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js";
    mindarScript.async = true;

    document.head.appendChild(aframeScript);
    document.head.appendChild(mindarScript);

    let video;
    let tapHint;
    let targetEl;
    let userEnabledSound = false;

    const setupAR = () => {
      video = document.getElementById("video");
      tapHint = document.getElementById("tapHint");
      targetEl = document.getElementById("target0");

      if (!video || !targetEl) return;

      video.muted = true;

      targetEl.addEventListener("targetFound", async () => {
        try {
          video.muted = !userEnabledSound;
          await video.play();
        } catch (e) { }
      });

      targetEl.addEventListener("targetLost", () => {
        video.pause();
      });

      const enableSound = async () => {
        userEnabledSound = true;
        video.muted = false;
        video.volume = 1.0;

        try {
          await video.play();
        } catch (e) { }

        tapHint.style.display = "none";
        document.body.removeEventListener("click", enableSound);
        document.body.removeEventListener("touchstart", enableSound);
      };

      document.body.addEventListener("click", enableSound);
      document.body.addEventListener("touchstart", enableSound);
    };

    // Wait until scripts are ready
    const interval = setInterval(() => {
      if (window.AFRAME && window.MINDAR) {
        clearInterval(interval);
        setupAR();
      }
    }, 200);

    return () => {
      document.head.removeChild(aframeScript);
      document.head.removeChild(mindarScript);
    };
  }, []);

  return (
    <>
      <div id="tapHint">Tap to unmute 🔊</div>

      <a-scene
        embedded
        mindar-image="
          imageTargetSrc: targets.mind;
          filterMinCF: 0.001;
          filterBeta: 0.01;
        "
        renderer="alpha: true"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: true"
      >
        <a-assets>
          <video
            id="video"
            src={videoSrc}
            loop
            muted
            playsInline
            crossOrigin="anonymous"
          ></video>
        </a-assets>

        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

        <a-entity id="target0" mindar-image-target="targetIndex: 0">
          <a-video
            src="#video"
            width="1"
            height="1"
            position="0 0 0"
          ></a-video>
        </a-entity>
      </a-scene>
    </>
  );
}
