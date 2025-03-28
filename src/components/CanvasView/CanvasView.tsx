import { Canvas } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import testVideo from "../../../videos/german-conv.mp4";
import styles from "./CanvasView.module.scss";

// VideoTexture Component
const VideoTexture = ({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) => {
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null); // Reference to the mesh
  const [dragging, setDragging] = useState(false);
  const [resize, setResize] = useState(false);
  const [videoSize, setVideoSize] = useState({ width: 16, height: 9 });
  const [videoPosition, setVideoPosition] = useState({ x: 0, y: 0 });
  const initialMousePos = useRef({ x: 0, y: 0 });
  const initialVideoPos = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Ref for the canvas element

  // Video setup
  useEffect(() => {
    const video = document.createElement("video");
    video.src = testVideo;
    video.loop = false;
    video.muted = false;

    const texture = new THREE.VideoTexture(video);
    setVideoTexture(texture);
    videoRef.current = video;
  }, [videoRef]);

  // Handle mouse down event to initiate dragging
  const onPointerDown = (event: React.PointerEvent) => {
    setDragging(true);
    initialMousePos.current = { x: event.clientX, y: event.clientY }; // Store the initial mouse position
    initialVideoPos.current = { ...videoPosition }; // Store the initial video position
  };

  // Handle mouse move event to drag the video
  const onPointerMove = (event: MouseEvent) => {
    if (dragging) {
      const dx = event.clientX - initialMousePos.current.x; // Calculate horizontal movement
      const dy = event.clientY - initialMousePos.current.y; // Calculate vertical movement

      setVideoPosition({
        x: initialVideoPos.current.x + dx * 0.01, // Adjust multiplier for sensitivity
        y: initialVideoPos.current.y - dy * 0.01, // Invert y-axis for proper dragging
      });
    }
    if (resize) {
      const { movementX, movementY } = event;
      setVideoSize((prevSize) => ({
        width: Math.max(prevSize.width + movementX * 0.05, 1), // Prevent shrinking too small
        height: Math.max(prevSize.height + movementY * 0.05, 1), // Prevent shrinking too small
      }));
    }
  };

  // Handle mouse up event to stop dragging
  const onPointerUp = () => {
    setDragging(false);
    setResize(false);
  };

  // Add mouse events to the document when dragging
  useEffect(() => {
    document.addEventListener("mousemove", onPointerMove);
    document.addEventListener("mouseup", onPointerUp);
    document.addEventListener("mouseout", onPointerUp); // Stop dragging if the mouse leaves

    return () => {
      document.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseup", onPointerUp);
      document.removeEventListener("mouseout", onPointerUp);
    };
  }, [dragging]);

  return (
    videoTexture && (
      <mesh ref={meshRef} position={[videoPosition.x, videoPosition.y, 0]} onPointerDown={onPointerDown}>
        <planeGeometry args={[videoSize.width, videoSize.height]} />
        <meshBasicMaterial map={videoTexture} />
        {/* Resize handle */}
        <mesh position={[videoSize.width / 2, videoSize.height / 2, 0]} scale={0.2} onPointerDown={() => setResize(true)}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </mesh>
    )
  );
};

// VideoController Component
const VideoController = ({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) => {
  const [volume, setVolume] = useState(100); // Store the volume as a percentage (0-100)

  const playPause = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const forward = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime += 5;
    }
  };

  const backward = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime -= 5;
    }
  };

  const muteUnmute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted; // Toggle mute state
    }
  };

  const goToStart = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0; // Jump to the beginning of the video
    }
  };

  const goToEnd = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = video.duration; // Jump to the end of the video
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume); // Update the volume state
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume / 100; // Update the video volume (0 to 1)
    }
  };

  return (
    <div className={styles.controller}>
      <button onClick={playPause}>Play/Pause</button>
      <button onClick={backward}>Rewind</button>
      <button onClick={forward}>Forward</button>
      <button onClick={goToStart}>Go to Start</button>
      <button onClick={goToEnd}>Go to End</button>
      <button onClick={muteUnmute}>Mute/Unmute</button>

      <div>
        <label htmlFor="volume">Volume</label>
        <input id="volume" type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} />
        <span>{volume}%</span>
      </div>
    </div>
  );
};

// CanvasView Component
const CanvasView = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div>
      <Canvas style={{ width: "800px", height: "450px" }} camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight />
        <VideoTexture videoRef={videoRef} />
      </Canvas>
      <VideoController videoRef={videoRef} />
    </div>
  );
};

export default CanvasView;
