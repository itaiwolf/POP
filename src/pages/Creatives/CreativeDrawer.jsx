import React, { useState, useMemo } from 'react';
import { X, CheckCircle, Maximize2 } from 'lucide-react';
import { getCompatiblePlatforms, PlatformIcon, getAspectRatio, getAspectRatioStyle } from '../../utils/creativeUtils';
import './CreativeDrawer.css';

const CreativeDrawer = ({ creative, onClose }) => {
    const [fullScreenPreview, setFullScreenPreview] = useState(null);

    if (!creative) return null;

    // Dynamically generate versions based on creative.dimensions
    const versions = useMemo(() => {
        if (!creative.dimensions) return [];
        return creative.dimensions.map((dim, index) => ({
            id: `v-${index}`,
            dim: dim,
            type: dim === 'HTML5' ? 'Playable' : (dim === '1:1' ? 'Square' : 'Portrait'),
            duration: creative.type === 'video' ? '15s' : '-',
            fit: getCompatiblePlatforms([dim]),
            status: 'ready'
        }));
    }, [creative]);

    const handleFullScreen = (v) => {
        setFullScreenPreview({
            src: creative.thumb,
            ratio: getAspectRatio(v.dim)
        });
    };

    return (
        <>
            <div className="drawer-overlay" onClick={onClose}>
                <div className="drawer-container slide-in-right" onClick={e => e.stopPropagation()}>
                    <header className="drawer-header">
                        <div>
                            <h2 className="drawer-title">{creative.name}</h2>
                            <div className="drawer-meta">
                                <span className="meta-tag">{creative.type}</span>
                                <span className="meta-dot">•</span>
                                <span>{creative.date}</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </header>

                    <div className="drawer-content">
                        <div className="versions-section">
                            <h3>Versions ({versions.length})</h3>
                            <div className="versions-grid">
                                {versions.map(v => (
                                    <div key={v.id} className="version-card">
                                        <div
                                            className="version-preview"
                                            style={getAspectRatioStyle(v.dim)}
                                        >
                                            <img src={creative.thumb} alt="" className="v-img" />
                                            <button
                                                className="expand-btn"
                                                onClick={(e) => { e.stopPropagation(); handleFullScreen(v); }}
                                                title="View Full Screen"
                                            >
                                                <Maximize2 size={16} />
                                            </button>
                                            <div className="version-badge">{v.dim}</div>
                                        </div>
                                        <div className="version-info">
                                            <div className="v-row">
                                                <span className="v-label">Duration</span>
                                                <span>{v.duration}</span>
                                            </div>
                                            <div className="v-row">
                                                <span className="v-label">Platform Fit</span>
                                                <div className="v-platforms">
                                                    {v.fit.map(f => (
                                                        <span key={f} title={f}><PlatformIcon p={f} /></span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <aside className="drawer-sidebar">
                            <div className="sidebar-group">
                                <label>Language</label>
                                <p>English (US)</p>
                            </div>
                            <div className="sidebar-group">
                                <label>Tags</label>
                                <div className="tags-container">
                                    <span className="tag-chip">Summer</span>
                                    <span className="tag-chip">Promo</span>
                                    <span className="tag-chip">Gameplay</span>
                                </div>
                            </div>
                            <div className="sidebar-group">
                                <label>Status</label>
                                <div className="status-indicator ready">
                                    <CheckCircle size={14} /> Ready to Use
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {/* Full Screen Modal */}
            {fullScreenPreview && (
                <div className="fullscreen-overlay" onClick={() => setFullScreenPreview(null)}>
                    <div className="fullscreen-content" onClick={e => e.stopPropagation()}>
                        <button className="fs-close" onClick={() => setFullScreenPreview(null)}>
                            <X size={24} />
                        </button>
                        <div className="fs-media-wrapper" style={getAspectRatioStyle(fullScreenPreview.ratio)}>
                            <img src={fullScreenPreview.src} alt="Full Screen" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreativeDrawer;
