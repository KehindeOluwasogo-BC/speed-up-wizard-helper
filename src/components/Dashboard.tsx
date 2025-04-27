import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  FileSearch, 
  MessageSquarePlus, 
  Share2, 
  ImagePlus, 
  FileSpreadsheet,
  Zap,
  Loader2
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import FeatureCard from '@/components/FeatureCard';
import { workflowApi } from '@/services/api';
import { IWorkflow } from '../../wizard-backend/src/services/workflow.service';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const data = await workflowApi.getAllWorkflows();
      setWorkflows(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch workflows",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (feature: string) => {
    navigate(`/wizard/${feature.toLowerCase().replace(/\s/g, '-')}`);
  };

  const handleQuickAction = () => {
    toast({
      title: "Quick action initiated",
      description: "Your task has been added to the queue",
    });
  };

  return (
    <div className="container py-6 space-y-8 animate-slide-in">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-lg border bg-background p-6">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
          <div className="h-24 w-24 rounded-full bg-primary/20 blur-xl" />
        </div>
        
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Welcome to SpeedUp Wizard</h1>
        </div>
        
        <p className="mb-4 max-w-2xl text-muted-foreground">
          Save time and boost your productivity with our automation workflows. 
          Choose a template below or create your own custom workflow.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleCardClick('create-workflow')}>
            Create New Workflow
          </Button>
          <Button variant="outline" onClick={handleQuickAction}>
            Quick Action
          </Button>
        </div>

        <div className="absolute bottom-0 right-0 translate-y-1/3 translate-x-1/3">
          <div className="h-36 w-36 rounded-full bg-secondary/20 blur-xl opacity-50" />
        </div>
      </div>

      {/* Recent workflows */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Workflows</h2>
          <Button variant="link" className="text-primary" onClick={() => navigate('/workflows')}>
            View all
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : workflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.slice(0, 2).map((workflow) => (
              <Card key={workflow._id || `temp-${workflow.name}-${workflow.updatedAt}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{workflow.name}</CardTitle>
                  <CardDescription className="flex justify-between items-center">
                    <span>Last updated: {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                    <span className={workflow.status === 'active' ? 'text-success' : 'text-muted'} >
                      {workflow.status}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={65} 
                    className="h-2 mb-2" 
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{workflow.source.type}</span>
                    <span>{workflow.processingOptions.outputFormat}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>No workflows created yet. Create your first workflow to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Automation Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <FeatureCard
            title="Document Processing"
            description="Convert, summarize, and extract information from documents."
            icon={FileSearch}
            onClick={() => handleCardClick('Document Processing')}
            badge="Popular"
          />
          <FeatureCard
            title="Meeting Assistant"
            description="Schedule, record, transcribe, and summarize meetings."
            icon={MessageSquarePlus}
            onClick={() => handleCardClick('Meeting Assistant')}
          />
          <FeatureCard
            title="Batch Image Processing"
            description="Resize, optimize, and convert images in bulk."
            icon={ImagePlus}
            onClick={() => handleCardClick('Batch Image Processing')}
          />
          <FeatureCard
            title="Data Entry Automation"
            description="Extract and input data from various sources into spreadsheets."
            icon={FileSpreadsheet}
            onClick={() => handleCardClick('Data Entry Automation')}
          />
          <FeatureCard
            title="Social Media Manager"
            description="Schedule and automate posts across multiple platforms."
            icon={Share2}
            onClick={() => handleCardClick('Social Media Manager')}
          />
          <FeatureCard
            title="Time Tracker"
            description="Track and analyze how you spend time on different tasks."
            icon={Clock}
            onClick={() => handleCardClick('Time Tracker')}
            badge="New"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
