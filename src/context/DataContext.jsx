import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    // 1. Centralized Creatives Data
    const initialCreatives = [
        // Neon Vanguard (Sci-Fi) - Game ID: g1
        { id: 1, gameId: 'g1', name: 'Hero Gameplay v1', type: 'video', dimensions: ['9:16', '1:1', '16:9'], owner: 'Itai User', date: 'Oct 24', thumb: '/assets/img_scifi.png' },
        { id: 2, gameId: 'g1', name: 'Level 3 Playable', type: 'playable', dimensions: ['HTML5'], owner: 'Dev Team', date: 'Oct 22', thumb: '/assets/img_scifi.png' },
        { id: 3, gameId: 'g1', name: 'Character Reveal', type: 'video', dimensions: ['9:16'], owner: 'Itai User', date: 'Oct 21', thumb: '/assets/img_scifi.png' },
        { id: 11, gameId: 'g1', name: 'Boss Fight Teaser', type: 'video', dimensions: ['9:16', '1:1'], owner: 'Itai User', date: 'Oct 26', thumb: '/assets/img_scifi.png' },
        { id: 12, gameId: 'g1', name: 'Endless Mode Ad', type: 'image', dimensions: ['1:1', '9:16', '4:5'], owner: 'Sarah Design', date: 'Oct 27', thumb: '/assets/img_scifi.png' },

        // Puzzle Paradise - Game ID: g2
        { id: 4, gameId: 'g2', name: 'Summer Sale Banner', type: 'image', dimensions: ['1:1', '4:5'], owner: 'Sarah Design', date: 'Oct 23', thumb: '/assets/img_puzzle.png' },
        { id: 5, gameId: 'g2', name: 'Win Back Promo', type: 'image', dimensions: ['1:1', '9:16'], owner: 'Sarah Design', date: 'Oct 20', thumb: '/assets/img_puzzle.png' },
        { id: 13, gameId: 'g2', name: 'Level 50 Challenge', type: 'video', dimensions: ['9:16'], owner: 'Itai User', date: 'Oct 28', thumb: '/assets/img_puzzle.png' },
        { id: 14, gameId: 'g2', name: 'Cute Characters', type: 'image', dimensions: ['1:1', '4:5'], owner: 'Sarah Design', date: 'Oct 29', thumb: '/assets/img_puzzle.png' },

        // Fantasy Quest - Game ID: g3
        { id: 6, gameId: 'g3', name: 'Dragon Boss Fight', type: 'video', dimensions: ['9:16', '16:9'], owner: 'Itai User', date: 'Oct 25', thumb: '/assets/img_fantasy.png' },
        { id: 7, gameId: 'g3', name: 'Guild Wars Teaser', type: 'video', dimensions: ['1:1'], owner: 'Itai User', date: 'Oct 19', thumb: '/assets/img_fantasy.png' },
        { id: 15, gameId: 'g3', name: 'Epic Gear Showcase', type: 'video', dimensions: ['9:16', '16:9'], owner: 'Itai User', date: 'Oct 30', thumb: '/assets/img_fantasy.png' },
        { id: 16, gameId: 'g3', name: 'PvP Arena Clip', type: 'video', dimensions: ['9:16'], owner: 'Dev Team', date: 'Nov 01', thumb: '/assets/img_fantasy.png' },
        { id: 17, gameId: 'g3', name: 'Fairy Event Playable', type: 'playable', dimensions: ['HTML5'], owner: 'Dev Team', date: 'Nov 02', thumb: '/assets/img_fantasy.png' },
    ];

    // Helper for safe parsing
    const safeParse = (key, fallback) => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : fallback;
        } catch (e) {
            console.error(`Error parsing ${key} from localStorage`, e);
            return fallback;
        }
    };

    const [creatives, setCreatives] = useState(() => safeParse('pop_creatives', initialCreatives));

    // 2. Publish History
    const [history, setHistory] = useState(() => safeParse('pop_history', []));

    // 3. Upload Status
    const [uploadedStatus, setUploadedStatus] = useState(() => safeParse('pop_uploaded', {}));

    // 4. Meta Authentication
    const [metaToken, setMetaTokenState] = useState(() => {
        return (localStorage.getItem('pop_meta_token') || '').trim();
    });

    const setMetaToken = (val) => {
        const cleaned = (val || '').trim();
        setMetaTokenState(cleaned);
    };

    // Persistence Effects
    React.useEffect(() => {
        try {
            localStorage.setItem('pop_creatives', JSON.stringify(creatives));
        } catch (e) {
            console.error('Failed to save creatives', e);
        }
    }, [creatives]);

    React.useEffect(() => {
        try {
            localStorage.setItem('pop_history', JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save history', e);
        }
    }, [history]);

    React.useEffect(() => {
        try {
            localStorage.setItem('pop_uploaded', JSON.stringify(uploadedStatus));
        } catch (e) {
            console.error('Failed to save uploadedStatus', e);
        }
    }, [uploadedStatus]);

    React.useEffect(() => {
        try {
            if (metaToken) {
                localStorage.setItem('pop_meta_token', metaToken);
            } else {
                localStorage.removeItem('pop_meta_token');
            }
        } catch (e) {
            console.error('Failed to save metaToken', e);
        }
    }, [metaToken]);

    // Actions
    const addCreatives = (newCreatives) => {
        setCreatives(prev => [...newCreatives, ...prev]);
    };
    const addHistoryItem = (item) => {
        setHistory(prev => [item, ...prev]);
    };

    const markAsUploaded = (creativeId, platformId) => {
        setUploadedStatus(prev => {
            const currentPlatforms = prev[creativeId] || [];
            if (currentPlatforms.includes(platformId)) return prev;
            return {
                ...prev,
                [creativeId]: [...currentPlatforms, platformId]
            };
        });
    };

    const isUploaded = (creativeId, platformId) => {
        return uploadedStatus[creativeId]?.includes(platformId);
    };

    const deleteCreatives = (ids) => {
        setCreatives(prev => prev.filter(c => !ids.includes(c.id)));
    };

    const updateCreative = (id, data) => {
        setCreatives(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    };

    const value = {
        creatives,
        setCreatives,
        addCreatives,
        deleteCreatives,
        updateCreative,
        history,
        addHistoryItem,
        uploadedStatus,
        markAsUploaded,
        isUploaded,
        metaToken,
        setMetaToken
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
