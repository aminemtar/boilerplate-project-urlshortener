require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use('/public', express.static(`${process.cwd()}/public`));

// Serve the index page
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


const urlDatabase = {};
let counter = 1; 


const isValidUrl = (url, callback) => {
    const { host } = new URL(url);
    dns.lookup(host, (err) => {
        callback(!err);
    });
};

// POST request to shorten a URL
app.post('/api/shorturl', (req, res) => {
    const original_url = req.body.url; 

    // Validate the URL format
    if (!/^https?:\/\/[^\s]+$/.test(original_url)) {
        return res.json({ error: 'invalid url' });
    }

    // Check if the URL is reachable via DNS lookup
    isValidUrl(original_url, (isValid) => {
        if (!isValid) {
            return res.json({ error: 'invalid url' });
        }

        // Generate the short URL
        const short_url = counter++;
        urlDatabase[short_url] = original_url;

        // Send response with the original and short URLs
        res.json({
            original_url,
            short_url
        });
    });
});

// Redirect request to the original URL based on short URL
app.get('/api/shorturl/:short_url', (req, res) => {
    const short_url = parseInt(req.params.short_url);

    if (urlDatabase[short_url]) {
        res.redirect(urlDatabase[short_url]);
    } else {
        res.json({ error: 'Short URL not found' });
    }
});

// Start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
