import path from 'path'
import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import config from '../../webpack.dev.config.js'

const app = express(),
            DIST_DIR = __dirname,
            HTML_FILE = path.join(DIST_DIR, 'index.html'),
            compiler = webpack(config)

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}))

app.get('*', (req, res, next) => {
  compiler.outputFileSystem.readFile(HTML_FILE, (err, result) => {
  if (err) {
    return next(err)
  }
  res.set('content-type', 'text/html')
  res.send(result)
  res.end()
  })
})

const PORT = process.env.PORT || 8000


// app.use(compression());
// app.use('/dist/service-worker.js', (req, res) => res.sendFile(path.join(__dirname, '/service-worker.js')));
// app.use(express.static(path.join(__dirname, 'dist')));
// app.use(express.static(path.join(__dirname, 'app/js')));
// app.use(express.static(path.join(__dirname, 'style/css')));

app.listen(PORT, () => {
    console.log(`Restaurant Reviews listening on port ${PORT}!`);
    console.log('Press Ctrl+C to quit.')
});