export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request) {
    const url = new URL(request.url);
    const origin = url.origin;
    return Response.redirect(`https://searchgal.top?api=${encodeURIComponent(origin)}`, 302);
}
