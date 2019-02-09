const fastify = require('fastify')({ logger: { level: 'trace' } });
const path = require('path');
const serveStatic = require('serve-static')
const serveIndex = require('serve-index')
fastify.register(require('point-of-view'), {
  engine: {
    ejs: require('ejs')
  },
  templates: './templates',
  options: {}
});
fastify.use('/assets', serveStatic(path.join(__dirname, '/../assets')));
fastify.use('/root', serveStatic(path.join(__dirname, '/../root/')), serveIndex(path.join(__dirname, '/../root/')));
fastify.get('/', (req, reply) => {
  reply.view('index.ejs', {
   pageData: {
      pageTitle: "My root folder and files",
      pageYear: 2019
    }
  })
});
module.exports = async (serverPort) => {
  try {
    await fastify.listen(serverPort);
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
};