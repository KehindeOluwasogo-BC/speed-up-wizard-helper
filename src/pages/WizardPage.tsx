import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Save, Play, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WizardStep from '@/components/WizardStep';
import { workflowApi } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FileUploadZone } from '@/components/FileUploadZone';
import { useFileUpload } from '@/hooks/use-file-upload';

const WizardPage = () => {
  const { feature } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [workflowId, setWorkflowId] = useState<string>();
  const { uploadFiles, isUploading, progress, config } = useFileUpload(workflowId);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    source: {
      type: 'file',
      config: {}
    },
    processingOptions: {
      autoProcess: true,
      sendNotifications: true,
      archiveProcessed: false,
      outputFormat: 'CSV'
    },
    schedule: {
      type: 'manual',
      config: {}
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSourceTypeChange = (type: 'file' | 'api' | 'folder') => {
    setFormData(prev => ({
      ...prev,
      source: {
        type,
        config: {}
      }
    }));
  };

  const handleProcessingOptionChange = (option: string, value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      processingOptions: {
        ...prev.processingOptions,
        [option]: value
      }
    }));
  };

  const handleScheduleTypeChange = (type: 'manual' | 'recurring' | 'triggered') => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        type,
        config: {}
      }
    }));
  };

  const handleFilesSelected = async (files: File[]) => {
    if (!workflowId) {
      // Create the workflow first if it doesn't exist
      try {
        const workflow = await workflowApi.createWorkflow({
          name: formData.name || 'New Workflow',
          description: formData.description,
          source: {
            type: 'file',
            config: {}
          },
          processingOptions: {
            autoProcess: true,
            sendNotifications: true,
            archiveProcessed: false,
            outputFormat: 'CSV'
          }
        });
        setWorkflowId(workflow._id);
        await uploadFiles(files);
      } catch (error) {
        console.error('Failed to create workflow:', error);
      }
    } else {
      // Workflow exists, just upload the files
      await uploadFiles(files);
    }
  };

  // Format the feature name for display
  const formattedFeature = feature 
    ? feature.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ') 
    : '';

  const handleStepClick = (step: number) => {
    // Only allow clicking on completed steps or the next step
    if (completedSteps.includes(step) || step === activeStep) {
      setActiveStep(step);
    }
  };

  const completeStep = async () => {
    try {
      if (activeStep === 4) {
        // Submit the workflow
        await workflowApi.createWorkflow(formData);
        toast({
          title: "Success",
          description: "Workflow created successfully!",
        });
        navigate('/');
      } else {
        if (!completedSteps.includes(activeStep)) {
          setCompletedSteps([...completedSteps, activeStep]);
        }
        setActiveStep(activeStep + 1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workflow. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-6 space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{formattedFeature || 'Create Workflow'}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Run Workflow
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar - Wizard Steps */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Steps</h2>
              
              <div className="space-y-1">
                <WizardStep
                  step={1}
                  title="Select Template"
                  description="Choose a workflow template"
                  isActive={activeStep === 1}
                  isCompleted={completedSteps.includes(1)}
                  onClick={() => handleStepClick(1)}
                />
                
                <WizardStep
                  step={2}
                  title="Configure Sources"
                  description="Set up input data sources"
                  isActive={activeStep === 2}
                  isCompleted={completedSteps.includes(2)}
                  onClick={() => handleStepClick(2)}
                />
                
                <WizardStep
                  step={3}
                  title="Define Workflow"
                  description="Set processing options"
                  isActive={activeStep === 3}
                  isCompleted={completedSteps.includes(3)}
                  onClick={() => handleStepClick(3)}
                />
                
                <WizardStep
                  step={4}
                  title="Save & Schedule"
                  description="Schedule and activate"
                  isActive={activeStep === 4}
                  isCompleted={completedSteps.includes(4)}
                  isLast={true}
                  onClick={() => handleStepClick(4)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Wizard Content */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardContent className="p-6">
              {/* Step 1: Select Template */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Select a Template</h2>
                  <p className="text-muted-foreground">
                    Choose a starting point for your {formattedFeature} workflow.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <Card className="border-2 border-primary cursor-pointer card-hover">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="icon-container shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Basic Workflow</h3>
                          <p className="text-sm text-muted-foreground">
                            A simple workflow for beginners
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border cursor-pointer card-hover">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="icon-container shrink-0">
                          <Settings className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Advanced Workflow</h3>
                          <p className="text-sm text-muted-foreground">
                            More options for power users
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              {/* Step 2: Configure Sources */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Configure Sources</h2>
                  <p className="text-muted-foreground">
                    Set up where your data will come from.
                  </p>
                  
                  <Tabs defaultValue="file" className="mt-4" onValueChange={(value) => handleSourceTypeChange(value as any)}>
                    <TabsList>
                      <TabsTrigger value="file">File Upload</TabsTrigger>
                      <TabsTrigger value="api">API Integration</TabsTrigger>
                      <TabsTrigger value="folder">Folder Sync</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="file" className="space-y-4 mt-4">
                      <FileUploadZone
                        onFilesSelected={handleFilesSelected}
                        isUploading={isUploading}
                        progress={progress}
                        maxFiles={config.maxFiles}
                        maxSize={config.maxSize}
                        acceptedFiles={config.acceptedFiles}
                      />
                      <div className="text-sm text-muted-foreground">
                        Supported formats: {config.acceptedFiles.join(', ')}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="api" className="space-y-4 mt-4">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="api-url">API Endpoint URL</Label>
                          <Input 
                            id="api-url" 
                            placeholder="https://api.example.com/data" 
                            onChange={(e) => handleInputChange('source.config.apiUrl', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="api-key">API Key</Label>
                          <Input 
                            id="api-key" 
                            type="password" 
                            placeholder="Enter your API key"
                            onChange={(e) => handleInputChange('source.config.apiKey', e.target.value)}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="folder" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="folder-path">Folder Path</Label>
                        <Input 
                          id="folder-path" 
                          placeholder="/path/to/folder"
                          onChange={(e) => handleInputChange('source.config.folderPath', e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="watch-folder" 
                          className="rounded"
                          onChange={(e) => handleInputChange('source.config.watchFolder', e.target.checked)}
                        />
                        <Label htmlFor="watch-folder">Watch folder for changes</Label>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {/* Step 3: Define Workflow */}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Define Workflow</h2>
                  <p className="text-muted-foreground">
                    Configure how your data should be processed.
                  </p>
                  
                  <div className="grid gap-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="workflow-name">Workflow Name</Label>
                      <Input 
                        id="workflow-name" 
                        placeholder={`My ${formattedFeature} Workflow`}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="workflow-description">Description</Label>
                      <Input 
                        id="workflow-description" 
                        placeholder="Enter a description for your workflow"
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Processing Options</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="option-1" 
                              className="rounded" 
                              defaultChecked
                              onChange={(e) => handleProcessingOptionChange('autoProcess', e.target.checked)}
                            />
                            <Label htmlFor="option-1">Auto-process new items</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="option-2" 
                              className="rounded" 
                              defaultChecked
                              onChange={(e) => handleProcessingOptionChange('sendNotifications', e.target.checked)}
                            />
                            <Label htmlFor="option-2">Send notifications</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="option-3" 
                              className="rounded"
                              onChange={(e) => handleProcessingOptionChange('archiveProcessed', e.target.checked)}
                            />
                            <Label htmlFor="option-3">Archive processed items</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Output Format</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="format-1" 
                              name="output-format" 
                              defaultChecked
                              onChange={() => handleProcessingOptionChange('outputFormat', 'CSV')}
                            />
                            <Label htmlFor="format-1">CSV</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="format-2" 
                              name="output-format"
                              onChange={() => handleProcessingOptionChange('outputFormat', 'PDF')}
                            />
                            <Label htmlFor="format-2">PDF</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="format-3" 
                              name="output-format"
                              onChange={() => handleProcessingOptionChange('outputFormat', 'JSON')}
                            />
                            <Label htmlFor="format-3">JSON</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 4: Save & Schedule */}
              {activeStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Save & Schedule</h2>
                  <p className="text-muted-foreground">
                    Determine when your workflow should run.
                  </p>
                  
                  <div className="grid gap-6 mt-4">
                    <div className="space-y-2">
                      <Label>Schedule Type</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Card 
                          className="border-2 border-primary cursor-pointer card-hover"
                          onClick={() => handleScheduleTypeChange('manual')}
                        >
                          <CardContent className="p-3 text-center">
                            <h3 className="font-medium">Manual</h3>
                            <p className="text-xs text-muted-foreground">
                              Run on demand only
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card 
                          className="border cursor-pointer card-hover"
                          onClick={() => handleScheduleTypeChange('recurring')}
                        >
                          <CardContent className="p-3 text-center">
                            <h3 className="font-medium">Recurring</h3>
                            <p className="text-xs text-muted-foreground">
                              Run on a schedule
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card 
                          className="border cursor-pointer card-hover"
                          onClick={() => handleScheduleTypeChange('triggered')}
                        >
                          <CardContent className="p-3 text-center">
                            <h3 className="font-medium">Triggered</h3>
                            <p className="text-xs text-muted-foreground">
                              Run on events
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Notification Settings</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="notify-success" className="rounded" defaultChecked />
                          <Label htmlFor="notify-success">On successful completion</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="notify-failure" className="rounded" defaultChecked />
                          <Label htmlFor="notify-failure">On failure</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Your workflow is ready to be saved. You can run it manually or according to the schedule you've set.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                {activeStep > 1 ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveStep(activeStep - 1)}
                  >
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}
                
                <Button onClick={completeStep}>
                  {activeStep < 4 ? (
                    "Continue"
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Finish
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WizardPage;
