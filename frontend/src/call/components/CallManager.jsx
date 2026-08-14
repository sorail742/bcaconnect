import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, User } from 'lucide-react';
import { useCall } from '../context/CallContext';

const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

/**
 * Monté une seule fois dans App.jsx. Affiche la sonnerie entrante, l'écran
 * "appel en cours" (sortant) et l'overlay plein écran une fois connecté.
 * Ne rend rien tant qu'aucun appel n'est actif.
 */
const CallManager = () => {
    const {
        callState, callType, remoteUser, localStream, remoteStream,
        isMuted, isCameraOff, callDuration,
        acceptCall, rejectCall, endCall, toggleMute, toggleCamera,
    } = useCall();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const remoteAudioRef = useRef(null);

    useEffect(() => {
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream || null;
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream || null;
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream || null;
    }, [remoteStream]);

    if (callState === 'idle') return null;

    const isVideo = callType === 'video';
    const initials = (remoteUser?.name || '?').trim().charAt(0).toUpperCase();

    return (
        <AnimatePresence>
            {callState === 'incoming' && (
                <motion.div
                    key="incoming-call"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-4 right-4 z-[9999] w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-xl shrink-0 animate-pulse">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">{remoteUser?.name || 'Utilisateur'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isVideo ? 'Appel vidéo entrant…' : 'Appel audio entrant…'}
                            </p>
                        </div>
                    </div>
                    <div className="flex border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={rejectCall}
                            className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium transition-colors"
                        >
                            <PhoneOff size={18} /> Refuser
                        </button>
                        <button
                            onClick={acceptCall}
                            className="flex-1 flex items-center justify-center gap-2 py-3 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 font-medium transition-colors border-l border-gray-100 dark:border-gray-800"
                        >
                            <Phone size={18} /> Répondre
                        </button>
                    </div>
                </motion.div>
            )}

            {['outgoing', 'connecting', 'connected'].includes(callState) && (
                <motion.div
                    key="active-call"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-gray-900 flex flex-col"
                >
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                        {isVideo && remoteStream ? (
                            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-white">
                                <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center text-4xl font-bold">
                                    {remoteUser?.name ? initials : <User size={40} />}
                                </div>
                                <p className="text-xl font-medium">{remoteUser?.name || 'Utilisateur'}</p>
                                <p className="text-white/60 text-sm">
                                    {callState === 'outgoing' && 'Appel en cours…'}
                                    {callState === 'connecting' && 'Connexion…'}
                                    {callState === 'connected' && formatDuration(callDuration)}
                                </p>
                            </div>
                        )}

                        {!remoteStream && !isVideo && null}
                        <audio ref={remoteAudioRef} autoPlay className="hidden" />

                        {isVideo && (
                            <div className="absolute bottom-24 right-4 w-28 h-40 sm:w-36 sm:h-48 rounded-xl overflow-hidden border-2 border-white/20 bg-black shadow-lg">
                                {!isCameraOff ? (
                                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/50">
                                        <VideoOff size={24} />
                                    </div>
                                )}
                            </div>
                        )}

                        {isVideo && callState === 'connected' && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 text-white text-sm px-3 py-1 rounded-full">
                                {remoteUser?.name} · {formatDuration(callDuration)}
                            </div>
                        )}
                    </div>

                    <div className="py-6 flex items-center justify-center gap-4">
                        <button
                            onClick={toggleMute}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-white text-gray-900' : 'bg-white/15 text-white hover:bg-white/25'}`}
                            title={isMuted ? 'Réactiver le micro' : 'Couper le micro'}
                        >
                            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        {isVideo && (
                            <button
                                onClick={toggleCamera}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isCameraOff ? 'bg-white text-gray-900' : 'bg-white/15 text-white hover:bg-white/25'}`}
                                title={isCameraOff ? 'Activer la caméra' : 'Couper la caméra'}
                            >
                                {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
                            </button>
                        )}

                        <button
                            onClick={endCall}
                            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                            title="Raccrocher"
                        >
                            <PhoneOff size={24} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CallManager;
