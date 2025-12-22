import React, { useState } from 'react';
import { Search, Filter, Eye, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useGame } from '../../context/GameContext';
import './Secondary.css';

const History = () => {
    const { selectedGame } = useGame();
    const { history } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedJob, setSelectedJob] = useState(null);

    // Filter Logic
    const filteredHistory = history.filter(row => {
        if (row.gameId && row.gameId !== selectedGame.id) return false;
        const idMatch = row.id ? row.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const campMatch = row.campaign ? row.campaign.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const matchesSearch = campMatch || idMatch;
        const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats Logic
    const totalJobs = filteredHistory.length;
    const successCount = filteredHistory.filter(h => h.status === 'Success').length;
    const successRate = totalJobs > 0 ? Math.round((successCount / totalJobs) * 100) : 0;

    // CSV Export
    const handleExportCSV = () => {
        if (filteredHistory.length === 0) return;

        const headers = ['Job ID', 'Campaign', 'Platform', 'Status', 'Creatives Count', 'Date'];
        const rows = filteredHistory.map(h => [
            h.id,
            `"${h.campaign}"`, // Quote strings with spaces
            h.platform,
            h.status,
            h.creatives,
            `"${h.date}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `publish_history_${selectedGame.name}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="secondary-page">
            <header className="sec-header">
                <div>
                    <h1 className="sec-title">Publish History</h1>
                    <p className="sec-subtitle">Track and manage your ad campaigns for <b>{selectedGame.name}</b>.</p>
                </div>
                <div className="sec-actions">
                    <button className="btn-secondary fit-content" onClick={handleExportCSV}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="history-stats">
                <div className="stat-card">
                    <div className="stat-label">Total Campaigns</div>
                    <div className="stat-val">{totalJobs}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Success Rate</div>
                    <div className="stat-val">{successRate}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Last Activity</div>
                    <div className="stat-val text-sm">{history[0]?.date || 'N/A'}</div>
                </div>
            </div>

            <div className="sec-toolbar">
                <div className="search-bar">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by Job ID or Campaign..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters-row">
                    <div className="select-wrapper">
                        <Filter size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Success">Success</option>
                            <option value="Partial">Partial</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="history-list-container fade-in">
                {filteredHistory.length > 0 ? (
                    <div className="history-grid">
                        {filteredHistory.map(row => (
                            <div key={row.id} className="history-card" onClick={() => setSelectedJob(row)}>
                                <div className="h-card-header">
                                    <div className="h-id">#{Math.floor(row.id).toString().slice(-6)}</div>
                                    <div className={`h-status-badge ${row.status.toLowerCase()}`}>
                                        {row.status}
                                    </div>
                                </div>
                                <div className="h-card-body">
                                    <div className="h-row">
                                        <div className="h-label">Campaign</div>
                                        <div className="h-val text-ellipsis" title={row.campaign}>{row.campaign}</div>
                                    </div>
                                    <div className="h-row">
                                        <div className="h-label">Platform</div>
                                        <div className="h-val">{row.platform}</div>
                                    </div>
                                    <div className="h-row">
                                        <div className="h-label">Date</div>
                                        <div className="h-val">{row.date}</div>
                                    </div>
                                </div>
                                <div className="h-card-footer">
                                    <div className="h-creatives-count">
                                        <span className="count-circle">{row.creatives}</span>
                                        <span>Creatives</span>
                                    </div>
                                    <button className="h-view-btn">View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon"><Search size={48} /></div>
                        <h3>No history found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedJob && (
                <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
                    <div className="modal-container medium" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Job Details #{Math.floor(selectedJob.id).toString().slice(-6)}</h3>
                            <button className="close-btn" onClick={() => setSelectedJob(null)}>
                                <span className="p-icon-sm">✕</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="kv-grid">
                                <div className="kv-item">
                                    <label>Campaign</label>
                                    <span>{selectedJob.campaign}</span>
                                </div>
                                <div className="kv-item">
                                    <label>Platform</label>
                                    <span>{selectedJob.platform}</span>
                                </div>
                                <div className="kv-item">
                                    <label>Date</label>
                                    <span>{selectedJob.date}</span>
                                </div>
                                <div className="kv-item">
                                    <label>Status</label>
                                    <span className={`status-text ${selectedJob.status.toLowerCase()}`}>{selectedJob.status}</span>
                                </div>
                            </div>

                            <hr className="divider" />

                            <h4>Published Items ({selectedJob.creatives})</h4>
                            <div className="published-items-list-modern">
                                {/* Mock items since we don't store individual items in history yet - wait for next refactor for that */}
                                {[...Array(selectedJob.creatives || 1)].map((_, i) => (
                                    <div key={i} className="p-item-modern">
                                        <div className="p-item-icon">
                                            <CheckCircle size={14} className="success-icon" />
                                        </div>
                                        <div className="p-item-info">
                                            <span className="p-item-name">Creative_Item_{i + 1}_FINAL.mp4</span>
                                            <span className="p-item-status">Uploaded successfully</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary modal-close-btn" onClick={() => setSelectedJob(null)}>Close</button>
                            <button className="btn-primary" onClick={() => window.open('https://adsmanager.facebook.com', '_blank')}>View in Ad Manager</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
