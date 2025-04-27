import { Request, Response } from 'express';
import { WorkflowService } from '../services/workflow.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class WorkflowController {
  private workflowService: WorkflowService;

  constructor() {
    this.workflowService = new WorkflowService();
  }

  createWorkflow = async (req: Request, res: Response) => {
    try {
      const validation = this.workflowService.validateWorkflowData(req.body);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(', '), 400);
      }

      const workflow = await this.workflowService.createWorkflow(req.body);
      res.status(201).json(workflow);
    } catch (error) {
      logger.error('Error creating workflow:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  getAllWorkflows = async (_req: Request, res: Response) => {
    try {
      const workflows = await this.workflowService.getAllWorkflows();
      res.json(workflows);
    } catch (error) {
      logger.error('Error fetching workflows:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getWorkflowById = async (req: Request, res: Response) => {
    try {
      const workflow = await this.workflowService.getWorkflowById(req.params.id);
      if (!workflow) {
        throw new AppError('Workflow not found', 404);
      }
      res.json(workflow);
    } catch (error) {
      logger.error(`Error fetching workflow ${req.params.id}:`, error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  updateWorkflow = async (req: Request, res: Response) => {
    try {
      const workflow = await this.workflowService.updateWorkflow(req.params.id, req.body);
      if (!workflow) {
        throw new AppError('Workflow not found', 404);
      }
      res.json(workflow);
    } catch (error) {
      logger.error(`Error updating workflow ${req.params.id}:`, error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  deleteWorkflow = async (req: Request, res: Response) => {
    try {
      const workflow = await this.workflowService.deleteWorkflow(req.params.id);
      if (!workflow) {
        throw new AppError('Workflow not found', 404);
      }
      res.json({ message: 'Workflow deleted successfully' });
    } catch (error) {
      logger.error(`Error deleting workflow ${req.params.id}:`, error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}