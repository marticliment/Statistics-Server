import http from 'http';
import { ActiveUsersDB } from '../database.ts';


export class GenerateReport
{
    static activity_period_ms = 5000;

    static Respond(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        res.statusCode = 200;

        ActiveUsersDB.Purge(this.activity_period_ms);
        res.write(JSON.stringify({
            active_users: ActiveUsersDB.GetActiveCount(),
        }))
    }
}

