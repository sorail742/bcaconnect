import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            reconnectionAttempts: 5
        });

        this.socket.on("connect", () => {
            console.log("⚡ Connecté au serveur temps réel");
            const token = localStorage.getItem('token');
            if (token) {
                // On peut émettre un event pour s'identifier si besoin
                // this.socket.emit('authenticate', token);
            }
        });

        this.socket.on("connect_error", (err) => {
            console.warn("⚠️ Erreur connexion Socket.io:", err.message);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // S'abonner à un événement
    on(event, callback) {
        if (!this.socket) this.connect();
        this.socket.on(event, callback);
    }

    // Se désabonner
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }
}

const socketService = new SocketService();
export default socketService;
