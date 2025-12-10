import { Activity, Wifi, WifiOff } from "lucide-react";

interface HeaderProps {
  totalDevices: number;
  onlineDevices: number;
}

const Header = ({ totalDevices, onlineDevices }: HeaderProps) => {
  const isSystemHealthy = onlineDevices > 0;

  return (
    <header className="glass-card p-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${isSystemHealthy ? 'bg-success glow-success' : 'bg-destructive glow-destructive'}`}>
              <span className="absolute inset-0 rounded-full animate-ping bg-inherit opacity-75" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">IoT Dashboard</h1>
            <p className="text-muted-foreground text-sm">Real-time device monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 glass-card px-4 py-2">
            <Wifi className="w-4 h-4 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Online</p>
              <p className="text-lg font-semibold text-success">{onlineDevices}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 glass-card px-4 py-2">
            <WifiOff className="w-4 h-4 text-destructive" />
            <div>
              <p className="text-xs text-muted-foreground">Offline</p>
              <p className="text-lg font-semibold text-destructive">{totalDevices - onlineDevices}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
