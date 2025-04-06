
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AIConfigState, AIModelConfig } from '@/types';

interface AIConfigDialogProps {
  config: AIConfigState;
  onUpdateConfig: (config: AIConfigState) => void;
}

const AIConfigDialog: React.FC<AIConfigDialogProps> = ({ config, onUpdateConfig }) => {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [localConfig, setLocalConfig] = React.useState<AIConfigState>(config);

  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleInputChange = (provider: keyof AIConfigState, field: keyof AIModelConfig, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onUpdateConfig(localConfig);
    setOpen(false);
    toast({
      title: "Configuration updated",
      description: "Your AI model configuration has been saved.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Configure AI Models</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>AI Model Configuration</DialogTitle>
          <DialogDescription>
            Enter your API keys for different AI models to use for project suggestions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {Object.entries(localConfig).map(([provider, settings]) => (
            <div key={provider} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`${provider}-key`} className="text-right">
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </Label>
              <Input
                id={`${provider}-key`}
                value={settings.apiKey}
                onChange={(e) => handleInputChange(provider as keyof AIConfigState, 'apiKey', e.target.value)}
                className="col-span-2"
                type="password"
                placeholder="Enter API key"
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id={`${provider}-enabled`}
                  checked={settings.enabled}
                  onCheckedChange={(checked) => handleInputChange(provider as keyof AIConfigState, 'enabled', checked)}
                />
                <Label htmlFor={`${provider}-enabled`}>Enable</Label>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIConfigDialog;
