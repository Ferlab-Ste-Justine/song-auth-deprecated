var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

const proxy_request = (target) => ((req, res) => {  
    proxy.web(req, res, { target })
})

module.exports = {
    proxy_request
}