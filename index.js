const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');
const cors = require('cors');
const crypto = require('crypto');

const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });
console.log("Loading environment variables from:", envFile);
// const CORS_ORIGIN = process.env.CORS_ORIGIN;

const authRoutes = require('./routes/routes');

const adminRoutes = require('./routes/admin_routes');

const artistRoutes = require('./routes/artistProfileRoutes');


// connect to database
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({
    origin: [
 
    'http://localhost:3000',
    'http://localhost:3001',
    'https://www.makeupmunch.in',
    'https://lab.development.makeupmunch.in',
    'lab.development.makeupmunch.in',
    'https://admin.dashboard.makeupmunch.in',
    'https://artist.makeupmunch.in',
    'https://service.app.makeupmunch.in'
  ],
 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
// Routes
app.get('', (req, res) => {
    res.send('Welcome to Makeup munch app.');
});

app.get('/', (req, res) => {
    res.send('Welcome to makeup munch app');
});


app.use('', authRoutes);


app.use('/admin', adminRoutes);


 app.use('/artist', artistRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});  
