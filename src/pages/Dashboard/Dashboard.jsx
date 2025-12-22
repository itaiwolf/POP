import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Layers, Clock } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { selectedGame } = useGame();

    // Mock Activities with Game ID
    const allActivities = [
        { id: 1, gameId: 'g1', user: 'Itai User', action: 'published 5 ads', target: 'Meta / Neon Launch', time: '10 mins ago' },
        { id: 2, gameId: 'g2', user: 'Sarah Designer', action: 'uploaded generic', target: 'Puzzle Assets', time: '1 hour ago' },
        { id: 3, gameId: 'g1', user: 'Mike Analyst', action: 'connected', target: 'Unity Ads', time: '3 hours ago' },
        { id: 4, gameId: 'g3', user: 'Itai User', action: 'created campaign', target: 'Fantasy Quest MVP', time: '5 hours ago' },
        { id: 5, gameId: 'g1', user: 'Itai User', action: 'paused ad set', target: 'US_Broad', time: '1 day ago' },
    ];

    const filteredActivities = useMemo(() => {
        return allActivities.filter(a => a.gameId === selectedGame.id);
    }, [selectedGame, allActivities]);

    // Derived Stats
    const stats = useMemo(() => {
        // Simple mock randomizer based on game ID char code
        const seed = selectedGame.id.charCodeAt(1);
        return [
            { label: 'Active Campaigns', value: (seed % 5) + 3, icon: <TrendingUp size={24} />, color: 'var(--success)' },
            { label: 'Total Creatives', value: (seed * 12), icon: <Layers size={24} />, color: 'var(--primary-color)' },
            { label: 'Ad Units Live', value: (seed * 8 + 42), icon: <BarChart3 size={24} />, color: 'var(--info)' },
            { label: 'Pending Review', value: (seed % 3), icon: <Clock size={24} />, color: 'var(--warning)' },
        ];
    }, [selectedGame]);

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Game: <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{selectedGame.name}</span></p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => navigate('/wizard')}>Create New Campaign</button>
                </div>
            </header>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon" style={{ color: stat.color, backgroundColor: `${stat.color}15` }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="section-container">
                <h2 className="section-title">Recent Activity</h2>
                <div className="activity-list">
                    {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-avatar">{activity.user.charAt(0)}</div>
                                <div className="activity-details">
                                    <span className="activity-text">
                                        <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
                                    </span>
                                    <span className="activity-time">{activity.time}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state-sm">No recent activity for {selectedGame.name}.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
