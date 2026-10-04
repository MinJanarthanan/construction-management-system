const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { getInitializedDb } = require('./config/database');
const { Role, User } = require('./models');
const seedDatabase = require('./scripts/initDb');
const { swaggerSpec, swaggerHtml } = require('./docs/swaggerDoc');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const materialRoutes = require('./routes/materialRoutes');
const contractorRoutes = require('./routes/contractorRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const formRoutes = require('./routes/formRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get(['/api/health', '/api/v1/health'], (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Construction Management System REST API',
    version: '1.0.0'
  });
});

// Swagger / OpenAPI documentation
app.get(['/api/docs', '/api/v1/docs'], (req, res) => {
  res.send(swaggerHtml);
});
app.get(['/api/docs/swagger.json', '/api/v1/docs/swagger.json'], (req, res) => {
  res.json(swaggerSpec);
});

// Mount Application Routes under both /api and /api/v1
const registerRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/projects`, projectRoutes);
  app.use(`${prefix}/tasks`, taskRoutes);
  app.use(`${prefix}/milestones`, milestoneRoutes);
  app.use(`${prefix}/budgets`, budgetRoutes);
  app.use(`${prefix}/expenses`, expenseRoutes);
  app.use(`${prefix}/resources`, resourceRoutes);
  app.use(`${prefix}/materials`, materialRoutes);
  app.use(`${prefix}/contractors`, contractorRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/roles`, roleRoutes);
  app.use(`${prefix}/forms`, formRoutes);
  app.use(`${prefix}/reports`, reportRoutes);
};

registerRoutes('/api');
registerRoutes('/api/v1');

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ error: `API Route '${req.originalUrl}' not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const db = await getInitializedDb();
    
    // In production or when MySQL schema is already loaded, authenticate without forcing schema override
    await db.authenticate();

    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`\n==================================================`);
        console.log(`🏗️  Construction Management System API is running!`);
        console.log(`🌐  Local URL: http://localhost:${PORT}`);
        console.log(`📑  Swagger Docs: http://localhost:${PORT}/api/docs`);
        console.log(`📊  Health Check: http://localhost:${PORT}/api/health`);
        console.log(`==================================================\n`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
