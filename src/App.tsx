import { useRef } from "react";
import useFFmpeg from "./hooks/useFFmpeg";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";

const App = () => {
  const { loaded, transcode, message } = useFFmpeg();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleTranscode = async () => {
    const outputURL = await transcode("https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm");
    if (outputURL && videoRef.current) {
      videoRef.current.src = outputURL;
    }
  };

  return (
    <>
      {loaded ? (
        <>
          <video ref={videoRef} controls muted={false}></video>
          <br />
          <button onClick={handleTranscode}>Transcode webm to mp4</button>
          <p>{message}</p>
          <p>Open Developer Tools (Ctrl+Shift+I) to View Logs</p>
        </>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
};

export default App;
