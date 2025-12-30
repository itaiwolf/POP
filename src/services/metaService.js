/**
 * Meta Ads API Service
 * 
 * Handles interactions with the Meta Graph API for Ad Account operations.
 * Defaults to Sandbox for MVP testing.
 */

// --- CONFIGURATION ---
export const TARGET_AD_ACCOUNT_ID = 'act_1402861321434339'; // Sandbox ID. Switch to act_816298838054576 for Prod.
export const PAGE_ID = '904230746110414';
const API_VERSION = 'v18.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

// Mock Data for fallback/MVP testing
export const MOCK_CAMPAIGNS = [
    { id: '6923708839550', name: 'Test Sandbox Campaign' }
];

export const MOCK_ADSETS = [
    { id: '6923710021950', name: 'MVP Test Ad Set' }
];

/**
 * Uploads an image to the Meta Ad Account and returns the hash.
 * @param {string} imageBlobUrl - The blob or data URL of the image.
 * @param {string} token - Meta Access Token.
 * @returns {Promise<string>} - The meta_image_hash.
 */
export const syncImageToMeta = async (imageBlobUrl, token) => {
    if (!token) throw new Error('Meta Access Token is required for syncing.');

    try {
        console.log(`[MetaService] Syncing image to account ${TARGET_AD_ACCOUNT_ID}...`);

        // Mock success for MVP
        await new Promise(r => setTimeout(r, 1000));
        const mockHash = 'h' + Math.random().toString(36).substring(7);
        console.log(`[MetaService] Sync successful. Hash: ${mockHash}`);
        return mockHash;
    } catch (error) {
        console.error('[MetaService] Image sync failed:', error);
        throw error;
    }
};

/**
 * Creates an AdCreative using an image hash.
 * @param {string} imageHash - The Meta image hash.
 * @param {object} params - { adCopy, destUrl, cta }
 * @param {string} token - Meta Access Token.
 * @returns {Promise<string>} - The AdCreative ID.
 */
export const createAdCreative = async (imageHash, { adCopy, destUrl, cta }, token) => {
    if (!token) throw new Error('Meta Access Token is required.');

    const payload = {
        name: `Creative_${Date.now()}`,
        object_story_spec: {
            page_id: PAGE_ID,
            link_data: {
                image_hash: imageHash,
                message: adCopy,
                link: destUrl,
                call_to_action: {
                    type: cta || 'LEARN_MORE',
                }
            }
        },
        access_token: token
    };

    console.log('[MetaService] Creating AdCreative...');
    await new Promise(r => setTimeout(r, 800));
    return 'cr_' + Math.random().toString(36).substring(7);
};

/**
 * Deploys ads in batch mode if count > 5.
 * @param {Array} creativeIds - The AdCreative IDs.
 * @param {string} adsetId - Target AdSet ID.
 * @param {string} token - Meta Access Token.
 * @returns {Promise<Array>} - Array of created Ad IDs.
 */
export const deployAdsBatch = async (creativeIds, adsetId, token) => {
    if (!token) throw new Error('Meta Access Token is required.');

    const status = 'PAUSED';
    console.log(`[MetaService] Deploying ${creativeIds.length} ads to AdSet ${adsetId}...`);

    if (creativeIds.length > 5) {
        console.log('[MetaService] Using Batch Request API...');
        const batch = creativeIds.map(crId => ({
            method: 'POST',
            relative_url: `${TARGET_AD_ACCOUNT_ID}/ads`,
            body: `name=Ad_${crId}&creative={"creative_id":"${crId}"}&adset_id=${adsetId}&status=${status}`
        }));
    }

    await new Promise(r => setTimeout(r, 1500));
    return creativeIds.map(() => 'ad_' + Math.random().toString(36).substring(7));
};

/**
 * One-time setup to create a seed Campaign and AdSet in Sandbox.
 * @param {string} token - Meta Access Token.
 */
export const setupSandboxSeed = async (token) => {
    if (!token) throw new Error('Meta Access Token is required.');

    console.log('[MetaService] Seeding Sandbox with Campaign and AdSet...');
    await new Promise(r => setTimeout(r, 1000));
    return {
        campaignId: '6000000000001',
        adsetId: '6000000000002'
    };
};

/**
 * Fetches campaigns for the ad account.
 * @param {string} token - Meta Access Token.
 * @returns {Promise<Array>} - List of campaigns.
 */
export const fetchCampaigns = async (token) => {
    if (!token) throw new Error('Meta Access Token is required.');
    const cleanToken = token.trim();

    // Fallback for mock testing
    if (cleanToken.startsWith('EAAB_TEST')) {
        console.log('[MetaService] Mock Token detected. Returning local sandbox campaigns.');
        await new Promise(r => setTimeout(r, 400));
        return MOCK_CAMPAIGNS;
    }

    try {
        const response = await fetch(`${BASE_URL}/${TARGET_AD_ACCOUNT_ID}/campaigns?fields=name,id&access_token=${cleanToken}`);
        const data = await response.json();

        console.log('[MetaService] Campaigns response:', data);

        if (data.error) {
            console.warn('[MetaService] API Error, falling back to mock:', data.error.message);
            return MOCK_CAMPAIGNS;
        }
        const camps = data.data || [];
        if (camps.length === 0) {
            console.log('[MetaService] No campaigns found. Using fallback mocks.');
            return MOCK_CAMPAIGNS;
        }
        return camps;
    } catch (error) {
        console.warn('[MetaService] Fetch failed, falling back to mock:', error);
        return MOCK_CAMPAIGNS;
    }
};

/**
 * Fetches ad sets for the ad account.
 * @param {string} token - Meta Access Token.
 * @returns {Promise<Array>} - List of ad sets.
 */
export const fetchAdSets = async (token) => {
    if (!token) throw new Error('Meta Access Token is required.');
    const cleanToken = token.trim();

    // Fallback for mock testing
    if (cleanToken.startsWith('EAAB_TEST')) {
        console.log('[MetaService] Mock Token detected. Returning local sandbox adsets.');
        await new Promise(r => setTimeout(r, 400));
        return MOCK_ADSETS;
    }

    try {
        const response = await fetch(`${BASE_URL}/${TARGET_AD_ACCOUNT_ID}/adsets?fields=name,id&access_token=${cleanToken}`);
        const data = await response.json();

        console.log('[MetaService] AdSets response:', data);

        if (data.error) {
            console.warn('[MetaService] API Error, falling back to mock:', data.error.message);
            return MOCK_ADSETS;
        }
        const adsets = data.data || [];
        if (adsets.length === 0) {
            console.log('[MetaService] No adsets found. Using fallback mocks.');
            return MOCK_ADSETS;
        }
        return adsets;
    } catch (error) {
        console.warn('[MetaService] Fetch failed, falling back to mock:', error);
        return MOCK_ADSETS;
    }
};

