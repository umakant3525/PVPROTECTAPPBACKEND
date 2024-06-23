import { Router } from 'express';
import { healthcheck, hello } from "../controllers/healthcheck.controller.js"

const router = Router();

router.route('/').get(healthcheck);
router.route('/hello').get(hello);


export default router