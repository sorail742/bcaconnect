import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import useSocket from '../../hooks/useSocket';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';

const CallContext = createContext(null);

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

/**
 * Appels audio/vidéo 1-à-1 en WebRTC. Le signaling (offre/réponse/ICE) transite
 * par les événements socket.io "call_*" déjà relayés côté serveur — aucune
 * dépendance externe. Sans serveur TURN, la connexion peut échouer sur certains
 * réseaux très restrictifs (NAT symétrique) ; fonctionne sur la grande majorité
 * des connexions domestiques/mobiles via les serveurs STUN publics.
 */
export const CallProvider = ({ children }) => {
    const { on, off, emit } = useSocket();
    const { user } = useAuthStore();

    // idle | outgoing | incoming | connected
    const [callState, setCallState] = useState('idle');
    const [callType, setCallType] = useState('audio'); // 'audio' | 'video'
    const [remoteUser, setRemoteUser] = useState(null); // { id, name }
    const [conversationId, setConversationId] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const pcRef = useRef(null);
    const pendingCandidatesRef = useRef([]);
    const remoteIdRef = useRef(null);
    const durationTimerRef = useRef(null);

    const stopDurationTimer = () => {
        if (durationTimerRef.current) {
            clearInterval(durationTimerRef.current);
            durationTimerRef.current = null;
        }
    };

    const cleanup = useCallback(() => {
        stopDurationTimer();
        setCallDuration(0);
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        setLocalStream((s) => { s?.getTracks().forEach((t) => t.stop()); return null; });
        setRemoteStream(null);
        pendingCandidatesRef.current = [];
        remoteIdRef.current = null;
        setRemoteUser(null);
        setConversationId(null);
        setIsMuted(false);
        setIsCameraOff(false);
        setCallState('idle');
    }, []);

    const createPeerConnection = useCallback((targetId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pc.onicecandidate = (e) => {
            if (e.candidate) {
                emit('call_signal', { targetId, signal: { type: 'ice-candidate', candidate: e.candidate } });
            }
        };
        pc.ontrack = (e) => {
            setRemoteStream(e.streams[0]);
        };
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'connected') {
                setCallState('connected');
            } else if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
                if (pc.connectionState === 'failed') toast.error("La connexion d'appel a échoué.");
            }
        };
        pcRef.current = pc;
        return pc;
    }, [emit]);

    const getMedia = useCallback(async (video) => {
        try {
            return await navigator.mediaDevices.getUserMedia({ audio: true, video });
        } catch (err) {
            toast.error(video ? "Impossible d'accéder à la caméra/micro." : "Impossible d'accéder au micro.");
            throw err;
        }
    }, []);

    // ── Démarrer un appel sortant ──────────────────────────────────────────
    const startCall = useCallback(async (target, convId, type = 'audio') => {
        if (callState !== 'idle') {
            toast.error('Un appel est déjà en cours.');
            return;
        }
        try {
            const stream = await getMedia(type === 'video');
            setLocalStream(stream);
            setCallType(type);
            setRemoteUser(target);
            setConversationId(convId);
            remoteIdRef.current = target.id;
            setCallState('outgoing');
            emit('call_invite', { targetId: target.id, conversationId: convId, callType: type, callerName: user?.nom_complet });
        } catch {
            cleanup();
        }
    }, [callState, emit, getMedia, user?.nom_complet, cleanup]);

    // ── Accepter un appel entrant ──────────────────────────────────────────
    const acceptCall = useCallback(async () => {
        if (!remoteUser) return;
        try {
            const stream = await getMedia(callType === 'video');
            setLocalStream(stream);
            const pc = createPeerConnection(remoteIdRef.current);
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            emit('call_accept', { targetId: remoteIdRef.current, conversationId });
            setCallState('connecting');
        } catch {
            emit('call_reject', { targetId: remoteIdRef.current, conversationId });
            cleanup();
        }
    }, [remoteUser, callType, getMedia, createPeerConnection, emit, conversationId, cleanup]);

    const rejectCall = useCallback(() => {
        if (remoteIdRef.current) emit('call_reject', { targetId: remoteIdRef.current, conversationId });
        cleanup();
    }, [emit, conversationId, cleanup]);

    const endCall = useCallback(() => {
        if (remoteIdRef.current) emit('call_end', { targetId: remoteIdRef.current, conversationId });
        cleanup();
    }, [emit, conversationId, cleanup]);

    const toggleMute = useCallback(() => {
        setLocalStream((stream) => {
            if (stream) stream.getAudioTracks().forEach((t) => { t.enabled = isMuted; });
            return stream;
        });
        setIsMuted((m) => !m);
    }, [isMuted]);

    const toggleCamera = useCallback(() => {
        setLocalStream((stream) => {
            if (stream) stream.getVideoTracks().forEach((t) => { t.enabled = isCameraOff; });
            return stream;
        });
        setIsCameraOff((c) => !c);
    }, [isCameraOff]);

    // ── Chronomètre d'appel connecté ───────────────────────────────────────
    useEffect(() => {
        if (callState === 'connected') {
            durationTimerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
        } else {
            stopDurationTimer();
        }
        return stopDurationTimer;
    }, [callState]);

    // ── Écouteurs socket globaux ────────────────────────────────────────────
    useEffect(() => {
        if (!on || !off) return undefined;

        const handleInvite = ({ conversationId: convId, callType: type, callerName, callerId }) => {
            if (callState !== 'idle') {
                // Occupé : on pourrait auto-refuser, ici on ignore simplement l'appel entrant.
                return;
            }
            remoteIdRef.current = callerId;
            setRemoteUser({ id: callerId, name: callerName });
            setConversationId(convId);
            setCallType(type);
            setCallState('incoming');
        };

        const handleAccepted = async () => {
            if (!pcRef.current) {
                const pc = createPeerConnection(remoteIdRef.current);
                setLocalStream((stream) => {
                    if (stream) stream.getTracks().forEach((track) => pc.addTrack(track, stream));
                    return stream;
                });
                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    emit('call_signal', { targetId: remoteIdRef.current, signal: { type: 'offer', sdp: offer } });
                    setCallState('connecting');
                } catch {
                    toast.error("Erreur lors de l'établissement de l'appel.");
                    cleanup();
                }
            }
        };

        const handleRejected = () => {
            toast.info('Appel refusé.');
            cleanup();
        };

        const handleEnded = () => {
            toast.info("L'appel s'est terminé.");
            cleanup();
        };

        const handleSignal = async ({ signal, fromId }) => {
            if (fromId !== remoteIdRef.current) return;
            let pc = pcRef.current;

            if (signal.type === 'offer') {
                if (!pc) pc = createPeerConnection(fromId);
                await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                for (const cand of pendingCandidatesRef.current) await pc.addIceCandidate(cand).catch(() => {});
                pendingCandidatesRef.current = [];
                setLocalStream((stream) => {
                    if (stream && pc.getSenders().length === 0) stream.getTracks().forEach((track) => pc.addTrack(track, stream));
                    return stream;
                });
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                emit('call_signal', { targetId: fromId, signal: { type: 'answer', sdp: answer } });
            } else if (signal.type === 'answer') {
                if (pc) await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            } else if (signal.type === 'ice-candidate') {
                const candidate = new RTCIceCandidate(signal.candidate);
                if (pc?.remoteDescription) await pc.addIceCandidate(candidate).catch(() => {});
                else pendingCandidatesRef.current.push(candidate);
            }
        };

        on('call_invite', handleInvite);
        on('call_accepted', handleAccepted);
        on('call_rejected', handleRejected);
        on('call_ended', handleEnded);
        on('call_signal', handleSignal);

        return () => {
            off('call_invite', handleInvite);
            off('call_accepted', handleAccepted);
            off('call_rejected', handleRejected);
            off('call_ended', handleEnded);
            off('call_signal', handleSignal);
        };
    }, [on, off, emit, callState, createPeerConnection, cleanup]);

    return (
        <CallContext.Provider value={{
            callState, callType, remoteUser, localStream, remoteStream,
            isMuted, isCameraOff, callDuration,
            startCall, acceptCall, rejectCall, endCall, toggleMute, toggleCamera,
        }}>
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const ctx = useContext(CallContext);
    if (!ctx) throw new Error('useCall doit être utilisé dans un CallProvider');
    return ctx;
};
