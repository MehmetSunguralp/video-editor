import { useEffect, useRef, useState, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const useFFmpeg = () => {
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;

    ffmpeg.on("log", ({ message }) => {
      setMessage(message);
      console.log(message);
    });

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
      });
      console.log("FFmpeg loaded successfully!");
      setLoaded(true);
    } catch (error) {
      console.error("Failed to load FFmpeg:", error);
    }
  };

  const transcode = useCallback(async (inputURL: string): Promise<string | null> => {
    const ffmpeg = ffmpegRef.current;

    try {
      setMessage("Transcoding started...");
      await ffmpeg.writeFile("input.webm", await fetchFile(inputURL));
      await ffmpeg.exec(["-i", "input.webm", "output.mp4"]);
      const data = await ffmpeg.readFile("output.mp4");

      setMessage("Transcoding complete!");
      return URL.createObjectURL(new Blob([data as Uint8Array], { type: "video/mp4" }));
    } catch (error) {
      setMessage("Error during transcoding.");
      console.error("Error:", error);
      return null;
    }
  }, []);

  return { loaded, transcode, message };
};

export default useFFmpeg;
