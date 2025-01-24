
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

            if(id == "" || version == "" || isNaN(activeManagers) || isNaN(activeSettings))
            {
                res.statusCode = 406;
            }
            else
            {
                MainDB.UpdateUser(id, new Date(), version, activeManagers, activeSettings);
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

