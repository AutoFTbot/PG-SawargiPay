import { Pakasir as SawargiPaySDK, type PaymentMethod } from 'pakasir-sdk';

/**
 * Function to create a payment
 * @param amount Amount in IDR
 * @param orderId Unique order ID
 * @param config Merchant configuration (slug and apikey)
 * @param method Payment method (qris, bni_va, etc.)
 */
export async function createPayment(
    amount: number,
    orderId: string,
    config: { slug: string; apikey: string },
    method: string = 'qris'
): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
        const sawargipay = new SawargiPaySDK({
            slug: config.slug,
            apikey: config.apikey,
        });
        const result = await sawargipay.createPayment(method as PaymentMethod, orderId, amount);
        return { success: true, data: result };
    } catch (error: any) {
        console.error('SawargiPay Error:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
}

/**
 * Function to get payment details
 * @param orderId ID of the order
 * @param amount Amount of the order
 * @param config Merchant configuration (slug and apikey)
 */
export async function getPaymentDetail(
    orderId: string,
    amount: number,
    config: { slug: string; apikey: string }
): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
        const sawargipay = new SawargiPaySDK({
            slug: config.slug,
            apikey: config.apikey,
        });
        const result = await sawargipay.detailPayment(orderId, amount);
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message || 'Unknown error' };
    }
}
