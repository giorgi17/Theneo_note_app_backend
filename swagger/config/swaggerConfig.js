const fs = require('fs');
const path = require('path');

const swaggerData = fs.readFileSync(
    path.join(__dirname, '..', 'index.json'),
    'utf8'
);
const swaggerConfig = JSON.parse(swaggerData);

module.exports = swaggerConfig;
