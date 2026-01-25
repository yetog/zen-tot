import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Server, Database, Cloud, Mic } from 'lucide-react';
import { getApiStatus } from '@/services/api';

export const SystemStatus = () => {
  const status = getApiStatus();
  
  const items = [
    {
      name: 'Backend API',
      enabled: status.hasBackend,
      icon: Server,
      description: status.hasBackend ? 'Connected to IONOS backend' : 'Using local mode',
    },
    {
      name: 'Object Storage',
      enabled: status.hasS3,
      icon: Cloud,
      description: status.hasS3 ? 'IONOS S3 connected' : 'Using browser storage',
    },
    {
      name: 'ElevenLabs TTS',
      enabled: status.hasElevenLabs,
      icon: Mic,
      description: status.hasElevenLabs ? 'Voice synthesis ready' : 'API key not configured',
    },
    {
      name: 'IONOS AI',
      enabled: status.hasIONOS,
      icon: Database,
      description: status.hasIONOS ? 'Model Hub connected' : 'AI features limited',
    },
  ];

  const allConfigured = Object.values(status).every(Boolean);
  const noneConfigured = Object.values(status).every(v => !v);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Server className="h-5 w-5" />
          System Status
          {allConfigured && (
            <Badge variant="default" className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
              Production Ready
            </Badge>
          )}
          {noneConfigured && (
            <Badge variant="secondary" className="ml-auto">
              Demo Mode
            </Badge>
          )}
          {!allConfigured && !noneConfigured && (
            <Badge variant="outline" className="ml-auto border-yellow-500/30 text-yellow-400">
              Partial Setup
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-3 p-2 rounded-lg bg-background/50"
          >
            <div className={`p-1.5 rounded-md ${item.enabled ? 'bg-green-500/20' : 'bg-muted'}`}>
              <item.icon className={`h-4 w-4 ${item.enabled ? 'text-green-400' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{item.name}</span>
                {item.enabled ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            </div>
          </div>
        ))}
        
        {noneConfigured && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mt-4">
            <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
            <div className="text-xs text-yellow-200/80">
              <p className="font-medium mb-1">Running in Demo Mode</p>
              <p>Data is stored locally. To enable full features, configure your backend and API keys. See <code className="bg-black/30 px-1 rounded">docs/ionos-deployment.md</code></p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
