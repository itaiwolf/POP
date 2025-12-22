import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useGame } from '../../context/GameContext';

const Step5Status = ({ selectedPlatforms, selectedCreatives, allCreatives }) => {
    const { selectedGame } = useGame();
    const { addHistoryItem, markAsUploaded } = useData();
    const [jobs, setJobs] = useState([]);
    const [hasProcessed, setHasProcessed] = useState(false);

    // Initial Job Creation
    useEffect(() => {
        // Calculate number of "Items" per platform
        // selectedCreatives is list of "id-dim".
        // For simple job count, let's just use number of unique creatives selected
        const uniqueCreativesIds = [...new Set(selectedCreatives.map(s => s.split('-')[0]))];

        const initialJobs = selectedPlatforms.map(p => ({
            id: p,
            platform: p.charAt(0).toUpperCase() + p.slice(1),
            items: uniqueCreativesIds.length,
            status: 'queued',
            error: null
        }));

        setJobs(initialJobs);
    }, [selectedPlatforms, selectedCreatives]);

    // Processing Simulation
    useEffect(() => {
        if (jobs.length === 0 || hasProcessed) return;

        const timers = [];

        jobs.forEach((job, index) => {
            // Start delays staggered
            const startDelay = (index + 1) * 800;
            const duration = 2000 + Math.random() * 2000;

            // Start Job
            timers.push(setTimeout(() => {
                updateJobStatus(job.id, 'in-progress');
            }, startDelay));

            // Finish Job
            timers.push(setTimeout(() => {
                // FORCE SUCCESS for TikTok (and everything else) as requested
                const isSuccess = true;

                if (isSuccess) {
                    updateJobStatus(job.id, 'success');

                    // Add to REAL Global History
                    addHistoryItem({
                        id: Date.now() + Math.random(),
                        gameId: selectedGame.id, // Save Game ID for filtering
                        platform: job.platform,
                        campaign: 'New Campaign', // Mock logic
                        status: 'Success',
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        creatives: job.items
                    });

                    // Mark Creatives as Uploaded
                    const uniqueCreativesIds = [...new Set(selectedCreatives.map(s => s.split('-')[0]))];
                    uniqueCreativesIds.forEach(cId => {
                        markAsUploaded(parseInt(cId), job.id); // job.id is platformId (e.g. 'tiktok')
                    });

                } else {
                    updateJobStatus(job.id, 'failed', 'Network Error');
                }

            }, startDelay + duration));
        });

        // Cleanup function not strictly needed for this one-off logic but good practice
        // We set a flag to avoid re-running if component re-renders
        setHasProcessed(true);

    }, [jobs, hasProcessed, addHistoryItem, markAsUploaded, selectedCreatives]);

    const updateJobStatus = (id, status, error = null) => {
        setJobs(prev => prev.map(j => j.id === id ? { ...j, status, error } : j));
    };

    const allFinished = jobs.length > 0 && jobs.every(j => j.status === 'success' || j.status === 'failed');

    return (
        <div className="status-page">
            <div className="status-header">
                <h2 className="step-title">Publishing Status</h2>
                <p>Your campaigns are being pushed to the ad networks.</p>
            </div>

            <div className="jobs-list">
                {jobs.map(job => (
                    <div key={job.id} className="job-card">
                        <div className="job-info">
                            <span className="job-plat">{job.platform}</span>
                            <span className="job-count">{job.items} ads</span>
                        </div>
                        <div className="job-status">
                            {job.status === 'queued' && <span className="s-badge queued">Queued</span>}
                            {job.status === 'in-progress' && (
                                <span className="s-badge progress">
                                    <Loader2 size={14} className="spin" /> Processing
                                </span>
                            )}
                            {job.status === 'success' && (
                                <span className="s-badge success">
                                    <CheckCircle size={14} /> Published
                                </span>
                            )}
                            {job.status === 'failed' && (
                                <span className="s-badge failed">
                                    <XCircle size={14} /> Failed
                                </span>
                            )}
                        </div>
                        {job.error && <p className="job-error">{job.error}</p>}
                    </div>
                ))}
            </div>

            {allFinished && (
                <div className="finish-actions fade-in">
                    <NavLink to="/history" className="btn-primary">View Publish History</NavLink>
                    <NavLink to="/" className="btn-secondary">Back to Dashboard</NavLink>
                </div>
            )}
        </div>
    );
};

export default Step5Status;
