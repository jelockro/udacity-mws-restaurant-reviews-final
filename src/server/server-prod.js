import path from 'path'
import express from 'express'
//const compression = require('compression');

// Simple no frills Express.js server that serves files from the app folder.
const app = express(),
    DIST_DIR = __dirname,
    HTML_FILE = path.join(DIST_DIR, 'index.html')
app.use(express.static(DIST_DIR))
console.log(HTML_FILE);

app.get('*', (req, res) => {
    res.sendFile(HTML_FILE)
})

const PORT = process.env.PORT || 8080


// app.use(compression());
// app.use('/dist/service-worker.js', (req, res) => res.sendFile(path.join(__dirname, '/service-worker.js')));
// app.use(express.static(path.join(__dirname, 'dist')));
// app.use(express.static(path.join(__dirname, 'app/js')));
// app.use(express.static(path.join(__dirname, 'style/css')));

app.listen(PORT, () => {
    console.log(`Restaurant Reviews listening on port ${PORT}!`);
    console.log('Press Ctrl+C to quit.')
});