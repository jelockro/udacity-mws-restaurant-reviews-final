const path = require('path');
const express = require('express');
const compression = require('compression');

// Simple no frills Express.js server that serves files from the public folder.
const app = express();
app.use(compression());
app.use('/sw.js', (req, res) => res.sendFile(path.join(__dirname, 'public/sw.js')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/js')));
app.use(express.static(path.join(__dirname, 'public/css')));

app.listen(8000, () => {
    console.log('Restaurant Reviews listening on port 8000!');
});