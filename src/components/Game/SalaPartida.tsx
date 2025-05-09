// import { useLocation, useParams } from 'react-router-dom';
// import Tablero from '../Tablero/Tablero';
// import Chat from './Chat';
// import './SalaPartida.css';

// export default function SalaPartida() {
//   const { id } = useParams();
//   const { state } = useLocation();

//   return (
//     <div className="sala-partida-container">
//       <h2>Partida ID: {id}</h2>
//       <div className="jugadores">
//         <p>{state?.jugadores[0].nombre} vs {state?.jugadores[1].nombre}</p>
//       </div>
//       <div className="tablero-chat">
//         <Tablero />
//         <Chat partidaId={id || ''} />
//       </div>
//     </div>
//   );
// }
