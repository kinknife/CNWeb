let server = require('./lib/server');
const port = process.env.PORT || 4200
server.run(port)