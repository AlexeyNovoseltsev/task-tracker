import { Router, Request, Response } from 'express';

import config from '@/config';
import { supabaseAdmin } from '@/config/supabase';
import { successResponse } from '@/middleware/errorHandler';
import { getConnectionStats } from '@/services/websocket';

const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const { data: dbCheck, error: dbError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    const dbStatus = dbError ? 'down' : 'up';
    const dbResponseTime = Date.now() - startTime;

    // Get system information
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    const nodeVersion = process.version;
    const platform = process.platform;
    const arch = process.arch;

    // Get WebSocket statistics
    const wsStats = getConnectionStats();

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.server.nodeEnv,
      version: '1.0.0',
      uptime: Math.floor(uptime),
      system: {
        nodeVersion,
        platform,
        arch,
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
        },
      },
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
        },
        websocket: {
          status: 'up',
          connections: wsStats.totalConnections,
          uniqueUsers: wsStats.uniqueUsers,
          rooms: wsStats.projectRooms,
        },
      },
    };

    // Set status code based on service health
    const statusCode = dbStatus === 'up' ? 200 : 503;

    return successResponse(res, healthData, 'Health check completed', statusCode);
  } catch (error) {
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: Math.floor(process.uptime()),
    };

    return res.status(503).json({
      success: false,
      data: errorData,
      error: 'Service unhealthy',
    });
  }
});

// Detailed health check with more diagnostics
router.get('/detailed', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Database connectivity tests
    const dbTests = {
      connection: false,
      read: false,
      write: false,
      responseTime: 0,
    };

    try {
      const dbStartTime = Date.now();
      
      // Test read operation
      const { data: readTest, error: readError } = await supabaseAdmin
        .from('users')
        .select('id')
        .limit(1);
      
      if (!readError) {
        dbTests.connection = true;
        dbTests.read = true;
      }

      // Test write operation (create and delete a test record)
      const testId = `health-check-${Date.now()}`;
      const { error: writeError } = await supabaseAdmin
        .from('activities')
        .insert({
          id: testId,
          type: 'created',
          description: 'Health check test',
          task_id: '00000000-0000-0000-0000-000000000000',
          project_id: '00000000-0000-0000-0000-000000000000',
          user_id: '00000000-0000-0000-0000-000000000000',
        });

      if (!writeError) {
        dbTests.write = true;
        
        // Clean up test record
        await supabaseAdmin
          .from('activities')
          .delete()
          .eq('id', testId);
      }

      dbTests.responseTime = Date.now() - dbStartTime;
    } catch (error) {
      // Database tests failed
    }

    // File storage tests
    const storageTests = {
      connection: false,
      upload: false,
      download: false,
      responseTime: 0,
    };

    try {
      const storageStartTime = Date.now();
      
      // Test storage bucket access
      const { data: buckets, error: bucketsError } = await supabaseAdmin
        .storage
        .listBuckets();

      if (!bucketsError && buckets) {
        storageTests.connection = true;
        
        // Check if our bucket exists
        const taskflowBucket = buckets.find(b => b.id === config.supabase.storageBucket);
        if (taskflowBucket) {
          storageTests.upload = true;
          storageTests.download = true;
        }
      }

      storageTests.responseTime = Date.now() - storageStartTime;
    } catch (error) {
      // Storage tests failed
    }

    // WebSocket connection statistics
    const wsStats = getConnectionStats();

    // Performance metrics
    const cpuUsage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();

    const detailedHealth = {
      status: dbTests.read && dbTests.write && storageTests.connection ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: config.server.nodeEnv,
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
      responseTime: Date.now() - startTime,
      services: {
        database: {
          status: dbTests.read && dbTests.write ? 'up' : 'down',
          tests: dbTests,
        },
        storage: {
          status: storageTests.connection ? 'up' : 'down',
          tests: storageTests,
        },
        websocket: {
          status: 'up',
          stats: wsStats,
        },
      },
      system: {
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024),
        },
        eventLoop: {
          lag: 0, // Could implement event loop lag measurement
        },
      },
      features: {
        authentication: true,
        authorization: true,
        fileUploads: storageTests.upload,
        realTime: wsStats.totalConnections >= 0,
        rateLimit: true,
        monitoring: config.monitoring.enabled,
      },
    };

    const statusCode = detailedHealth.status === 'healthy' ? 200 : 
                      detailedHealth.status === 'degraded' ? 200 : 503;

    return successResponse(res, detailedHealth, 'Detailed health check completed', statusCode);
  } catch (error) {
    return res.status(503).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if service is ready to handle requests
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(503).json({
        ready: false,
        error: 'Database not ready',
      });
    }

    return res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      ready: false,
      error: 'Service not ready',
    });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req: Request, res: Response) => {
  // Simple liveness check - if we can respond, we're alive
  return res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// Database test endpoint (bypasses auth for testing)
router.get('/database', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Test database connection with multiple queries
    const tests = [];

    // Test 1: Check projects table
    try {
      const { data: projects, error: projectsError } = await supabaseAdmin
        .from('projects')
        .select('id, name, key')
        .limit(5);

      tests.push({
        name: 'projects_read',
        success: !projectsError,
        error: projectsError?.message || null,
        count: projects?.length || 0,
      });
    } catch (error) {
      tests.push({
        name: 'projects_read',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        count: 0,
      });
    }

    // Test 2: Check users table
    try {
      const { count: usersCount, error: usersError } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      tests.push({
        name: 'users_count',
        success: !usersError,
        error: usersError?.message || null,
        count: usersCount || 0,
      });
    } catch (error) {
      tests.push({
        name: 'users_count',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        count: 0,
      });
    }

    // Test 3: Check tasks table
    try {
      const { count: tasksCount, error: tasksError } = await supabaseAdmin
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      tests.push({
        name: 'tasks_count',
        success: !tasksError,
        error: tasksError?.message || null,
        count: tasksCount || 0,
      });
    } catch (error) {
      tests.push({
        name: 'tasks_count',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        count: 0,
      });
    }

    const responseTime = Date.now() - startTime;
    const successfulTests = tests.filter(t => t.success).length;
    const totalTests = tests.length;

    const testResults = {
      success: successfulTests > 0,
      timestamp: new Date().toISOString(),
      responseTime,
      summary: `${successfulTests}/${totalTests} tests passed`,
      tests,
      config: {
        supabase_url: config.supabase.url ? 'configured' : 'missing',
        anon_key: config.supabase.anonKey ? 'configured' : 'missing',
        service_key: config.supabase.serviceKey ? 'configured' : 'missing',
        environment: config.server.nodeEnv,
      },
    };

    const statusCode = successfulTests > 0 ? 200 : 500;
    return successResponse(res, testResults, 'Database test completed', statusCode);
  } catch (error) {
    const errorData = {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
      config: {
        supabase_url: config.supabase.url ? 'configured' : 'missing',
        anon_key: config.supabase.anonKey ? 'configured' : 'missing',
        service_key: config.supabase.serviceKey ? 'configured' : 'missing',
        environment: config.server.nodeEnv,
      },
    };

    return res.status(500).json({ 
      success: false,
      data: errorData,
      error: 'Database test failed'
    });
  }
});

export default router;