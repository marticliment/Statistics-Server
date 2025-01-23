import http from 'http';
import { MainDB } from '../DataBase/MainDB.ts';
import { Utils } from '../Utils.ts';


export class ProgramRanking
{
    static Update_Install(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        try 
        {
            if(req.method != "POST" || req.headers['content-type'] != 'application/x-www-form-urlencoded') throw new Error("Invalid request type");

            let body = '';
            req.on('data', (chunk) => body += chunk.toString()); 

            req.on('end', () => {
                try {
                    const user_id = Utils.ProcessUserId(Utils.GetPostParameter(body, "clientId"));
                    const program_id = Utils.GetPostParameter(body, "packageId");
                    const manager = Utils.GetPostParameter(body, "managerName");
                    const source = Utils.GetPostParameter(body, "sourceName");
                    
                    const combined_program_id = Utils.GetProgramUniqueId(program_id, manager, source);
                    MainDB.InstallsRanking.Increment(combined_program_id, user_id);
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

