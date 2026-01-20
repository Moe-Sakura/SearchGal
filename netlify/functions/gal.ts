import { Handler } from '@netlify/functions';
import { Readable } from 'stream';
import busboy from 'busboy';
import { handleSearchRequestStream, PLATFORMS_GAL } from '../../src/core';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// 解析 form-data
function parseFormData(event: any): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
        const fields: Record<string, string> = {};
        const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';

        const bb = busboy({ headers: { 'content-type': contentType } });

        bb.on('field', (name, val) => {
            fields[name] = val;
        });

        bb.on('finish', () => {
            resolve(fields);
        });

        bb.on('error', (err: Error) => {
            reject(err);
        });

        // 将 base64 编码的 body 转换为流
        if (event.body) {
            const bodyBuffer = event.isBase64Encoded
                ? Buffer.from(event.body, 'base64')
                : Buffer.from(event.body);
            const stream = Readable.from(bodyBuffer);
            stream.pipe(bb);
        } else {
            bb.end();
        }
    });
}

export const handler: Handler = async (event) => {
    // 处理 OPTIONS 预检请求
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    // 只接受 POST 请求
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // 解析请求体
        let game: string | null = null;

        if (event.body) {
            const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';

            if (contentType.includes('application/json')) {
                const data = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body);
                game = data.game;
            } else if (contentType.includes('multipart/form-data')) {
                const fields = await parseFormData(event);
                game = fields.game;
            } else if (contentType.includes('application/x-www-form-urlencoded')) {
                const params = new URLSearchParams(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body);
                game = params.get('game');
            }
        }

        if (!game || typeof game !== 'string') {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
                body: JSON.stringify({ error: 'Game name is required' })
            };
        }

        // 收集所有流数据
        let result = '';
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();

        // 异步执行搜索并收集结果
        handleSearchRequestStream(game.trim(), PLATFORMS_GAL, writer).then(() => {
            writer.close();
        }).catch((err) => {
            console.error('Streaming error:', err);
            writer.close();
        });

        // 读取流并收集数据
        const reader = readable.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            result += decoder.decode(value, { stream: true });
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache',
                ...corsHeaders
            },
            body: result
        };

    } catch (error) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
            body: JSON.stringify({ error: errorMessage })
        };
    }
};
