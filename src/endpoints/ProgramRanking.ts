import http from 'http';
import { MainDB } from '../DataBase/MainDB.ts';
import { Utils } from '../Utils.ts';
import { version } from 'os';


export class ProgramRanking
{
    static Update_Install(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        try 
        {
            const user_id = Utils.ProcessUserId(Utils.GetHeader(req, "clientId"));
            const program_id = Utils.GetHeader(req, "packageId");
            const manager = Utils.GetHeader(req, "managerName");
            const source = Utils.GetHeader(req, "sourceName");
                    
            if(Utils.Invalid(user_id) || Utils.Invalid(program_id) || Utils.Invalid(manager) || Utils.Invalid(source))
            {
                res.statusCode = 406;
            }
            else
            {
                const combined_program_id = Utils.GetProgramUniqueId(program_id, manager, source);
                MainDB.InstallsRanking.Increment(combined_program_id, user_id);
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

