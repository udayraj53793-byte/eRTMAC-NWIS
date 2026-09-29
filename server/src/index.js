require('dotenv').config();
require('dns').setServers(['8.8.8.8']);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/database');

const app = express();

// ======================================================
// DATABASE
// ======================================================

connectDB();

// ======================================================
// SECURITY
// ======================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin (Postman, curl, Render health checks)
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured frontend origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // For now, allow other origins so deployment/testing works
      return callback(null, true);
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);

// ======================================================
// RATE LIMITING
// ======================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
});

app.use('/api/auth', authLimiter);
app.use(limiter);

// ======================================================
// BODY PARSING
// ======================================================

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// ======================================================
// LOGGING
// ======================================================

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ======================================================
// UPLOADS
// ======================================================

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, '../uploads')
  )
);

// ======================================================
// API ROUTES
// ======================================================

app.use(
  '/api/auth',
  require('./routes/auth')
);

app.use(
  '/api/users',
  require('./routes/users')
);

app.use(
  '/api/wells',
  require('./routes/wells')
);

app.use(
  '/api/events',
  require('./routes/events')
);

app.use(
  '/api/reports',
  require('./routes/reports')
);

app.use(
  '/api/risks',
  require('./routes/risks')
);

app.use(
  '/api/analytics',
  require('./routes/analytics')
);

app.use(
  '/api/ai',
  require('./routes/ai')
);

app.use(
  '/api/rag',
  require('./routes/rag')
);

app.use(
  '/api/admin',
  require('./routes/admin')
);

// ======================================================
// DRILLING READINGS
// ======================================================

const DrillingReading = require('./models/DrillingReading');
const authMiddleware = require('./middleware/auth');

app.get(
  '/api/readings/:wellId',
  authMiddleware,
  async (req, res) => {
    try {
      const {
        limit = 100,
        depth_start,
        depth_end,
      } = req.query;

      const filter = {
        wellId: req.params.wellId,
      };

      if (depth_start || depth_end) {
        filter.depth = {};

        if (depth_start) {
          filter.depth.$gte = parseFloat(depth_start);
        }

        if (depth_end) {
          filter.depth.$lte = parseFloat(depth_end);
        }
      }

      const readings =
        await DrillingReading.find(filter)
          .sort({ timestamp: -1 })
          .limit(parseInt(limit));

      res.json({
        success: true,
        data: readings,
      });
    } catch (error) {
      console.error(
        'Failed to fetch readings:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Failed to fetch readings.',
      });
    }
  }
);

// ======================================================
// KNOWLEDGE GRAPH
// ======================================================

const Well = require('./models/Well');
const DrillingEvent = require('./models/DrillingEvent');

app.get(
  '/api/knowledge-graph',
  authMiddleware,
  async (req, res) => {
    try {
      const wells = await Well.find({
        isActive: true,
      }).limit(20);

      const events =
        await DrillingEvent.find({
          verificationStatus: 'APPROVED',
        })
          .populate(
            'wellId',
            'wellName'
          )
          .populate(
            'sourceDocumentId',
            'title'
          );

      const nodes = [];
      const edges = [];

      // Wells
      wells.forEach((w) => {
        nodes.push({
          id: `well-${w._id}`,
          label: w.wellName,
          type: 'WELL',
          data: {
            field: w.field,
            status: w.status,
          },
        });
      });

      // Events
      events.forEach((e) => {
        const nodeId = `event-${e._id}`;

        nodes.push({
          id: nodeId,
          label: e.eventType.replace(
            /_/g,
            ' '
          ),
          type: 'EVENT',
          data: {
            depth: e.depth,
            severity: e.severity,
          },
        });

        // Event → Well
        if (e.wellId) {
          edges.push({
            source: `well-${e.wellId._id}`,
            target: nodeId,
            label: 'HAS_EVENT',
          });
        }

        // Event → Formation
        if (e.formation) {
          const formNodeId =
            `form-${e.formation.replace(
              /\s/g,
              '_'
            )}`;

          if (
            !nodes.find(
              (n) => n.id === formNodeId
            )
          ) {
            nodes.push({
              id: formNodeId,
              label: e.formation,
              type: 'FORMATION',
            });
          }

          edges.push({
            source: nodeId,
            target: formNodeId,
            label: 'IN_FORMATION',
          });
        }

        // Event → Document
        if (e.sourceDocumentId) {
          const docNodeId =
            `doc-${e.sourceDocumentId._id}`;

          if (
            !nodes.find(
              (n) => n.id === docNodeId
            )
          ) {
            nodes.push({
              id: docNodeId,
              label:
                e.sourceDocumentId.title,
              type: 'DOCUMENT',
            });
          }

          edges.push({
            source: nodeId,
            target: docNodeId,
            label: 'SOURCED_FROM',
          });
        }
      });

      res.json({
        success: true,
        data: {
          nodes,
          edges,
        },
      });
    } catch (error) {
      console.error(
        'Knowledge graph error:',
        error
      );

      res.status(500).json({
        success: false,
        message:
          'Failed to build knowledge graph.',
      });
    }
  }
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'eRTMAC-NWIS API',
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// API ROOT
// ======================================================

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'eRTMAC-NWIS API',
    message: 'Backend API is running',
    health: '/health',
  });
});

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    path: req.originalUrl,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
  (err, req, res, next) => {
    console.error(
      'Unhandled error:',
      err
    );

    if (
      err.message &&
      err.message.includes('Only PDF')
    ) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
);

// ======================================================
// SERVER
// ======================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 eRTMAC-NWIS API running on port ${PORT}`
  );

  console.log(
    `📊 Environment: ${
      process.env.NODE_ENV ||
      'development'
    }`
  );

  console.log(
    `🔗 Port: ${PORT}`
  );
});

module.exports = app;