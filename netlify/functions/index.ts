import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
    const origin = `https://${event.headers.host}`;
    return {
        statusCode: 302,
        headers: {
            'Location': `https://searchgal.homes?api=${encodeURIComponent(origin)}`
        }
    };
};
