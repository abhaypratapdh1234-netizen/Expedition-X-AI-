const http = require('http');
const https = require('https');

const PORT = 3001;
const TARGET_HOST = 'openrouter.ai';

const server = http.createServer((req, res) => {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
        let requestBody = Buffer.concat(body).toString();
        
        // Intercept and override max_tokens to 1600 to bypass OpenRouter's free tier limit
        if (req.method === 'POST') {
            try {
                let json = JSON.parse(requestBody);
                if (json.max_tokens && json.max_tokens > 1500) {
                    json.max_tokens = 1500;
                }
                // The ultimate trick: Force it to use the automatic free model router!
                // This bypasses the strict 8k limit of specific free models.
                json.model = 'openrouter/free';
                requestBody = JSON.stringify(json);
            } catch (e) {
                // Ignore parse errors, just pass it through
            }
        }
        
        let headers = { ...req.headers, 'host': TARGET_HOST };
        if (req.method === 'GET' || req.method === 'HEAD') {
            delete headers['content-length'];
        } else {
            headers['content-length'] = Buffer.byteLength(requestBody);
        }

        const options = {
            hostname: TARGET_HOST,
            port: 443,
            path: req.url.startsWith('/api') ? req.url : '/api' + req.url,
            method: req.method,
            headers: headers
        };

        const proxyReq = https.request(options, proxyRes => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', e => {
            console.error('Proxy request error:', e.message);
            res.writeHead(500);
            res.end(e.message);
        });

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            proxyReq.write(requestBody);
        }
        proxyReq.end();
    });
});

server.listen(PORT, () => {
    console.log(`OpenRouter Proxy running on http://localhost:${PORT}`);
    console.log(`Intercepting requests and rewriting max_tokens to 1600...`);
});
