import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle, Smartphone } from 'lucide-react';
import './Step1Styles.css';

const Step1Select = ({ allCreatives, selected, setSelected }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    // Logic to toggle a specific dimension of a specific creative
    // selected format: ["creativeId-dimension", "1-9:16", "1-1:1"]
    const toggleSelection = (creativeId, dimension) => {
        const key = `${creativeId}-${dimension}`;
        if (selected.includes(key)) {
            setSelected(selected.filter(k => k !== key));
        } else {
            setSelected([...selected, key]);
        }
    };

    const toggleAllDimensions = (creative) => {
        const allKeys = creative.dimensions.map(d => `${creative.id}-${d}`);
        const allSelected = allKeys.every(k => selected.includes(k));

        if (allSelected) {
            // Deselect all
            setSelected(selected.filter(k => !allKeys.includes(k)));
        } else {
            // Select all unique
            const newSelection = [...selected];
            allKeys.forEach(k => {
                if (!newSelection.includes(k)) newSelection.push(k);
            });
            setSelected(newSelection);
        }
    };

    const filteredCreatives = useMemo(() => {
        return allCreatives.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = activeFilter === 'All' || c.type === activeFilter.toLowerCase();
            return matchesSearch && matchesType;
        });
    }, [allCreatives, searchTerm, activeFilter]);

    // Derived stats
    const totalSelectedCount = selected.length;
    // Unique creatives count
    const distinctCreatives = new Set(selected.map(s => s.split('-')[0])).size;

    return (
        <div className="step-container">
            <div className="step-main">
                <div className="step-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search creatives..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group-inline">
                        {['All', 'Video', 'Image', 'Playable'].map(type => (
                            <button
                                key={type}
                                className={`filter-chip ${activeFilter === type ? 'active' : ''}`}
                                onClick={() => setActiveFilter(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="creatives-grid">
                    {filteredCreatives.map(c => {
                        const allKeys = c.dimensions.map(d => `${c.id}-${d}`);
                        const isFullySelected = allKeys.every(k => selected.includes(k));
                        const isPartiallySelected = allKeys.some(k => selected.includes(k)) && !isFullySelected;

                        return (
                            <div
                                key={c.id}
                                className={`creative-card-select ${isFullySelected ? 'selected' : ''}`}
                                onClick={() => toggleAllDimensions(c)} // Click whole card to toggle
                            >
                                <div className="card-thumb">
                                    <img src={c.thumb} alt="" className="thumb-img" />
                                    <div className="selection-badge">
                                        {isFullySelected && <CheckCircle size={20} className="check-icon" />}
                                        {isPartiallySelected && <div className="partial-badge" />}
                                    </div>
                                    <div className="type-overlay">{c.type}</div>
                                </div>
                                <div className="card-info">
                                    <span className="card-name" title={c.name}>{c.name}</span>

                                    <div className="dims-selector">
                                        <span className="dims-label">Select Versions:</span>
                                        <div className="dims-list">
                                            {c.dimensions.map(d => {
                                                const key = `${c.id}-${d}`;
                                                const isSel = selected.includes(key);
                                                return (
                                                    <button
                                                        key={d}
                                                        className={`dim-chip ${isSel ? 'selected' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSelection(c.id, d);
                                                        }}
                                                    >
                                                        {d}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <aside className="selection-tray">
                <h3>Selection Summary</h3>
                <div className="tray-stats">
                    <div className="tray-row">
                        <span>Creatives</span>
                        <span className="tray-val">{distinctCreatives}</span>
                    </div>
                    <div className="tray-row highlight">
                        <span>Total Versions</span>
                        <span className="tray-val">{totalSelectedCount}</span>
                    </div>
                </div>

                <div className="tray-list">
                    <h4>Selected Items</h4>
                    {selected.length === 0 ? (
                        <p className="empty-text">No versions selected.</p>
                    ) : (
                        selected.map(item => {
                            const [cId, dim] = item.split('-');
                            const creative = allCreatives.find(c => c.id.toString() === cId);
                            if (!creative) return null;
                            return (
                                <div key={item} className="tray-item">
                                    <div className="tray-item-info">
                                        <span className="t-name">{creative.name}</span>
                                        <span className="t-dim">{dim}</span>
                                    </div>
                                    <button className="remove-btn" onClick={() => toggleSelection(cId, dim)}>&times;</button>
                                </div>
                            );
                        })
                    )}
                </div>
            </aside>
        </div>
    );
};

export default Step1Select;
