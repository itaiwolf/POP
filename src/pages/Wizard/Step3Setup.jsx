import React, { useState, useEffect } from 'react';
import './Step3Styles.css';

const Step3Setup = ({ selectedPlatforms = [], onValidationChange }) => {
    // Default to first selected platform or empty string
    const [activeTab, setActiveTab] = useState(selectedPlatforms[0] || '');
    const [formData, setFormData] = useState({});

    // Mock data
    const existingCampaigns = [
        { id: 'c1', name: 'User Acquisition Q4' },
        { id: 'c2', name: 'Retargeting Nov' },
    ];

    const existingAdSets = [
        { id: 'as1', name: 'US_Males_18-34_Int' },
        { id: 'as2', name: 'WW_Broad_Android' },
        { id: 'as3', name: 'T1_iOS_HighLTV' },
    ];

    // Auto-name helper
    const getAutoName = (campName) => {
        const date = new Date().toLocaleDateString('en-CA');
        const safeCamp = campName || '{Campaign}';
        return `${safeCamp}_${date}_{Creative}`;
    };

    // Validation Effect
    useEffect(() => {
        if (!onValidationChange) return;

        // If no platforms selected, validity is ambiguous, but technically Step 2 handles selection.
        if (selectedPlatforms.length === 0) {
            onValidationChange(true);
            return;
        }

        const isValid = selectedPlatforms.every(p => {
            const data = formData[p] || {};

            const campMode = data.campaignMode || 'existing';
            const hasCamp = campMode === 'new' ? !!data.campaignName : !!data.campaignId;

            const adSetMode = data.adSetMode || 'existing';
            const hasAdSet = adSetMode === 'new' ? !!data.adSetName : !!data.existingAdSetId;

            const hasNaming = !!data.naming;

            return hasCamp && hasAdSet && hasNaming;
        });

        onValidationChange(isValid);
    }, [formData, selectedPlatforms, onValidationChange]);

    const handleChange = (platform, field, value) => {
        setFormData(prev => {
            const pData = prev[platform] || {};
            return {
                ...prev,
                [platform]: { ...pData, [field]: value }
            };
        });
    };

    // Render Helpers
    const renderCampaignSection = (platform) => {
        const data = formData[platform] || {};
        const mode = data.campaignMode || 'existing';

        const handleCampaignChange = (val, isId) => {
            // Update Campaign Field
            handleChange(platform, isId ? 'campaignId' : 'campaignName', val);

            // Auto-fill Naming
            let cName = val;
            if (isId) {
                const c = existingCampaigns.find(ec => ec.id === val);
                cName = c ? c.name : '';
            }
            if (!data.naming || data.naming.includes('{Campaign}')) {
                handleChange(platform, 'naming', getAutoName(cName));
            }
        };

        return (
            <div className="form-group">
                <label className="input-label">Campaign</label>
                <div className="radio-toggle-group">
                    <label className={`toggle-btn ${mode === 'existing' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            checked={mode === 'existing'}
                            onChange={() => handleChange(platform, 'campaignMode', 'existing')}
                        />
                        Use Existing
                    </label>
                    <label className={`toggle-btn ${mode === 'new' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            checked={mode === 'new'}
                            onChange={() => handleChange(platform, 'campaignMode', 'new')}
                        />
                        Create New
                    </label>
                </div>

                {mode === 'new' ? (
                    <input
                        type="text"
                        className="text-input"
                        placeholder="Enter new Campaign name..."
                        value={data.campaignName || ''}
                        onChange={(e) => handleCampaignChange(e.target.value, false)}
                    />
                ) : (
                    <select
                        className="select-input"
                        value={data.campaignId || ''}
                        onChange={(e) => handleCampaignChange(e.target.value, true)}
                    >
                        <option value="">Select Campaign...</option>
                        {existingCampaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                )}
            </div>
        );
    };

    const renderAdSetSection = (platform) => {
        const data = formData[platform] || {};
        const mode = data.adSetMode || 'existing';

        return (
            <div className="form-group">
                <label className="input-label">Ad Set / Ad Group</label>
                <div className="radio-toggle-group">
                    <label className={`toggle-btn ${mode === 'existing' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            checked={mode === 'existing'}
                            onChange={() => handleChange(platform, 'adSetMode', 'existing')}
                        />
                        Use Existing
                    </label>
                    <label className={`toggle-btn ${mode === 'new' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            checked={mode === 'new'}
                            onChange={() => handleChange(platform, 'adSetMode', 'new')}
                        />
                        Create New
                    </label>
                </div>

                {mode === 'new' ? (
                    <input
                        type="text"
                        className="text-input"
                        placeholder="Enter new Ad Set name..."
                        value={data.adSetName || ''}
                        onChange={(e) => handleChange(platform, 'adSetName', e.target.value)}
                    />
                ) : (
                    <select
                        className="select-input"
                        value={data.existingAdSetId || ''}
                        onChange={(e) => handleChange(platform, 'existingAdSetId', e.target.value)}
                    >
                        <option value="">Select an Ad Set...</option>
                        {existingAdSets.map(as => (
                            <option key={as.id} value={as.id}>{as.name}</option>
                        ))}
                    </select>
                )}
            </div>
        );
    };

    if (selectedPlatforms.length === 0) return <div>No platforms selected</div>;

    const currentPlatformData = formData[activeTab] || {};

    return (
        <div className="step-container">
            <div className="tabs-sidebar">
                {selectedPlatforms.map(p => (
                    <button
                        key={p}
                        className={`tab-btn ${activeTab === p ? 'active' : ''} ${p}`}
                        onClick={() => setActiveTab(p)}
                    >
                        <span className={`p-icon-sm ${p}`}></span>
                        {p}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                <div className="setup-form fade-in" key={activeTab}>
                    <div className="form-section">
                        <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Configuration</h3>

                        <div className="form-group">
                            <label className="input-label">Account</label>
                            <div className="account-row">
                                <select className="select-input" style={{ width: '320px' }}>
                                    <option>Pop! Studios (Default)</option>
                                    <option>Pop! Second Account</option>
                                </select>
                                <button className="btn-text-link">+ Link New</button>
                            </div>
                        </div>

                        {renderCampaignSection(activeTab)}
                        {renderAdSetSection(activeTab)}

                        <div className="form-group">
                            <label className="input-label">Naming Convention</label>
                            <input
                                type="text"
                                className="text-input"
                                placeholder="{Campaign}_{Date}_{Creative}"
                                value={currentPlatformData.naming || ''}
                                onChange={(e) => handleChange(activeTab, 'naming', e.target.value)}
                            />
                            <span className="input-hint">Use dynamic tags to auto-name your ads.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step3Setup;
