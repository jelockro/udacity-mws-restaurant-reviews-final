import path from 'path'
import express from 'express'
//const compression = require('compression');

// Dynamic production server
// const app = express(),
//     DIST_DIR = __dirname,
//     HTML_FILE = path.join(DIST_DIR, 'index.html')
// app.use(express.static(DIST_DIR))
// console.log(HTML_FILE);

// app.get('*', (req, res) => {
//     res.sendFile(HTML_FILE)
// })

const PORT = process.env.PORT || 8080

// Simple no frils server that serves static files from public folders
app.use(compression());
app.use('/dist/service-worker.js', (req, res) => res.sendFile(path.join(__dirname, '/service-worker.js')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/js')));
app.use(express.static(path.join(__dirname, 'public/css')));

app.listen(PORT, () => {
    console.log(`Restaurant Reviews listening on port ${PORT}!`);
    console.log('Press Ctrl+C to quit.')
});