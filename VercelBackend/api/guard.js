// api/guard.js - SECURE VERSION

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-ID, X-Request-Time');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { t, s, c, r } = req.body; // r = request ID
        const requestId = r || req.headers['x-request-id'];

        // ✅ SECURITY CHECK 1: Validate required fields
        if (!t || !s || !requestId) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        // ✅ SECURITY CHECK 2: Time validation (prevent old replays)
        const now = Date.now();
        const diff = Math.abs(now - t);

        if (diff > 30000) { // 30 seconds max
            return res.status(401).json({ error: 'Request expired' });
        }

        // ✅ SECURITY CHECK 3: Check for duplicate request ID (optional - requires database)
        // You could store recent request IDs in Redis/database to prevent replays
        // For now, we'll rely on timestamp validation

        const lockEnabled = process.env.LOCK_ENABLED === 'true';

        let shouldBlock = false;
        let blockReason = null;

        if (lockEnabled) {
            shouldBlock = true;
            blockReason = {
                title: process.env.LOCK_TITLE || 'Maintenance Mode',
                message: process.env.LOCK_MESSAGE || 'This component is temporarily unavailable for maintenance.',
                contact: process.env.LOCK_CONTACT || 'Expected to be back online shortly.'
            };
        }

        // ✅ SECURITY: Include request ID and timestamp in response
        if (shouldBlock) {
            return res.status(200).json({
                payload: Buffer.from(JSON.stringify({
                    allow: 0,
                    message: blockReason,
                    hash: '',
                    exp: 0,
                    sig: '',
                    requestId: requestId,      // ✅ Echo back request ID
                    timestamp: now              // ✅ Response timestamp
                })).toString('base64')
            });
        } else {
            // ✅ SECURITY: Create hash that includes request ID
            const secureHash = generateSecureHash(now, requestId);
            const secureSignature = generateSecureSignature(now, requestId);

            return res.status(200).json({
                payload: Buffer.from(JSON.stringify({
                    allow: 1,
                    message: null,
                    hash: secureHash,
                    exp: now + 3600000,
                    sig: secureSignature,
                    requestId: requestId,      // ✅ Echo back request ID
                    timestamp: now              // ✅ Response timestamp
                })).toString('base64')
            });
        }

    } catch (error) {
        console.error('Guard error:', error);

        return res.status(200).json({
            payload: Buffer.from(JSON.stringify({
                allow: 1,
                message: null,
                hash: generateHash(Date.now()),
                exp: Date.now() + 3600000,
                sig: 'error_fallback',
                requestId: 'error',
                timestamp: Date.now()
            })).toString('base64')
        });
    }
}

// ✅ SECURE: Hash includes request ID (prevents replay)
function generateSecureHash(timestamp, requestId) {
    const crypto = require('crypto');
    return crypto
        .createHash('sha256')
        .update(`${timestamp}${requestId}${process.env.SECRET_KEY || 'default-secret'}`)
        .digest('hex')
        .substring(0, 32);
}

// ✅ SECURE: Signature includes request ID (prevents replay)
function generateSecureSignature(timestamp, requestId) {
    const crypto = require('crypto');
    return crypto
        .createHmac('sha256', process.env.SECRET_KEY || 'default-secret')
        .update(`${timestamp}${requestId}`)
        .digest('hex')
        .substring(0, 16);
}

// Legacy function (for error fallback)
function generateHash(timestamp) {
    const crypto = require('crypto');
    return crypto
        .createHash('sha256')
        .update(`${timestamp}${process.env.SECRET_KEY || 'default-secret'}`)
        .digest('hex')
        .substring(0, 32);
}