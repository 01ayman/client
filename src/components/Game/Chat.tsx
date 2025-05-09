import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const socket = io('http://localhost:3001');

export default function Chat({ partidaId }: { partidaId: string }) {
  const [msg, setMsg] = useState('');
  const [mensajes, setMensajes] = useState<string[]>([]);

  useEffect(() => {
    socket.on('chat_mensaje', (data: string) => {
      setMensajes((prev) => [...prev, data]);
    });

    return () => {
      socket.off('chat_mensaje');
    };
  }, []);

  const enviar = () => {
    socket.emit('chat_mensaje', { partidaId, texto: msg });
    setMsg('');
  };

  return (
    <div className="chat">
      <div className="chat-mensajes">
        {mensajes.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
      <div className="chat-input">
        <input value={msg} onChange={(e) => setMsg(e.target.value)} />
        <button onClick={enviar}>Enviar</button>
      </div>
    </div>
  );
}
