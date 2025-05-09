import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  autoConnect: false, // o false si decides conectarlo manualmente
  transports: ["websocket"], // evita fallback de polling
});

export default socket;
