import React from 'react';
import { Facebook, Smartphone, AlertTriangle, CheckCircle, SmartphoneNfc } from 'lucide-react';
import { checkCompatibility, PlatformIcon } from '../../utils/creativeUtils';

const Step2Platforms = ({ selectedPlatforms, setSelectedPlatforms, selectedCreativesInfo }) => {

    const platforms = [
        { id: 'meta', name: 'Meta Ads', icon: 'meta', req: '1:1, 9:16 Images/Video' },
        { id: 'tiktok', name: 'TikTok', icon: 'tiktok', req: '9:16 Video only' },
        { id: 'google', name: 'Google Ads', icon: 'google', req: '1.91:1, 1:1, 4:5' },
        { id: 'applovin', name: 'AppLovin', icon: 'applovin', req: 'Playables, Video' },
        { id: 'unity', name: 'Unity Ads', icon: 'unity', req: 'Video, Playables' },
    ];

    const togglePlatform = (id) => {
        if (selectedPlatforms.includes(id)) {
            setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
        } else {
            setSelectedPlatforms([...selectedPlatforms, id]);
        }
    };

    // Real Validation Logic
    const getIssues = () => {
        const issues = [];
        selectedPlatforms.forEach(pId => {
            const platform = platforms.find(p => p.id === pId);
            // Check all selected creatives against this platform
            // A creative is "compatible" if at least one of its selected dimensions works for this platform?
            // Wait, selectedCreativesInfo contains the full object, but doesn't know *which* dimension was selected?
            // Actually, Step 2 props `selectedCreativesInfo` are the FULL creative objects.
            // But we technically don't know the exact *selected dimension* here unless we pass it.
            // However, let's assume if the creative has ANY compatible dimension, it's fine.
            // OR strictly: check if the creative has *NO* compatible dimensions.

            // Refined Logic based on Step 1: 
            // `selectedCreatives` passed to Step 2 (in Wizard parent) is just the info based on IDs.
            // We'll iterate the creatives and check if they have meaningful overlap.

            const incompatibleCreatives = selectedCreativesInfo.filter(c => {
                // Check if ANY of the creative's dimensions work for this platform
                const hasCompat = c.dimensions.some(dim => checkCompatibility(dim, pId));
                return !hasCompat;
            });

            if (incompatibleCreatives.length > 0) {
                issues.push({
                    id: pId,
                    platform: platform.name,
                    msg: `${incompatibleCreatives.length} creatives incompatible with ${platform.name}`,
                    count: incompatibleCreatives.length
                });
            }
        });
        return issues;
    };

    const issues = getIssues();

    const handleAutoFilter = (platformId) => {
        // Remove the incompatible platform
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformId));
    };

    return (
        <div className="step-container">
            <div className="step-main">
                <h2 className="step-title">Choose Ad Platforms</h2>
                <div className="platforms-grid">
                    {platforms.map(p => {
                        const isSelected = selectedPlatforms.includes(p.id);
                        return (
                            <div
                                key={p.id}
                                className={`platform-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => togglePlatform(p.id)}
                            >
                                <div className="p-card-header">
                                    <div className="p-icon-lg">
                                        <PlatformIcon p={p.icon} size={28} />
                                    </div>
                                    {isSelected && <CheckCircle size={20} className="check-icon" />}
                                </div>
                                <span className="p-name">{p.name}</span>
                                <span className="p-req">{p.req}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <aside className="validation-panel">
                <h3>Compatibility Check</h3>
                {selectedPlatforms.length === 0 && <p className="empty-text">Select a platform to check compatibility.</p>}

                {issues.length > 0 ? (
                    <div className="issues-list">
                        {issues.map((issue, idx) => (
                            <div key={idx} className="issue-card warning">
                                <div className="issue-header">
                                    <AlertTriangle size={16} />
                                    <span>{issue.platform} Issue</span>
                                </div>
                                <p>{issue.msg}</p>
                                <button className="encourage-btn" onClick={() => handleAutoFilter(issue.id)}>
                                    Auto-filter (Remove {issue.platform})
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    selectedPlatforms.length > 0 && (
                        <div className="success-state">
                            <CheckCircle size={32} color="var(--success)" />
                            <p>All selected creatives are compatible!</p>
                        </div>
                    )
                )}
            </aside>
        </div>
    );
};

export default Step2Platforms;
