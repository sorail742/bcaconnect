import { io } from "socket.io-client";

import { SOCKET_URL } from '../constants/api';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(userData = null) {
        if (this.socket?.connected) {
            if (userData) this.socket.emit('join', userData);
            return this.socket;
        }

        const socket = io(SOCKET_URL, {
            reconnectionAttempts: 10,
            reconnectionDelay: 2000
        });

        socket.on("connect", () => {
            if (userData) {
                socket.emit('join', userData);
            }
        });

        socket.on("connect_error", (err) => {
            // Silencieux
        });

        this.socket = socket;
        return socket;
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
