import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Image, History, Blocks, Settings, ChevronDown, Gamepad2 } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import './Sidebar.css';

const Sidebar = () => {
    const { games, selectedGame, setSelectedGame } = useGame();
    const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-accent">Pop!</span>
                </div>
            </div>
            <div className="sidebar-game-context">
                <div
                    className="game-selector"
                    onClick={() => setIsGameMenuOpen(!isGameMenuOpen)}
                >
                    <div className="game-icon">
                        <Gamepad2 size={24} />
                    </div>
                    <div className="game-info">
                        <span className="game-name">{selectedGame.name}</span>
                        <span className="game-genre">{selectedGame.genre}</span>
                    </div>
                    <ChevronDown size={16} className={`chevron ${isGameMenuOpen ? 'open' : ''}`} />

                    {isGameMenuOpen && (
                        <div className="game-dropdown">
                            {games.map(g => (
                                <div
                                    key={g.id}
                                    className={`game-option ${selectedGame.id === g.id ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedGame(g);
                                        setIsGameMenuOpen(false);
                                    }}
                                >
                                    {g.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/wizard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <PlusCircle size={20} />
                    <span>Create Ads</span>
                </NavLink>

                <NavLink to="/creatives" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Image size={20} />
                    <span>Creatives</span>
                </NavLink>

                <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <History size={20} />
                    <span>Publish History</span>
                </NavLink>

                <NavLink to="/integrations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Blocks size={20} />
                    <span>Integrations</span>
                </NavLink>

                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">IU</div>
                    <div className="user-info">
                        <span className="user-name">Itai User</span>
                        <span className="user-role">Admin</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
