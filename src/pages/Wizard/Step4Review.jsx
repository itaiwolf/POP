import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Trash2, X, Smartphone, Monitor } from 'lucide-react';
import { getAspectRatioStyle } from '../../utils/creativeUtils';
import './Step4Styles.css';

const Step4Review = ({ selectedCreatives, selectedPlatforms, allCreatives, onPublish }) => {
    // selectedCreatives is array of strings "creativeId-dimension"
    // We need to group them by Creative + Platform

    const [ads, setAds] = useState([]);
    const [previewAd, setPreviewAd] = useState(null); // The ad group being previewed
    const [previewDim, setPreviewDim] = useState(null); // The specific dimension active in preview

    // Initialize ads on mount (or memo)
    useMemo(() => {
        const groupedAds = {}; // Key: "cId-platform" -> Object

        selectedCreatives.forEach(item => {
            const [cId, dim] = item.split('-');
            const creative = allCreatives.find(c => c.id.toString() === cId);
            if (!creative) return;

            selectedPlatforms.forEach(p => {
                const key = `${cId}-${p}`;
                if (!groupedAds[key]) {
                    groupedAds[key] = {
                        id: key,
                        creative: creative,
                        platform: p,
                        dimensions: [],
                        status: 'ready'
                    };
                }
                groupedAds[key].dimensions.push(dim);
            });
        });

        setAds(Object.values(groupedAds));
    }, [selectedCreatives, selectedPlatforms, allCreatives]);

    const removeAdGroup = (id) => {
        setAds(ads.filter(a => a.id !== id));
    };

    const handleRowClick = (ad) => {
        setPreviewAd(ad);
        setPreviewDim(ad.dimensions[0]);
    };

    return (
        <div className="step-container">
            <div className="step-main">
                <h2 className="step-title">Review Ad Units</h2>
                <div className="review-table-container">
                    <table className="review-table clickable-rows">
                        <thead>
                            <tr>
                                <th>Platform</th>
                                <th>Creative</th>
                                <th>Formats</th>
                                <th>Destination</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ads.map(ad => (
                                <tr key={ad.id} onClick={() => handleRowClick(ad)}>
                                    <td>
                                        <span className={`p-badge ${ad.platform}`}>{ad.platform}</span>
                                    </td>
                                    <td>
                                        <div className="ad-cell">
                                            <span className="font-medium">{ad.creative.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="dim-tags-row">
                                            {ad.dimensions.map(d => (
                                                <span key={d} className="d-tag-sm">{d}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>Campaign: User Acquisition</td>
                                    <td>
                                        <div className="status-tag ready"><CheckCircle size={14} /> Ready</div>
                                    </td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <button className="icon-btn" onClick={() => removeAdGroup(ad.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {ads.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="empty-table-msg">No ads configured. Go back to select creatives.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <aside className="review-summary">
                <h3>Publish Summary</h3>
                <div className="summary-stats">
                    <div className="tray-row">
                        <span>Total Campaigns</span>
                        <span className="tray-val">1</span>
                    </div>
                    <div className="tray-row">
                        <span>Ad Groups</span>
                        <span className="tray-val">{ads.length}</span>
                    </div>
                    <div className="tray-row highlight">
                        <span>Total Ad Units</span>
                        <span className="tray-val">
                            {ads.reduce((acc, curr) => acc + curr.dimensions.length, 0)}
                        </span>
                    </div>
                </div>
                <button className="btn-primary full-width" onClick={onPublish} disabled={ads.length === 0}>
                    Publish All Ads
                </button>
            </aside>

            {/* PREVIEW MODAL */}
            {previewAd && (
                <div className="modal-overlay" onClick={() => setPreviewAd(null)}>
                    <div className="preview-modal" onClick={e => e.stopPropagation()}>
                        <div className="pm-header">
                            <h3>Ad Preview: {previewAd.creative.name}</h3>
                            <button className="close-btn" onClick={() => setPreviewAd(null)}><X size={20} /></button>
                        </div>
                        <div className="pm-body">
                            <div className="pm-sidebar">
                                <h4>Variations</h4>
                                <div className="var-list">
                                    {previewAd.dimensions.map(d => (
                                        <button
                                            key={d}
                                            className={`var-btn ${previewDim === d ? 'active' : ''}`}
                                            onClick={() => setPreviewDim(d)}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="pm-content">
                                <div
                                    className="device-frame"
                                    style={getAspectRatioStyle(previewDim)}
                                >
                                    <div className="device-screen">
                                        <img src={previewAd.creative.thumb} alt="Preview" className="preview-img" />
                                        <div className="preview-overlay">
                                            <span>{previewDim} Preview</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pm-meta">
                                    <span className="meta-tag">{previewAd.platform}</span>
                                    <span className="meta-tag">{previewDim}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step4Review;
