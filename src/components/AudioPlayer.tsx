import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Clock,
  Check,
  Copy,
  Radio,
  FileAudio,
} from "lucide-react";
import { AudioGenerationResult } from "../types";

interface AudioPlayerProps {
  currentAudio: AudioGenerationResult | null;
  isLoading: boolean;
  onGenerate: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentAudio,
  isLoading,
  onGenerate,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // When audioDataUrl changes, reset and autoplay
  useEffect(() => {
    if (currentAudio?.audioDataUrl && audioRef.current) {
      audioRef.current.src = currentAudio.audioDataUrl;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentAudio?.id, currentAudio?.audioDataUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current || !currentAudio?.audioDataUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error("Playback error:", e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || currentAudio?.durationSeconds || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const handleDownload = () => {
    if (!currentAudio?.audioDataUrl) return;
    const a = document.createElement("a");
    a.href = currentAudio.audioDataUrl;
    const filename = `giong-ky-su-dien-${currentAudio.voiceUsed.toLowerCase()}-${Date.now()}.wav`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Generate 48 aesthetic sound wave bars
  const waveBarsCount = 48;
  const activeBarIndex = Math.floor((progressPercent / 100) * waveBarsCount);

  return (
    <div
      id="audio-player-panel"
      className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      <div className="relative z-10 space-y-5">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileAudio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Bản Thu Kỹ Sư Điện
                {currentAudio && (
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                    Voice: {currentAudio.voiceUsed}
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentAudio && (
              <button
                type="button"
                id="btn-download-wav"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tải File .WAV</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/90 space-y-3">
          <div className="flex items-end justify-between gap-1 h-16 px-1">
            {Array.from({ length: waveBarsCount }).map((_, idx) => {
              const isActive = idx <= activeBarIndex;
              // Deterministic aesthetic height pattern mimicking speech frequency
              const baseHeight = ((Math.sin(idx * 0.4) * 0.4 + 0.6) * 100).toFixed(0);
              const heightMultiplier = isPlaying ? (idx % 2 === 0 ? 1 : 0.8 + Math.random() * 0.3) : 1;
              const barHeight = Math.min(100, Math.max(15, parseInt(baseHeight, 10) * heightMultiplier));

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (duration > 0 && audioRef.current) {
                      const seekTo = (idx / waveBarsCount) * duration;
                      audioRef.current.currentTime = seekTo;
                      setCurrentTime(seekTo);
                    }
                  }}
                  className="flex-1 cursor-pointer transition-all duration-75 flex items-end justify-center group py-1"
                >
                  <div
                    style={{ height: `${barHeight}%` }}
                    className={`w-full max-w-[5px] rounded-full transition-all ${
                      isActive
                        ? "bg-gradient-to-t from-amber-500 to-orange-400 group-hover:from-amber-400 group-hover:to-orange-300"
                        : "bg-slate-800 group-hover:bg-slate-700"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Time Scrubber Slider */}
          <div className="space-y-1.5">
            <input
              id="audio-scrubber-range"
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              disabled={!currentAudio}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
            />
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Main Play / Pause / Restart */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              id="btn-play-pause-toggle"
              onClick={togglePlayPause}
              disabled={!currentAudio || isLoading}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 ${
                currentAudio
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-orange-500/20"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
              }`}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              id="btn-restart-audio"
              onClick={handleRestart}
              disabled={!currentAudio}
              title="Phát lại từ đầu"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Playback speed buttons */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-2.5 py-1 rounded-lg font-mono transition-all ${
                    playbackRate === rate
                      ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-slate-200 p-1.5"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Generate Trigger Button */}
        <div className="pt-2">
          <button
            type="button"
            id="btn-generate-tts-voice"
            onClick={onGenerate}
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Đang Tổng Hợp Giọng Kỹ Sư Điện (Gemini 3.1 Flash TTS)...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current text-slate-950" />
                <span>ĐỌC BẰNG GIỌNG KỸ SƯ ĐIỆN VIỆT NAM (TẠO AUDIO)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
