import React from 'react';
import { UserPlus, Mail, Shield } from 'lucide-react';
import './Secondary.css';

const Settings = () => {
    const users = [
        { id: 1, name: 'Itai User', email: 'itai@pop.com', role: 'Admin' },
        { id: 2, name: 'Sarah Designer', email: 'sarah@pop.com', role: 'Editor' },
        { id: 3, name: 'Mike Analyst', email: 'mike@pop.com', role: 'Viewer' },
    ];

    return (
        <div className="page-container">
            <div className="settings-layout">
                <aside className="settings-nav">
                    <a href="#" className="active">Team & Roles</a>
                    <a href="#">Billing</a>
                    <a href="#">General</a>
                    <a href="#">API Keys</a>
                </aside>

                <main className="settings-content">
                    <div className="section-header">
                        <h2>Team Members</h2>
                        <button className="btn-primary"><UserPlus size={16} /> Invite Member</button>
                    </div>

                    <div className="members-list">
                        {users.map(u => (
                            <div key={u.id} className="member-row">
                                <div className="member-info">
                                    <div className="avatar sm">{u.name.charAt(0)}</div>
                                    <div className="details">
                                        <span className="name">{u.name}</span>
                                        <span className="email">{u.email}</span>
                                    </div>
                                </div>
                                <div className="member-role">
                                    <select defaultValue={u.role}>
                                        <option>Admin</option>
                                        <option>Editor</option>
                                        <option>Viewer</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="section-header mt-8">
                        <h2>Workspace General</h2>
                    </div>
                    <div className="form-settings">
                        <div className="form-group">
                            <label>Workspace Name</label>
                            <input type="text" defaultValue="Gaming Studio A" />
                        </div>
                        <button className="btn-secondary fit-w">Save Changes</button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;
