import http from 'http';
import { MainDB } from '../database.ts';


export class GenerateReport
{
    static days = 10;
    static activity_period_ms = 1000 * 3600 * 24 * this.days;

    static Respond(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        res.statusCode = 200;

        MainDB.Purge();
        res.write(JSON.stringify({
            active_users: MainDB.ActiveUsers.Size(),
            active_versions: MainDB.ActiveVersions.GetReport_ByShareMap(),
            active_managers: MainDB.ActiveManagers.GetReport_ByBitMask(),
            program_ranking: MainDB.InstallsRanking.GetProgramRanking(10),
        }))
    }
}

