import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';

const router = Router();
const workflowController = new WorkflowController();

router.post('/', workflowController.createWorkflow);
router.get('/', workflowController.getAllWorkflows);
router.get('/:id', workflowController.getWorkflowById);
router.put('/:id', workflowController.updateWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);

export default router;