import React from 'react';
import { Check, Plus, Database, RefreshCw, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { setupSandboxSeed, syncImageToMeta, TARGET_AD_ACCOUNT_ID } from '../../services/metaService';
import './Secondary.css';

const Integrations = () => {
    const { creatives, updateCreative, metaToken, setMetaToken } = useData();
    const [isSeeding, setIsSeeding] = React.useState(false);
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [syncProgress, setSyncProgress] = React.useState(null);
    const [showConnectModal, setShowConnectModal] = React.useState(false);
    const [tempToken, setTempToken] = React.useState('');

    const platforms = [
        { name: 'Meta Ads', connected: !!metaToken, account: metaToken ? 'Sandbox (Connected)' : 'Not Connected', id: TARGET_AD_ACCOUNT_ID },
        { name: 'TikTok Ads', connected: true, account: 'Pop! TikTok', id: '987654' },
        { name: 'Google Ads', connected: true, account: 'Pop! Google MCC', id: '456789' },
        { name: 'Unity Ads', connected: false },
        { name: 'AppLovin', connected: false },
        { name: 'GitHub', connected: false },
    ];

    const handleConnectMeta = () => {
        setMetaToken(tempToken);
        setShowConnectModal(false);
        setTempToken('');
    };

    const handleDisconnectMeta = () => {
        if (window.confirm('Are you sure you want to disconnect Meta?')) {
            setMetaToken('');
        }
    };

    const handleSetupSandbox = async () => {
        setIsSeeding(true);
        try {
            const result = await setupSandboxSeed(metaToken);
            alert(`Sandbox Seeded!\nCampaign: ${result.campaignId}\nAdSet: ${result.adsetId}`);
        } catch (e) {
            alert('Setup failed: ' + e.message);
        } finally {
            setIsSeeding(false);
        }
    };

    const handleSyncAssets = async () => {
        setIsSyncing(true);
        const imagesToSync = creatives.filter(c => c.type === 'image' && !c.metaImageHash);
        let count = 0;

        for (const img of imagesToSync) {
            setSyncProgress(`Syncing ${img.name}... (${count + 1}/${imagesToSync.length})`);
            try {
                const hash = await syncImageToMeta(img.thumb, metaToken);
                updateCreative(img.id, { metaImageHash: hash });
                count++;
            } catch (e) {
                console.error(`Failed to sync ${img.name}`, e);
            }
        }

        alert(`Sync complete! ${count} assets updated.`);
        setIsSyncing(false);
        setSyncProgress(null);
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <h1 className="page-title">Integrations</h1>
                <button className="btn-primary"><Plus size={16} /> Add Network</button>
            </header>

            <div className="integrations-grid">
                {platforms.map(p => (
                    <div key={p.name} className="int-card">
                        <div className="int-header">
                            <div className={`int-icon ${p.name.split(' ')[0].toLowerCase()}`}>
                                {p.name.charAt(0)}
                            </div>
                            {p.connected ? (
                                <span className="conn-status active"><Check size={12} /> Connected</span>
                            ) : (
                                <span className="conn-status">Not Connected</span>
                            )}
                        </div>
                        <h3>{p.name}</h3>
                        {p.connected ? (
                            <div className="int-details">
                                <p>Account: {p.account}</p>
                                <p className="mono-id">ID: {p.id}</p>

                                {p.name === 'Meta Ads' ? (
                                    <div className="meta-utils">
                                        <button
                                            className="btn-text-link"
                                            onClick={handleSetupSandbox}
                                            disabled={isSeeding || !metaToken}
                                        >
                                            <Database size={14} /> {isSeeding ? 'Seeding...' : 'Setup Sandbox'}
                                        </button>
                                        <button
                                            className="btn-text-link"
                                            onClick={handleSyncAssets}
                                            disabled={isSyncing || !metaToken}
                                        >
                                            <RefreshCw size={14} className={isSyncing ? 'spin' : ''} /> {isSyncing ? 'Syncing...' : 'Sync Assets'}
                                        </button>
                                        <button className="btn-text-link disconnect" onClick={handleDisconnectMeta}>
                                            Disconnect
                                        </button>
                                        {syncProgress && <div className="sync-status-msg">{syncProgress}</div>}
                                        {!metaToken && <div className="hint-text text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}><AlertCircle size={12} /> Connect account to enable tools.</div>}
                                    </div>
                                ) : (
                                    <button className="btn-secondary sm">Configure</button>
                                )}
                            </div>
                        ) : (
                            <div className="int-details">
                                <p className="text-muted">Connect your account to publish ads.</p>
                                <button
                                    className="btn-primary sm"
                                    onClick={() => p.name === 'Meta Ads' ? setShowConnectModal(true) : null}
                                >
                                    Connect
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Meta Connect Modal */}
            {showConnectModal && (
                <div className="modal-overlay" onClick={() => setShowConnectModal(false)}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Connect Meta Ad Account</h3>
                            <button className="close-btn" onClick={() => setShowConnectModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p className="description" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                                Enter your Meta User Access Token or System User Token to enable live deployments.
                            </p>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Access Token</label>
                                <input
                                    type="password"
                                    className="text-input"
                                    placeholder="EAAB..."
                                    value={tempToken}
                                    onChange={(e) => setTempToken(e.target.value)}
                                    style={{ width: '100%', padding: '10px' }}
                                />
                                <span className="input-hint" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    You can find this in the Meta App Dashboard or via Graph API Explorer.
                                </span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-close-btn" onClick={() => setShowConnectModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleConnectMeta} disabled={!tempToken}>Connect Account</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Integrations;
