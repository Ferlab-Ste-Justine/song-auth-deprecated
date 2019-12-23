var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

//https://github.com/http-party/node-http-proxy/issues/1328
//https://github.com/http-party/node-http-proxy/issues/1219
proxy.before('web', 'stream', (req, res, options) => {
    if (req.headers.expect) {
        req.__expectHeader = req.headers.expect;
        delete req.headers.expect;
    }
});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.removeHeader('authorization')

    if (req.__expectHeader) {
        proxyReq.setHeader('Expect', req.__expectHeader);
    }
});

const proxy_request = (target) => ((req, res) => {  
    proxy.web(req, res, { target })
})

module.exports = {
    proxy_request
}