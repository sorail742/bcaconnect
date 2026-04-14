import { io } from "socket.io-client";

import { SOCKET_URL } from '../constants/api';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(userId = null) {
        if (this.socket?.connected) {
            if (userId) this.socket.emit('join', userId);
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            transports: ["websocket"], // Prioriser websocket pour la performance
            reconnectionAttempts: 10,
            reconnectionDelay: 2000
        });

        this.socket.on("connect", () => {
            if (userId) {
                this.socket.emit('join', userId);
            }
        });

        this.socket.on("connect_error", (err) => {
            // Silencieux en production
        });

        return this.socket;
    }

    isConnected() {
        return this.socket?.connected || false;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // S'abonner à un événement
    on(event, callback) {
        if (!this.socket) {
            console.warn("⚠️ Tentative d'écoute sans socket connectée.");
            return;
        }
        this.socket.on(event, callback);
    }

    // Se désabonner
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }
}

const socketService = new SocketService();
export default socketService;
