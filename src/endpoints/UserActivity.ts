
import http from 'http';
import { MainDB } from '../DataBase/MainDB.ts';
import { Utils } from '../Utils.ts';


export class UserActivity
{
    static Update(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        try 
        {
            if(req.method != "POST" || req.headers['content-type'] != 'application/x-www-form-urlencoded') throw new Error("Invalid request type");

            let body = '';
            req.on('data', (chunk) => body += chunk.toString()); 

            req.on('end', () => {
                try {
                    const id = Utils.ProcessUserId(Utils.GetPostParameter(body, "identifier"));                    
                    const version = Utils.GetPostParameter(body, "version");
                    const activeManagers = parseInt(Utils.GetPostParameter(body, "activeManagers"));
                    const activeSettings = parseInt(Utils.GetPostParameter(body, "activeSettings"));

                    MainDB.UpdateUser(id, new Date(), version, activeManagers, activeSettings);
                    res.end();
                } 
                catch (err)
                {
                    console.error(err);
                }
            });

            res.statusCode = 200;
        } 
        catch (err)
        {
            res.statusCode = 500;
            console.error(err);
        }
    }
}

