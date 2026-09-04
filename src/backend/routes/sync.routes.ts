import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Rutas de sincronización bidireccional offline-first
router.get('/status', SyncController.getStatus);
router.post('/run', authenticateToken('FULL_AUTH'), SyncController.triggerSync);
router.get('/queue', authenticateToken('FULL_AUTH'), SyncController.getQueue);
router.post('/retry-failed', authenticateToken('FULL_AUTH'), SyncController.retryFailed);
router.post('/toggle-offline', authenticateToken('FULL_AUTH'), SyncController.toggleSimulatedOffline);

export default router;
