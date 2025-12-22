import React, { useState, useMemo } from 'react';
import { Search, Plus, MoreHorizontal, Check, Trash2, Zap, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreativeDrawer from './CreativeDrawer';
import UploadModal from './UploadModal';
import { useGame } from '../../context/GameContext';
import { useData } from '../../context/DataContext';
import { getCompatiblePlatforms, PlatformIcon } from '../../utils/creativeUtils';
import './Creatives.css';

const CreativesList = () => {
    const navigate = useNavigate();
    const { selectedGame } = useGame();
    const { creatives, isUploaded, deleteCreatives } = useData();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCreative, setSelectedCreative] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    // const [activeMenu, setActiveMenu] = useState(null); // Removed

    // Multi-select State
    const [selectedIds, setSelectedIds] = useState([]);

    // Checkbox Filters for Type
    const [typeFilters, setTypeFilters] = useState({
        video: true,
        image: true,
        playable: true
    });

    const [platformFilters, setPlatformFilters] = useState({
        meta: true, tiktok: true, google: true, unity: true, applovin: true
    });

    // Enrich data with derived props
    const enrichedCreatives = useMemo(() => {
        return creatives.map(c => ({
            ...c,
            // If already has platforms (from upload), use them. Otherwise derive from dims.
            platforms: c.platforms || getCompatiblePlatforms(c.dimensions),
            adUnits: c.dimensions.length * 3
        }));
    }, [creatives]);

    const filteredCreatives = useMemo(() => {
        return enrichedCreatives.filter(c => {
            // 1. Game Filter
            if (c.gameId !== selectedGame.id) return false;

            // 2. Search Filter
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.owner.toLowerCase().includes(searchTerm.toLowerCase());

            // 3. Type Filter (Checkbox Logic)
            if (!typeFilters[c.type]) return false;

            // 4. Platform Filter
            const activePlatformKeys = Object.keys(platformFilters).filter(k => platformFilters[k]);

            // If the item has no platforms (new upload waiting for review), 
            // we should show it regardless of platform filters to avoid it "disappearing"
            if (c.platforms.length === 0) return matchesSearch;

            const hasPlatformMatch = c.platforms.some(p => activePlatformKeys.includes(p));

            return matchesSearch && hasPlatformMatch;
        });
    }, [searchTerm, typeFilters, platformFilters, selectedGame, enrichedCreatives]);

    const togglePlatformFilter = (p) => {
        setPlatformFilters(prev => ({ ...prev, [p]: !prev[p] }));
    };

    const toggleTypeFilter = (t) => {
        setTypeFilters(prev => ({ ...prev, [t]: !prev[t] }));
    };

    // Selection Logic
    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === filteredCreatives.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCreatives.map(c => c.id));
        }
    };

    // Actions
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) {
            deleteCreatives(selectedIds);
            setSelectedIds([]);
        }
    };

    const handleCreateCampaign = () => {
        const preSelected = [];
        selectedIds.forEach(id => {
            const creative = creatives.find(c => c.id === id);
            if (creative) {
                creative.dimensions.forEach(dim => {
                    preSelected.push(`${creative.id}-${dim}`);
                });
            }
        });

        navigate('/wizard', {
            state: {
                initialStep: 2,
                selectedCreatives: preSelected
            }
        });
    };

    return (
        <div className="creatifs-page">
            <header className="page-header">
                <h1 className="page-title">Creatives Library</h1>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
                        <Plus size={16} /> Upload Creatives
                    </button>
                </div>
            </header>

            <div className="content-layout">
                <aside className="filters-panel">
                    <div className="filter-group">
                        <h3>Type</h3>
                        <div className="filter-options">
                            {['Video', 'Image', 'Playable'].map(typeLabel => {
                                const key = typeLabel.toLowerCase();
                                return (
                                    <label key={key} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={typeFilters[key]}
                                            onChange={() => toggleTypeFilter(key)}
                                        />
                                        {typeLabel}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                    <div className="filter-group">
                        <h3>Platform Fit</h3>
                        <div className="filter-options">
                            {['Meta', 'TikTok', 'Google', 'Unity', 'AppLovin'].map(p => {
                                const key = p.toLowerCase();
                                return (
                                    <label key={p} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={platformFilters[key]}
                                            onChange={() => togglePlatformFilter(key)}
                                        />
                                        {p}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                <div className="main-table-container">
                    <div className="table-actions">
                        <div className="search-bar">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, tag or owner..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Bulk Actions Header Area */}
                        {selectedIds.length > 0 && (
                            <div className="header-bulk-actions fade-in">
                                <span className="selection-count">{selectedIds.length} selected</span>
                                <div className="h-actions-group">
                                    <button className="btn-danger-ghost small" onClick={handleDelete}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                    <button className="btn-primary small" onClick={handleCreateCampaign}>
                                        <Zap size={14} /> Create Campaign
                                    </button>
                                    <button className="icon-btn-ghost small" onClick={() => setSelectedIds([])}>
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredCreatives.length && filteredCreatives.length > 0}
                                        onChange={toggleAll}
                                    />
                                </th>
                                <th>Creative Name</th>
                                <th>Type</th>
                                <th>Dimensions</th>
                                <th>Platform Fit</th>
                                <th>Owner</th>
                                <th>Date Added</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCreatives.map(row => (
                                <tr key={row.id} onClick={() => setSelectedCreative(row)}>
                                    <td onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(row.id)}
                                            onChange={() => toggleSelection(row.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="creative-cell">
                                            <div className="c-thumb">
                                                <img src={row.thumb} alt="" className="thumb-img" />
                                            </div>
                                            <span className="c-name">{row.name}</span>
                                        </div>
                                    </td>
                                    <td><span className={`type-badge ${row.type}`}>{row.type}</span></td>
                                    <td>
                                        <div className="dim-tags">
                                            {row.dimensions.map(d => <span key={d} className="d-tag">{d}</span>)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="plat-icons">
                                            {(row.platforms || []).map(p => {
                                                const uploaded = isUploaded(row.id, p);
                                                return (
                                                    <div key={p} className={`plat-icon-wrapper ${uploaded ? 'uploaded' : ''}`} title={p}>
                                                        <PlatformIcon p={p} />
                                                        {uploaded && <div className="uploaded-badge"><Check size={8} /></div>}
                                                    </div>
                                                );
                                            })}
                                            {(!row.platforms || row.platforms.length === 0) && (
                                                <span className="platform-fit-text" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    Review
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{row.owner}</td>
                                    <td>{row.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredCreatives.length === 0 && (
                        <div className="empty-state">No creatives found matching your filters for {selectedGame.name}.</div>
                    )}
                </div>
            </div>

            {selectedCreative && <CreativeDrawer creative={selectedCreative} onClose={() => setSelectedCreative(null)} />}

            {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} />}
        </div>
    );
};

export default CreativesList;
