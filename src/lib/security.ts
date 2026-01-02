import crypto from 'crypto';

/**
 * Generate HMAC-SHA256 signature for a payload
 * @param payload The data to sign (will be JSON stringified)
 * @param secretKey The secret key used for signing
 * @returns The hex string of the signature
 */
export function generateSignature(payload: any, secretKey: string): string {
    // Sort keys to ensure consistent order
    const sortedKeys = Object.keys(payload).sort();
    const sortedPayload: any = {};
    sortedKeys.forEach(key => {
        // Skip signature field if present in payload to avoid circular dependency
        if (key !== 'signature') {
            sortedPayload[key] = payload[key];
        }
    });

    const data = JSON.stringify(sortedPayload);
    return crypto.createHmac('sha256', secretKey).update(data).digest('hex');
}

/**
 * Verify if the provided signature matches the payload
 * @param payload The data to verify
 * @param signature The signature to verify against
 * @param secretKey The secret key
 * @returns true if valid, false otherwise
 */
export function verifySignature(payload: any, signature: string, secretKey: string): boolean {
    const expectedSignature = generateSignature(payload, secretKey);
    // Use timingSafeEqual to prevent timing attacks
    const a = Buffer.from(expectedSignature);
    const b = Buffer.from(signature);

    if (a.length !== b.length) return false;


    return crypto.timingSafeEqual(a, b);
}

/**
 * Verify Cloudflare Turnstile token
 * @param token The token to verify
 * @returns true if valid, false otherwise
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY || '1x00000000000000000000AA';
    if (!secretKey) {
        console.warn('TURNSTILE_SECRET_KEY is not set, skipping verification');
        return true; // Fail open if key is missing to avoid blocking users during setup
    }

    try {
        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', token);

        const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });

        const result = await res.json();
        return result.success;
    } catch (error) {
        console.error('Turnstile verification failed:', error);
        return false;
    }
}
