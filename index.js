const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');
 
  
const authRoutes = require('./routes/routes');
 
// connect to database
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

 // Routes
app.get('', (req, res) => {
    res.send('Welcome to Makeup Munch');
});
   
app.use('', authRoutes);

app.use('/auth', authRoutes);
 


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});