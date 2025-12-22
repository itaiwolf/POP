import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Step1Select from './Step1Select';
import Step2Platforms from './Step2Platforms';
import Step3Setup from './Step3Setup';
import Step4Review from './Step4Review';
import Step5Status from './Step5Status';
import { useGame } from '../../context/GameContext';
import { useData } from '../../context/DataContext';
import './Wizard.css';
import './Step1Styles.css';
import './Step4Styles.css';
import './Step5Styles.css';

import { useLocation } from 'react-router-dom';

const CreateAdsWizard = () => {
    const { selectedGame } = useGame();
    const { creatives: allCreatives } = useData();
    const location = useLocation();

    // Init from Navigation State (Draft/Bulk Action)
    const initialState = location.state || {};

    const [step, setStep] = useState(initialState.initialStep || 1);
    const [selectedCreatives, setSelectedCreatives] = useState(initialState.selectedCreatives || []);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [isStep3Valid, setIsStep3Valid] = useState(false);

    // Filter available creatives by selected game
    const gameCreatives = allCreatives.filter(c => c.gameId === selectedGame.id);

    // Determine if current step is valid
    const isNextDisabled = () => {
        if (step === 1) return selectedCreatives.length === 0;
        if (step === 2) return selectedPlatforms.length === 0;
        if (step === 3) return !isStep3Valid;
        return false;
    };

    const handleNext = () => {
        if (!isNextDisabled()) {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handlePublish = () => {
        setStep(5);
    };

    // Get selected creative objects (from full list)
    // Adjust logic: selectedCreatives is now list of "id-dim". We need the base creative objects for Step 2 logic?
    // Step 2 needs "selectedCreativesInfo" to check compatibility.
    // If "1-9:16" is selected, we include Creative 1 in the info list.
    const selectedCreativeIds = [...new Set(selectedCreatives.map(k => k.split('-')[0]))];
    const selectedCreativesInfo = allCreatives.filter(c => selectedCreativeIds.includes(c.id.toString()));

    const steps = [
        { num: 1, label: 'Select Creatives' },
        { num: 2, label: 'Choose Platforms' },
        { num: 3, label: 'Platform Setup' },
        { num: 4, label: 'Review' },
        { num: 5, label: 'Publish' },
    ];

    return (
        <div className="wizard-page">
            {/* ... Header ... */}
            <header className="wizard-header">
                <div>
                    <h1 className="page-title">Create New Campaign</h1>
                    <p className="page-subtitle">Game: <span className="highlight-text">{selectedGame.name}</span></p>
                </div>
                <div className="steps-indicator">
                    {steps.map(s => (
                        <div key={s.num} className={`step-item ${step >= s.num ? 'active' : ''} ${step === s.num ? 'current' : ''}`}>
                            <div className="step-circle">
                                {step > s.num ? <Check size={14} /> : s.num}
                            </div>
                            <span className="step-label">{s.label}</span>
                            {s.num < steps.length && <div className="step-line" />}
                        </div>
                    ))}
                </div>
            </header>

            <div className="wizard-content">
                {/* Navigation Toolbar (Top of Card) */}
                {step < 5 && (
                    <div className="wizard-toolbar-top" style={{ padding: '24px 24px 0 24px', marginBottom: '24px' }}>
                        <button
                            className="btn-secondary"
                            onClick={handleBack}
                            disabled={step === 1}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        {step < 4 ? (
                            <button
                                className="btn-primary"
                                onClick={handleNext}
                                disabled={isNextDisabled()}
                            >
                                Next Step <ArrowRight size={16} />
                            </button>
                        ) : (
                            <div></div>
                        )}
                    </div>
                )}

                {/* Render Steps */}
                {step === 1 && (
                    <Step1Select
                        allCreatives={gameCreatives}
                        selected={selectedCreatives}
                        setSelected={setSelectedCreatives}
                    />
                )}
                {step === 2 && (
                    <Step2Platforms
                        selectedPlatforms={selectedPlatforms}
                        setSelectedPlatforms={setSelectedPlatforms}
                        selectedCreativesInfo={selectedCreativesInfo}
                    />
                )}
                {step === 3 && (
                    <Step3Setup
                        selectedPlatforms={selectedPlatforms}
                        onValidationChange={setIsStep3Valid}
                    />
                )}
                {step === 4 && (
                    <Step4Review
                        selectedCreatives={selectedCreatives}
                        selectedPlatforms={selectedPlatforms}
                        allCreatives={allCreatives}
                        onPublish={handlePublish}
                    />
                )}
                {step === 5 && (
                    <Step5Status
                        selectedPlatforms={selectedPlatforms}
                        selectedCreatives={selectedCreatives}
                        allCreatives={allCreatives}
                    />
                )}
            </div>
        </div>
    );
};

export default CreateAdsWizard;
