
import http from 'http';
import { MainDB } from '../DataBase/MainDB.ts';
import { Utils } from '../Utils.ts';


export class ActiveManagers
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
                    const user_id = Utils.ProcessUserId(Utils.GetPostParameter(body, "identifier"));
                    const magicValue = parseInt(Utils.GetPostParameter(body, "magicValue"));

                    MainDB.ActiveManagers.Set(user_id, magicValue);
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

