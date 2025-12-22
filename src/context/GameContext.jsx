import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const games = [
        { id: 'g1', name: 'Neon Vanguard', genre: 'Sci-Fi Shooter', assets: 'scifi' },
        { id: 'g2', name: 'Puzzle Paradise', genre: 'Match-3', assets: 'puzzle' },
        { id: 'g3', name: 'Fantasy Quest', genre: 'RPG', assets: 'fantasy' },
    ];

    const [selectedGame, setSelectedGame] = useState(games[0]);

    return (
        <GameContext.Provider value={{ games, selectedGame, setSelectedGame }}>
            {children}
        </GameContext.Provider>
    );
};
