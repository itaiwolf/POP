import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileType, Check, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { extractMetadata } from '../../utils/creativeUtils';
import { useGame } from '../../context/GameContext';
import './UploadModal.css';

const UploadModal = ({ onClose }) => {
    const { addCreatives, creatives: existingCreatives } = useData();
    const { selectedGame } = useGame();
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [filesToProcess, setFilesToProcess] = useState([]);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFiles = (files) => {
        const fileList = Array.from(files);

        // Prevent Duplicates: name + size + lastModified
        const newUniqueFiles = fileList.filter(file => {
            const isDuplicate = existingCreatives.some(c =>
                c.name === (file.name.split('.').slice(0, -1).join('.') || file.name) &&
                c.size === file.size &&
                c.lastModified === file.lastModified
            );
            return !isDuplicate;
        });

        if (newUniqueFiles.length < fileList.length) {
            console.warn(`${fileList.length - newUniqueFiles.length} files were skipped as duplicates.`);
        }

        setFilesToProcess(prev => [...prev, ...newUniqueFiles]);
    };

    const onFileSelect = (e) => {
        if (e.target.files) handleFiles(e.target.files);
    };

    const processUpload = async () => {
        if (filesToProcess.length === 0) return;
        setUploading(true);

        try {
            const processed = await Promise.all(
                filesToProcess.map(async (file) => {
                    const meta = await extractMetadata(file);
                    return {
                        ...meta,
                        gameId: selectedGame.id,
                        owner: 'Itai User' // Mock logged in user
                    };
                })
            );

            addCreatives(processed);
            onClose();
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <header className="modal-header">
                    <h3>Upload Creatives</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </header>

                <div className="modal-content">
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={onFileSelect}
                        style={{ display: 'none' }}
                        accept="image/*,video/*"
                    />

                    <div
                        className={`drop-zone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                    >
                        {uploading ? (
                            <Loader2 size={48} className="drop-icon spin" />
                        ) : (
                            <UploadCloud size={48} className="drop-icon" />
                        )}
                        <p className="drop-text">
                            {uploading ? 'Processing files...' : 'Drag & drop files here, or click to browse'}
                        </p>
                        <p className="drop-subtext">Supports MP4, JPG, PNG</p>
                    </div>

                    {filesToProcess.length > 0 && (
                        <div className="files-preview-list">
                            <h4>Selected Files ({filesToProcess.length})</h4>
                            <div className="files-scroll">
                                {filesToProcess.map((f, i) => (
                                    <div key={i} className="file-preview-item">
                                        <FileType size={16} />
                                        <span className="f-name">{f.name}</span>
                                        <span className="f-size">{(f.size / 1024).toFixed(1)} KB</span>
                                        <button
                                            className="remove-file"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFilesToProcess(prev => prev.filter((_, idx) => idx !== i));
                                            }}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <footer className="modal-footer">
                    <button className="btn-text" onClick={onClose} disabled={uploading}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={processUpload}
                        disabled={uploading || filesToProcess.length === 0}
                    >
                        {uploading ? 'Uploading...' : 'Confirm Upload'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default UploadModal;

