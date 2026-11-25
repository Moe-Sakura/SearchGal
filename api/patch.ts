import { PLATFORMS_PATCH } from '../src/core';
import { handleSearchRequest } from '../src/searchHandler';

export const config = {
    runtime: 'edge',
};

export default function handler(request: Request): Promise<Response> {
    return handleSearchRequest(request, PLATFORMS_PATCH);
}
