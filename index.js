const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');
const cors = require('cors');
const crypto = require('crypto');
 
  
const authRoutes = require('./routes/routes');
  
// connect to database
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://www.makeupmunch.in'
        'admin.makeupmunch.in'
        'https://makeupmunch-ui-testing.vercel.app',
        'https://mekeupmunch-admin-dashboard.vercel.app'
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
 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
}); 
