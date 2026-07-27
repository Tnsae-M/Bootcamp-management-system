import express from 'express';
import * as controller from './report.controller.js';
import { authGuard, roleGuard } from '../../middleware/role.guard.js';

const router = express.Router();

router.use(authGuard);
router.get('/', roleGuard(["ADMIN"]), controller.getReports);
router.get('/analytics', roleGuard(["ADMIN"]), controller.getAnalytics);
router.post('/', roleGuard(["ADMIN"]), controller.createReport);
router.get('/:id', roleGuard(["ADMIN"]), controller.getReport);
router.put('/:id', roleGuard(["ADMIN"]), controller.updateReport);
router.delete('/:id', roleGuard(['super admin']), controller.deleteReport);

export default router;
