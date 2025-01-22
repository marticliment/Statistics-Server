import http from 'http';
import { MainDB } from '../database.ts';


export class GenerateReport
{
    static days = 10;
    static activity_period_ms = 1000 * 3600 * 24 * this.days;

    static Respond(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        res.statusCode = 200;

        MainDB.Purge(this.activity_period_ms);
        res.write(JSON.stringify({
            active_users: MainDB.GetActiveCount(),
            active_versions: MainDB.GetVersionPercent(),
            active_managers: MainDB.GetActiveManagerPercent(),
            program_ranking: MainDB.GetProgramRanking(10),
        }))
    }
}

