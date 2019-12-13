var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.removeHeader('authorization')
});

const proxy_request = (target) => ((req, res) => {  
    proxy.web(req, res, { target })
})

module.exports = {
    proxy_request
}