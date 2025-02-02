import http from 'http';
import { MainDB } from '../DataBase/MainDB.ts';
import { Utils } from '../Utils.ts';
import { version } from 'os';
import { Ranking_DB } from '../DataBase/Ranking_DB.ts';
import { Counter_DB } from '../DataBase/Counter_DB.ts';


export class CounterAdder
{
    static AddBundle(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>, counter: Counter_DB)
    {
        try 
        {
            const user_id = Utils.ProcessUserId(Utils.GetHeader(req, "clientId"));
            const bundleType = Utils.GetHeader(req, "bundleType");
                    
            if(Utils.Invalid(bundleType) )
            {
                res.statusCode = 406;
            }
            else
            {
                counter.Increment_1dim(bundleType, user_id);
            }
        } 
        catch (err)
        {
            res.statusCode = 500;
            console.error(err);
        }
    }
}

