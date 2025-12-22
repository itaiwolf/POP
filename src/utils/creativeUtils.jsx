import React from 'react';
import { Globe, Smartphone, Gamepad2, Facebook } from 'lucide-react';

export const getCompatiblePlatforms = (dimensions) => {
    const map = {
        '9:16': ['meta', 'tiktok', 'unity', 'applovin', 'google'],
        '1:1': ['meta', 'google', 'applovin', 'unity'],
        '4:5': ['meta', 'google'],
        '16:9': ['meta', 'google', 'unity', 'applovin'],
        'HTML5': ['applovin', 'unity'],
    };

    // If input is validation check for a specific dimension vs platform
    // usage: checkCompatibility('9:16', 'meta') -> true

    const platforms = new Set();
    dimensions.forEach(dim => {
        if (map[dim]) {
            map[dim].forEach(p => platforms.add(p));
        }
    });
    return Array.from(platforms);
};

export const checkCompatibility = (dimension, platform) => {
    const map = {
        '9:16': ['meta', 'tiktok', 'unity', 'applovin', 'google'],
        '1:1': ['meta', 'google', 'applovin', 'unity'],
        '4:5': ['meta', 'google'],
        '16:9': ['meta', 'google', 'unity', 'applovin'],
        'HTML5': ['applovin', 'unity'],
    };
    const allowed = map[dimension] || [];
    return allowed.includes(platform.toLowerCase());
};

export const PlatformIcon = ({ p, size = 14, className = '' }) => {
    const s = size;
    const cn = `p-icon ${p} ${className}`;
    if (p === 'meta') return <Facebook size={s} className={cn} />;
    if (p === 'tiktok') return <Smartphone size={s} className={cn} />;
    if (p === 'google') return <Globe size={s} className={cn} />;
    if (p === 'unity') return <Gamepad2 size={s} className={cn} />;
    if (p === 'applovin') return <Smartphone size={s} className={cn} />;
    return <div className={`p-dot ${p}`} />;
};

// Standard ratios that platforms expect
export const STANDARD_RATIOS = [
    { label: '9:16', value: 9 / 16, platforms: ['meta', 'tiktok', 'google'] },
    { label: '1:1', value: 1 / 1, platforms: ['meta', 'tiktok', 'google'] },
    { label: '4:5', value: 4 / 5, platforms: ['meta', 'google'] },
    { label: '16:9', value: 16 / 9, platforms: ['google', 'meta', 'tiktok'] },
    { label: '3:4', value: 3 / 4, platforms: ['meta', 'tiktok'] },
    { label: '2:3', value: 2 / 3, platforms: ['meta'] },
    { label: '1.91:1', value: 1.91 / 1, platforms: ['meta', 'google'] },
];

export const getAspectRatio = (width, height) => {
    if (typeof width === 'string' && height === undefined) {
        return width.replace(':', ' / ');
    }
    const ratio = width / height;
    if (isNaN(ratio)) return '1 / 1';

    // Snap to nearest standard ratio if within 5%
    const nearest = STANDARD_RATIOS.find(r => Math.abs(ratio - r.value) / r.value < 0.05);
    if (nearest) return nearest.label.replace(':', ' / ');
    return `${width} / ${height}`;
};

export const getAspectRatioStyle = (dim) => {
    return { aspectRatio: getAspectRatio(dim) };
};

export const getSuggestedPlatforms = (type, width, height) => {
    const ratio = width / height;
    const nearest = STANDARD_RATIOS.find(r => Math.abs(ratio - r.value) / r.value < 0.05);
    return nearest ? nearest.platforms : [];
};

export const extractMetadata = async (file) => {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : 'other');
        const name = file.name.split('.').slice(0, -1).join('.') || `Creative_${Date.now()}`;
        const date = new Date(file.lastModified).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

        if (type === 'image') {
            const img = new Image();
            img.onload = () => {
                const dim = getAspectRatio(img.width, img.height).replace(' / ', ':');
                resolve({
                    id: Math.random().toString(36).substr(2, 9),
                    name, type, dimensions: [dim],
                    platforms: getSuggestedPlatforms(type, img.width, img.height),
                    owner: 'Me', date, thumb: url, size: file.size, lastModified: file.lastModified
                });
            };
            img.onerror = () => resolve({ id: Math.random().toString(36).substr(2, 9), name, type: 'other', dimensions: ['Unknown'], date, owner: 'Me', thumb: '' });
            img.src = url;
        } else if (type === 'video') {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = url;
            video.muted = true;
            video.playsInline = true;

            video.onloadedmetadata = () => { video.currentTime = 1; };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                const thumb = canvas.toDataURL('image/jpeg');
                const dim = getAspectRatio(video.videoWidth, video.videoHeight).replace(' / ', ':');
                const platforms = getSuggestedPlatforms(type, video.videoWidth, video.videoHeight);

                resolve({
                    id: Math.random().toString(36).substr(2, 9),
                    name, type, dimensions: [dim], platforms,
                    owner: 'Me', date, thumb, size: file.size, lastModified: file.lastModified
                });
            };
            video.onerror = () => resolve({ id: Math.random().toString(36).substr(2, 9), name, type: 'other', dimensions: ['Unknown'], date, owner: 'Me', thumb: '' });
        } else {
            resolve({
                id: Math.random().toString(36).substr(2, 9),
                name, type: 'other', dimensions: ['Unknown'], platforms: [],
                owner: 'Me', date, thumb: '', size: file.size, lastModified: file.lastModified
            });
        }
    });
};

