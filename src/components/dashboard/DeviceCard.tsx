import { Cpu, Wifi, WifiOff, Clock } from "lucide-react";

interface DeviceCardProps {
  name: string;
  id: string;
  isOnline: boolean;
  lastSeen: string;
  type: string;
  index: number;
  onClick?: () => void;
  isSelected?: boolean;
}

const DeviceCard = ({ name, id, isOnline, lastSeen, type, index, onClick, isSelected }: DeviceCardProps) => {
  return (
    <div 
      className={`glass-card-hover p-5 opacity-0 animate-fade-in-up cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
      style={{ animationDelay: `${0.1 + index * 0.1}s` }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOnline ? 'bg-success/20' : 'bg-destructive/20'}`}>
            <Cpu className={`w-5 h-5 ${isOnline ? 'text-success' : 'text-destructive'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{id}</p>
          </div>
        </div>
        <div className={`status-dot ${isOnline ? 'bg-success' : 'bg-destructive'}`} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            Status
          </span>
          <span className={`font-medium ${isOnline ? 'text-success' : 'text-destructive'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Last Seen
          </span>
          <span className="text-foreground">{lastSeen}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Type</span>
          <span className="text-foreground px-2 py-0.5 rounded-full bg-muted/50 text-xs">{type}</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
