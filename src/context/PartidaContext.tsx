import { createContext, useContext, useState } from 'react';

export const PartidaContext = createContext<any>(null);

export const usePartida = () => useContext(PartidaContext);

export const PartidaProvider = ({ children }: { children: React.ReactNode }) => {
  const [partida, setPartida] = useState(null);
  const [jugadores, setJugadores] = useState([]);

  return (
    <PartidaContext.Provider value={{ partida, setPartida, jugadores, setJugadores }}>
      {children}
    </PartidaContext.Provider>
  );
};
