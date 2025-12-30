import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useGame } from '../../context/GameContext';
import { createAdCreative, deployAdsBatch } from '../../services/metaService';

const Step5Status = ({ selectedPlatforms, selectedCreatives, allCreatives }) => {
    const { selectedGame } = useGame();
    const { addHistoryItem, markAsUploaded, metaToken } = useData();
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
            timers.push(setTimeout(async () => {
                if (job.id === 'meta') {
                    try {
                        // Meta Specific Flow
                        const uniqueCreativesIds = [...new Set(selectedCreatives.map(s => s.split('-')[0]))];
                        const metaCreatives = allCreatives.filter(c => uniqueCreativesIds.includes(c.id.toString()));

                        // 1. Create AdCreatives (simplified for MVP)
                        const adCreativeIds = await Promise.all(
                            metaCreatives.map(c => createAdCreative(c.metaImageHash || 'mock_hash', {
                                adCopy: 'Check out our new game!',
                                destUrl: 'https://pop.studios/play',
                                cta: 'LEARN_MORE'
                            }, metaToken))
                        );

                        // 2. Batch Deploy Ads
                        const adIds = await deployAdsBatch(adCreativeIds, 'sandbox_adset_id', metaToken);

                        updateJobStatus('meta', 'success');

                        // 3. Log to History
                        addHistoryItem({
                            id: Date.now() + Math.random(),
                            gameId: selectedGame.id,
                            platform: 'Meta Ads',
                            campaign: 'Meta Batch MVP',
                            status: 'Success',
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            creatives: uniqueCreativesIds.length,
                            adIds: adIds // Store the real IDs
                        });

                        uniqueCreativesIds.forEach(cId => markAsUploaded(parseInt(cId), 'meta'));

                    } catch (e) {
                        updateJobStatus('meta', 'failed', e.message);
                    }
                } else {
                    // Standard Simulation for other platforms
                    updateJobStatus(job.id, 'success');
                    addHistoryItem({
                        id: Date.now() + Math.random(),
                        gameId: selectedGame.id,
                        platform: job.platform,
                        campaign: 'New Campaign',
                        status: 'Success',
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        creatives: job.items
                    });

                    const uniqueCreativesIds = [...new Set(selectedCreatives.map(s => s.split('-')[0]))];
                    uniqueCreativesIds.forEach(cId => markAsUploaded(parseInt(cId), job.id));
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
