"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, MoreVertical, MessageSquare } from "lucide-react"

interface CallWindowProps {
  type: "voice" | "video"
  onEndCall: () => void
}

export function CallWindow({ type, onEndCall }: CallWindowProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting")

  useEffect(() => {
    // Simulate call connection
    const connectTimer = setTimeout(() => {
      setCallStatus("connected")
    }, 3000)

    return () => clearTimeout(connectTimer)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [callStatus])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleEndCall = () => {
    setCallStatus("ended")
    onEndCall()
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-blue-900 to-purple-900 text-white relative">
      {/* Video area */}
      {type === "video" && (
        <div className="flex-1 relative">
          {/* Remote video */}
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            {!isVideoOff ? (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <Avatar className="w-32 h-32">
                  <AvatarImage src="/placeholder.svg?height=128&width=128" />
                  <AvatarFallback className="text-4xl">NA</AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src="/placeholder.svg?height=128&width=128" />
                  <AvatarFallback className="text-4xl">NA</AvatarFallback>
                </Avatar>
                <p className="text-gray-300">Camera đã tắt</p>
              </div>
            )}
          </div>

          {/* Local video preview */}
          <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border-2 border-white/20 overflow-hidden">
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/placeholder.svg?height=48&width=48" />
                <AvatarFallback>Me</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      )}

      {/* Call info */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Avatar className="w-32 h-32 mb-6 border-4 border-white/20">
          <AvatarImage src="/placeholder.svg?height=128&width=128" />
          <AvatarFallback className="text-4xl">NA</AvatarFallback>
        </Avatar>

        <h2 className="text-2xl font-semibold mb-2">Nguyễn Văn A</h2>

        <div className="text-center mb-8">
          {callStatus === "connecting" && <p className="text-lg text-blue-200">Đang kết nối...</p>}
          {callStatus === "connected" && <p className="text-lg text-green-200">{formatDuration(callDuration)}</p>}
        </div>

        {/* Call status indicators */}
        <div className="flex items-center space-x-4 mb-8">
          {isMuted && (
            <div className="flex items-center space-x-2 bg-red-500/20 px-3 py-1 rounded-full">
              <MicOff className="w-4 h-4" />
              <span className="text-sm">Đã tắt mic</span>
            </div>
          )}
          {type === "video" && isVideoOff && (
            <div className="flex items-center space-x-2 bg-gray-500/20 px-3 py-1 rounded-full">
              <VideoOff className="w-4 h-4" />
              <span className="text-sm">Đã tắt camera</span>
            </div>
          )}
          {isSpeakerOn && (
            <div className="flex items-center space-x-2 bg-blue-500/20 px-3 py-1 rounded-full">
              <Volume2 className="w-4 h-4" />
              <span className="text-sm">Loa ngoài</span>
            </div>
          )}
        </div>
      </div>

      {/* Call controls */}
      <div className="p-6">
        <div className="flex items-center justify-center space-x-6">
          {/* Mute button */}
          <Button
            size="icon"
            variant={isMuted ? "destructive" : "secondary"}
            className="w-14 h-14 rounded-full"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          {/* Speaker button */}
          <Button
            size="icon"
            variant={isSpeakerOn ? "default" : "secondary"}
            className="w-14 h-14 rounded-full"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </Button>

          {/* Video button (only for video calls) */}
          {type === "video" && (
            <Button
              size="icon"
              variant={isVideoOff ? "destructive" : "secondary"}
              className="w-14 h-14 rounded-full"
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </Button>
          )}

          {/* Message button */}
          <Button size="icon" variant="secondary" className="w-14 h-14 rounded-full">
            <MessageSquare className="w-6 h-6" />
          </Button>

          {/* More options */}
          <Button size="icon" variant="secondary" className="w-14 h-14 rounded-full">
            <MoreVertical className="w-6 h-6" />
          </Button>

          {/* End call button */}
          <Button
            size="icon"
            variant="destructive"
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
            onClick={handleEndCall}
          >
            <PhoneOff className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </div>
  )
}
