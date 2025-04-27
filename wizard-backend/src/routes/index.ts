import { Router } from 'express';
import workflowRoutes from './workflow.routes';

const setRoutes = (app: Router) => {
  app.use('/api/workflows', workflowRoutes);
};

export default setRoutes;

export * from './workflow.routes';