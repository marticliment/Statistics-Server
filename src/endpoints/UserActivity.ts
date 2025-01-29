
import http from 'http';
import { MainDB } from '../DataBase/MainDB.ts';
import { Utils } from '../Utils.ts';


export class UserActivity
{
    static Update(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        try 
        {
            const id = Utils.ProcessUserId(Utils.GetHeader(req, "clientId"));                    
            const version = Utils.GetHeader(req, "clientVersion");
            const activeManagers = parseInt(Utils.GetHeader(req, "activeManagers"));
            const activeSettings = parseInt(Utils.GetHeader(req, "activeSettings"));
            const language = Utils.GetHeader(req, "language");

            if(Utils.Invalid(id) || Utils.Invalid(version) || Utils.Invalid(activeManagers) || 
                Utils.Invalid(activeSettings) || Utils.Invalid(language))
            {
                res.statusCode = 406;
            }
            else
            {
                MainDB.UpdateUser(id, new Date(), version, activeManagers, activeSettings, language);
                res.statusCode = 200;
            }
        } 
        catch (err)
        {
            res.statusCode = 500;
            console.error(err);
        }
    }
}

