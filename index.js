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
app.use(cors());
 // Routes
app.get('', (req, res) => {
    res.send('Welcome to Makeup Munch');
}); 

app.get('/shivank', (req, res) => {
    res.send('Welcome shivank');
}); 
   
   
app.use('', authRoutes);
 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
}); 