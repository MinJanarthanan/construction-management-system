/**
 * OpenAPI 3.0.0 Specification and Swagger UI provider for BuildCorp API
 */

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'BuildCorp – Construction Management System REST API',
    version: '1.0.0',
    description: 'DBMS Course Project API for SRM Institute of Science and Technology, Dept. of CSE (AIML). Multi-site construction management platform tracking projects, budgets, materials, site forms, tasks, and resources.',
    contact: {
      name: 'BuildCorp Engineering Team',
      email: 'alex.vance@buildcorp.com'
    }
  },
  servers: [
    { url: '/api/v1', description: 'Production v1 API' },
    { url: '/api', description: 'Default API Endpoint' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token generated from /auth/login'
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Authenticate user with username or email',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: { type: 'string', example: 'alex.vance' },
                  password: { type: 'string', example: 'Demo@123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Authentication successful with JWT token' },
          401: { description: 'Invalid login credentials' },
          429: { description: 'Rate limit exceeded' }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Retrieve authenticated user profile and permissions',
        responses: {
          200: { description: 'Current user details' }
        }
      }
    },
    '/projects': {
      get: {
        summary: 'List all construction projects with manager & contractor data',
        responses: { 200: { description: 'Array of projects' } }
      },
      post: {
        summary: 'Create a new project (Admin or Project Manager)',
        responses: { 201: { description: 'Project created' } }
      }
    },
    '/tasks': {
      get: {
        summary: 'List project tasks with status and assignee',
        responses: { 200: { description: 'List of tasks' } }
      }
    },
    '/materials': {
      get: {
        summary: 'List site materials and inventory stock levels',
        responses: { 200: { description: 'Materials catalog' } }
      }
    },
    '/expenses': {
      get: {
        summary: 'List project expenses and expenditures',
        responses: { 200: { description: 'Expenses list' } }
      },
      post: {
        summary: 'Record new project expense (Subject to database budget trigger)',
        responses: {
          201: { description: 'Expense recorded' },
          400: { description: 'Cumulative expenses exceed Approved Budget' }
        }
      }
    },
    '/forms': {
      get: {
        summary: 'Paginated, filterable site forms list (10,254 historical records)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 25 } },
          { name: 'projectId', in: 'query', schema: { type: 'integer' } },
          { name: 'statusClass', in: 'query', schema: { type: 'string', enum: ['Open', 'Closed'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Paginated site forms' } }
      }
    },
    '/forms/stats': {
      get: {
        summary: 'Real-time aggregated site forms analytics (<50ms performance)',
        responses: { 200: { description: 'Forms analytics data' } }
      }
    },
    '/forms/export': {
      get: {
        summary: 'Download filtered site inspection forms as CSV file',
        responses: { 200: { description: 'CSV file download' } }
      }
    },
    '/reports/dashboard-stats': {
      get: {
        summary: 'Consolidated executive dashboard KPI metrics',
        responses: { 200: { description: 'KPI analytics summary' } }
      }
    }
  }
};

const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BuildCorp API Documentation (OpenAPI / Swagger)</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" sizes="32x32" />
  <style>
    body { margin: 0; background: #0f172a; }
    .swagger-ui .topbar { background-color: #1e293b; border-bottom: 2px solid #38bdf8; }
    .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
    .swagger-ui .model-box, .swagger-ui textarea, .swagger-ui input { filter: invert(0); }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/api/docs/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;

module.exports = {
  swaggerSpec,
  swaggerHtml
};
