// Cloudflare Worker: proxies POST requests to the NU admission-result endpoint
// and adds CORS headers so a static site (e.g. GitHub Pages) can call it.
//
// Deploy (no CLI needed):
//   1. Sign in at https://dash.cloudflare.com
//   2. Workers & Pages -> Create -> Create Worker -> name it (e.g. "nu-proxy")
//   3. Click "Edit code", replace the default code with this file's contents,
//      then "Deploy".
//   4. Copy the worker URL (e.g. https://nu-proxy.<your-subdomain>.workers.dev)
//   5. In your GitHub repo: Settings -> Secrets and variables -> Actions ->
//      "Variables" tab -> New repository variable:
//        name:  VITE_API_PROXY
//        value: <the worker URL from step 4>
//   6. Re-run the "Deploy to GitHub Pages" workflow.

const NU_URL =
  'http://app55.nu.edu.bd/nu-web/fetchAdmissionTestResultInformation'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }
    if (request.method !== 'POST') {
      return new Response('Use POST', { status: 405, headers: CORS_HEADERS })
    }

    const body = await request.text()
    const upstream = await fetch(NU_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    const text = await upstream.text()
    return new Response(text, {
      status: upstream.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type':
          upstream.headers.get('content-type') || 'text/html; charset=utf-8',
      },
    })
  },
}
