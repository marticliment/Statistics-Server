import http from 'http';
import { ActiveUsersDB } from '../database.ts';


export class GenerateReport
{
    static days = 10;
    static activity_period_ms = 1000 * 3600 * 24 * this.days;

    static Respond(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        res.statusCode = 200;

        ActiveUsersDB.Purge(this.activity_period_ms);
        res.write(JSON.stringify({
            active_users: ActiveUsersDB.GetActiveCount(),
            active_versions: ActiveUsersDB.GetVersionPercent(),
        }))
    }
}

