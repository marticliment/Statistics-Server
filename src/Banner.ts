import * as http from 'http';
import { Settings } from './Settings.ts';

export class BannedUsers
{
    private static ActivityMap = new Map<string, number>();
    private static Banned = new Set<string>();

    static ResetActivityCount(): void
    {
        this.ActivityMap.clear();
    }

    static PardonBanned(): void
    {
        this.Banned.clear();
    }

    static IsBanned(req: http.IncomingMessage): boolean
    {
        const ip = req.socket.remoteAddress;

        if(ip == null) return true;
        if(this.Banned.has(ip)) return true;
        

        let connCount = (this.ActivityMap.get(ip) ?? 0) + 1;
        this.ActivityMap.set(ip, connCount);
        
        if(connCount > Settings.MAX_REQUESTS_PER_SECOND) 
        {
            this.Banned.add(ip);
            console.warn("User was banned due to too much activity");
            return true;
        }
        
        return false;        
    }
}
