const express = require('express');
const mongoose = require('mongoose');
const swaggerUI = require('swagger-ui-express');
const requestLogger = require('./middlewares/requestLogger');
const logger = require('./utils/logger');
const swaggerConfig = require('./swagger/config/swaggerConfig');

require('dotenv').config({ path: './config.env' });
const app = express();

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

app.use(express.json());

// Swagger docs
app.use(
    '/api-docs',
    swaggerUI.serve,
    swaggerUI.setup(swaggerConfig, null, null, null)
);

// Routes
const userRoutes = require('./routes/user');
const noteRoutes = require('./routes/note');
const categoryRoutes = require('./routes/category');

// Allowing headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTION'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );

    next();
});

app.use(requestLogger);

// Applying routes
app.use('/api/user', userRoutes);
app.use('/api/note', noteRoutes);
app.use('/api/category', categoryRoutes);

// Error handling
app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(statusCode).json({ message, data });
});

mongoose
    .connect(DB_URL)
    .then(result => {
        console.log('Connected to the database!');
        logger.info('Connected to the database!');
        const server = app.listen(PORT);
    })
    .catch(err => {
        console.log(err);
        logger.error(err);
    });
