import http from 'http';
import { MainDB } from '../DataBase/MainDB.ts';
import { Utils } from '../Utils.ts';


export class GenerateReport
{
    static days = 10;
    static activity_period_ms = 1000 * 3600 * 24 * this.days;

    static Respond(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        res.statusCode = 200;

        const apiKey = Utils.GetHeader(req, 'apiKey');
        if(apiKey == "")
        {
            res.statusCode = 406;
        }
        else if (!Utils.Authenticate(apiKey))
        {
            res.statusCode = 403;
        }
        else
        {
            MainDB.PurgeUsers();
            res.write(JSON.stringify({
                active_users: MainDB.ActiveUsers.Size(),
                active_versions: MainDB.ActiveVersions.GetReport_ByShareMap(),
                active_languages: MainDB.ActiveLanguages.GetReport_ByShareMap(),
                active_managers: MainDB.ActiveManagers.GetReport_ByBitMask(),
                active_settings: MainDB.ActiveSettings.GetReport_ByBitMask(),
                program_ranking: MainDB.InstallsRanking.GetProgramRanking(10),
            }))
        }
    }
}

