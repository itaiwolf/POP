import React, { useState, useEffect } from 'react';
import { Moon, Sun, ChevronDown } from 'lucide-react';
import './TopBar.css';

const TopBar = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [isDark]);

    return (
        <header className="topbar">
            <div className="workspace-selector">
                <span className="label">Workspace:</span>
                <button className="workspace-btn">
                    Gaming Studio A
                    <ChevronDown size={14} />
                </button>
            </div>

            <div className="topbar-actions">
                <button
                    className="theme-toggle"
                    onClick={() => setIsDark(!isDark)}
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );
};

export default TopBar;
