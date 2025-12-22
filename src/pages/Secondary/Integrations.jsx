import React from 'react';
import { Check, Plus } from 'lucide-react';
import './Secondary.css';

const Integrations = () => {
    const platforms = [
        { name: 'Meta Ads', connected: true, account: 'Pop! BM', id: '123456' },
        { name: 'TikTok Ads', connected: true, account: 'Pop! TikTok', id: '987654' },
        { name: 'Google Ads', connected: true, account: 'Pop! Google MCC', id: '456789' },
        { name: 'Unity Ads', connected: false },
        { name: 'AppLovin', connected: false },
        { name: 'GitHub', connected: false },
    ];

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
                                <button className="btn-secondary sm">Configure</button>
                            </div>
                        ) : (
                            <div className="int-details">
                                <p className="text-muted">Connect your account to publish ads.</p>
                                <button className="btn-primary sm">Connect</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Integrations;
