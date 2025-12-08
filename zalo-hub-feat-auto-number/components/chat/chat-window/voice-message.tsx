import React, { useRef, useState, useEffect } from "react";
import "@/styles/voice-wave.css";

interface VoiceMessageProps {
  message: any;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const VoiceMessage: React.FC<VoiceMessageProps> = ({ message }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [remaining, setRemaining] = useState(0);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const total = Math.floor(audioRef.current.duration);
      setDuration(total);
      setRemaining(total);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const timeLeft = Math.max(
        0,
        Math.floor(audioRef.current.duration - audioRef.current.currentTime)
      );
      setRemaining(timeLeft);
    }
  };
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("timeupdate", handleTimeUpdate);

      return () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, []);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePlayPause}
        className="p-2 rounded-full bg-blue-400"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <rect x="6" y="5" width="4" height="14" rx="1" fill="#ffffff" />
            <rect x="14" y="5" width="4" height="14" rx="1" fill="#ffffff" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7L8 5z" fill="#ffffff" />
          </svg>
        )}
      </button>

      <audio
        ref={audioRef}
        src={message.href}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setRemaining(duration); // reset lại
        }}
        preload="auto"
      />

      <div className="flex items-end gap-[2px] h-5">
        {[
          "wave1",
          "wave2",
          "wave3",
          "wave4",
          "wave5",
          "wave4",
          "wave3",
          "wave2",
          "wave1",
        ].map((wave, i) => (
          <div
            key={i}
            className={`w-[2px] bg-blue-500 ${
              playing
                ? `animate-${wave}`
                : `h-${[4, 3, 2, 3, 4, 3, 2, 3, 4][i]}`
            }`}
          />
        ))}
      </div>

      <span className="text-xs text-gray-600 min-w-[40px] text-right leading-[0.75rem]">
        {formatTime(remaining)}
      </span>
    </div>
  );
};
