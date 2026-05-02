import { NextRequest } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || 'http://localhost:5000/api';

async function proxyRequest(req: NextRequest) {
  const url = new URL(req.url);
  // keep the path after /api (e.g. /safety/dashboard)
  const path = url.pathname.replace(/^\/api/, '');
  const backendUrl = `${BACKEND}${path}${url.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'host') return;
    headers.set(key, value);
  });

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const buf = await req.arrayBuffer();
      fetchOptions.body = buf;
    } catch (e) {
      // ignore if body can't be read
    }
  }

  const res = await fetch(backendUrl, fetchOptions);

  const resHeaders = new Headers(res.headers);
  resHeaders.delete('transfer-encoding');

  const arrayBuffer = await res.arrayBuffer();

  return new Response(arrayBuffer, {
    status: res.status,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest) {
  return proxyRequest(req);
}

export async function POST(req: NextRequest) {
  return proxyRequest(req);
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req);
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req);
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req);
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
