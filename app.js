const express = require('express');
const app = express();
const utilityRoutes = require('./routes/utilityRoutes');

// Middleware for parsing JSON
app.use(express.json());

// Use utility routes with the `/api` prefix
app.use('/api', utilityRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
