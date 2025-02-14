import http from 'http';
import { MainDB } from '../DataBase/MainDB.ts';
import { Utils } from '../Utils.ts';


export class GenerateReport
{
    // static days = 10;
    // static activity_period_ms = 1000 * 3600 * 24 * this.days;

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
            res.write(JSON.stringify(MainDB.GenerateReport(10)))
        }
    }
}

