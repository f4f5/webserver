
const Koa = require('koa');
const koaNunjucks = require('koa-nunjucks-2');
const json = require('koa-json');
const koaBody = require('koa-body');
const logger = require('koa-logger');
const serve = require('koa-static');
const session = require('koa-session');
const CSRF = require('koa-csrf');
const config = JSON.parse(require('fs').readFileSync('config.json', 'utf8'));
const router = require('./router');
const path = require('path');
const app = new Koa();

// middle wares
app.use(koaBody({ multipart: true }));
app.use(json());
app.use(serve(path.join(__dirname, '/public')));
app.use(koaNunjucks({
    ext: 'html',
    path: path.join(__dirname, 'views'),
    nunjucksConfig: {
      trimBlocks: true
    }
  }));

app.keys = ['session key', 'csrf example'];
app.use(session(app));
// app.use(new CSRF());

// logger
app.use(logger());
app.use(async function (ctx, next) {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// error handler
app.use(async function(ctx, next) {
    try {
      await next();
    } catch (err) {
      // some errors will have .status
      // however this is not a guarantee
      ctx.status = err.status || 500;
      ctx.type = 'html';
      ctx.body = '<p>Something <em>exploded</em>, please contact Maru.</p>';
      // since we handled this manually we'll
      // want to delegate to the regular app
      // level error handling as well so that
      // centralized still functions correctly.
      ctx.app.emit('error', err, ctx);
    }
  });
  
// response && routes
app.use(router.routes(), router.allowedMethods());
  
// error handler
app.on('error', function(err) {
    if (process.env.NODE_ENV != 'test') {
        console.log('sent error %s to the cloud', err.message);
        console.log(err);
    }
});


console.log('now print the config:');
console.log(config);
const port = parseInt(config.server_port);
app.listen(port);
console.info('启动服务器在 http://localhost:' + port);
