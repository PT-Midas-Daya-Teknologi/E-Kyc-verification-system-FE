import React, { useState, useEffect } from 'react';
import { 
  LiveKitRoom, 
  VideoConference, 
  RoomAudioRenderer,
  ControlBar
} from '@livekit/components-react';
import '@livekit/components-styles';
import { getLiveKitToken } from '../services/livekitApi';
import Spinner from '../../../components/Spinner';

export default function LiveKitDetector({ 
  onSuccess, 
  onFailure, 
  onError, 
  onUserCancel 
}) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const serverUrl = import.meta.env.VITE_LIVEKIT_SERVER_URL || 'ws://localhost:7880';
  const roomName = `kyc-${localStorage.getItem('kyc_session_id') || 'default'}`;
  const identity = `user-${Math.floor(Math.random() * 10000)}`;

  useEffect(() => {
    async function fetchToken() {
      try {
        const t = await getLiveKitToken(roomName, identity);
        setToken(t);
        setLoading(false);
      } catch (err) {
        console.error('[LiveKitDetector] Failed to fetch token:', err);
        setError('Failed to initialize video session. Please check your connection.');
        setLoading(false);
      }
    }
    fetchToken();
  }, [roomName, identity]);

  if (loading) {
    return <Spinner label="Connecting to secure video room..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-2xl font-bold">!</div>
        <p className="text-red-500 font-medium text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="livekit-detector-container h-[500px] w-full bg-slate-900 rounded-3xl overflow-hidden relative">
      <LiveKitRoom
        video={true}
        audio={false}
        token={token}
        serverUrl={serverUrl}
        onDisconnected={onUserCancel}
        onError={(err) => onError(err.message)}
        data-lk-theme="default"
      >
        <VideoConference />
        <RoomAudioRenderer />
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
           <button 
             onClick={onUserCancel}
             className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold transition"
           >
             End Session
           </button>
        </div>
      </LiveKitRoom>
    </div>
  );
}
