import React, { useState, useEffect } from 'react';
import { PlatformIcon } from '../../utils/creativeUtils';
import { RefreshCw } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { fetchCampaigns, fetchAdSets, MOCK_CAMPAIGNS, MOCK_ADSETS } from '../../services/metaService';
import './Step3Styles.css';

const Step3Setup = ({ selectedPlatforms = [], onValidationChange }) => {
    const { metaToken } = useData();

    // Explicitly find the first valid platform to start with
    const [activeTab, setActiveTab] = useState(() => {
        if (selectedPlatforms.includes('meta')) return 'meta';
        return selectedPlatforms[0] || '';
    });

    const [formData, setFormData] = useState({});
    const [metaCampaigns, setMetaCampaigns] = useState(MOCK_CAMPAIGNS);
    const [metaAdSets, setMetaAdSets] = useState(MOCK_ADSETS);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    // Mock data for other platforms
    const mockCampaigns = [
        { id: 'c1', name: 'User Acquisition Q4' },
        { id: 'c2', name: 'Retargeting Nov' },
    ];

    const mockAdSets = [
        { id: 'as1', name: 'US_Males_18-34_Int' },
        { id: 'as2', name: 'WW_Broad_Android' },
        { id: 'as3', name: 'T1_iOS_HighLTV' },
    ];

    // Meta-specific fetching
    const loadMetaData = async (force = false) => {
        if (!metaToken && !force) return;

        setIsLoading(true);
        setFetchError(null);
        try {
            console.log('[Step3Setup] Fetching Meta data...');
            const [camps, adsets] = await Promise.all([
                fetchCampaigns(metaToken),
                fetchAdSets(metaToken)
            ]);

            // If they returned something, use it. Otherwise retain mocks.
            if (camps && camps.length > 0) setMetaCampaigns(camps);
            if (adsets && adsets.length > 0) setMetaAdSets(adsets);

            console.log('[Step3Setup] Fetch complete:', { camps: camps?.length, adsets: adsets?.length });
        } catch (e) {
            console.error('Failed to load Meta data:', e);
            setFetchError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'meta' && metaToken) {
            loadMetaData();
        }
    }, [activeTab, metaToken]);

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

        // Robust fallback: if meta state is empty, use the constant mocks directly
        let currentCampaigns = mockCampaigns;
        if (platform === 'meta') {
            currentCampaigns = (metaCampaigns && metaCampaigns.length > 0) ? metaCampaigns : MOCK_CAMPAIGNS;
        }

        const handleCampaignChange = (val, isId) => {
            // Update Campaign Field
            handleChange(platform, isId ? 'campaignId' : 'campaignName', val);

            // Auto-fill Naming
            let cName = val;
            if (isId) {
                const c = currentCampaigns.find(ec => ec.id === val);
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
                        <option value="">{isLoading ? 'Loading...' : 'Select Campaign...'}</option>
                        {currentCampaigns.map(c => (
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

        const handleAdSetChange = (val) => {
            handleChange(platform, 'existingAdSetId', val);
        };

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
                        onChange={(e) => handleAdSetChange(e.target.value)}
                    >
                        <option value="">{isLoading ? 'Loading...' : 'Select an Ad Set...'}</option>
                        {((platform === 'meta' && metaAdSets && metaAdSets.length > 0) ? metaAdSets : (platform === 'meta' ? MOCK_ADSETS : mockAdSets)).map(as => (
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
                        <PlatformIcon p={p} />
                        <span className="tab-label">{p.charAt(0).toUpperCase() + p.slice(1)}</span>
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

                        {activeTab === 'meta' && (
                            <div className="meta-sync-indicator">
                                {isLoading ? (
                                    <span className="sync-msg muted">Updating from Meta...</span>
                                ) : (
                                    <button className="btn-text-link sm" onClick={() => loadMetaData(true)}>
                                        <RefreshCw size={12} /> Refresh Meta Data
                                    </button>
                                )}
                                {fetchError && <span className="error-text">! Error: {fetchError} (Showing mocks)</span>}
                            </div>
                        )}

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
