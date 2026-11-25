import type { Handler } from '@netlify/functions';
import { buildRedirectResponse } from '../../src/redirect';

export const handler: Handler = async (event) => {
    const origin = `https://${event.headers.host}`;
    const response = buildRedirectResponse(origin);
    return {
        statusCode: response.status,
        headers: {
            'Location': response.headers.get('Location') || 'https://www.searchgal.top'
        }
    };
};
