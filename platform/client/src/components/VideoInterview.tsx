import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, Video, Mic, MicOff, VideoOff, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoInterviewProps {
  jobId: number;
  jobTitle: string;
  participantName: string;
  scheduledAt?: Date;
  onEnd?: () => void;
}

export default function VideoInterview({
  jobId,
  jobTitle,
  participantName,
  scheduledAt,
  onEnd,
}: VideoInterviewProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Инициализация видеоинтервью
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        setIsConnecting(true);

        // Получаем доступ к камере и микрофону
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Инициализируем WebRTC соединение
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: ["stun:stun.l.google.com:19302"] },
            { urls: ["stun:stun1.l.google.com:19302"] },
          ],
        });

        // Добавляем локальный поток
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        // Обработчик удаленного потока
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Обработчик изменения состояния соединения
        peerConnection.onconnectionstatechange = () => {
          if (peerConnection.connectionState === "connected") {
            setIsConnected(true);
            setIsConnecting(false);

            // Запускаем таймер
            durationIntervalRef.current = setInterval(() => {
              setDuration((prev) => prev + 1);
            }, 1000);
          } else if (
            peerConnection.connectionState === "disconnected" ||
            peerConnection.connectionState === "failed"
          ) {
            setIsConnected(false);
            if (durationIntervalRef.current) {
              clearInterval(durationIntervalRef.current);
            }
          }
        };

        peerConnectionRef.current = peerConnection;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не удалось подключиться к камере и микрофону"
        );
        setIsConnecting(false);
      }
    };

    initializeInterview();

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (localVideoRef.current?.srcObject) {
        const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getAudioTracks();
      tracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getVideoTracks();
      tracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (localVideoRef.current?.srcObject) {
      const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    onEnd?.();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {/* Заголовок */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{jobTitle}</h1>
          <p className="text-sm text-gray-300">Собеседование с {participantName}</p>
        </div>
        {isConnected && <div className="text-green-400 font-mono">{formatDuration(duration)}</div>}
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Удаленное видео */}
        <div className="flex-1 bg-black rounded-lg overflow-hidden">
          {isConnected ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isConnecting ? (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
                  <p className="text-white">Подключение...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Video className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Ожидание подключения участника</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Локальное видео */}
        <div className="w-64 bg-black rounded-lg overflow-hidden">
          {isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <VideoOff className="w-8 h-8 text-gray-500" />
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Ошибки */}
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Управление */}
      <div className="bg-gray-800 p-4 flex justify-center gap-4">
        <Button
          onClick={toggleMute}
          variant={isMuted ? "destructive" : "default"}
          className="gap-2"
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isMuted ? "Микрофон отключен" : "Микрофон включен"}
        </Button>

        <Button
          onClick={toggleVideo}
          variant={isVideoOff ? "destructive" : "default"}
          className="gap-2"
        >
          {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          {isVideoOff ? "Камера отключена" : "Камера включена"}
        </Button>

        <Button onClick={endCall} variant="destructive" className="gap-2">
          <Phone className="w-4 h-4" />
          Завершить звонок
        </Button>
      </div>
    </div>
  );
}
