import http from 'http';
import { MainDB } from '../DataBase/MainDB.ts';
import { Utils } from '../Utils.ts';
import { version } from 'os';
import { Ranking_DB } from '../DataBase/Ranking_DB.ts';
import { Counter_DB } from '../DataBase/Counter_DB.ts';


export class PackageOPs
{
    static ProcessPackage_OP(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>, rankings: Ranking_DB[], counter: Counter_DB)
    {
        try 
        {
            const user_id = Utils.ProcessUserId(Utils.GetHeader(req, "clientId"));
            const program_id = Utils.GetHeader(req, "packageId");
            const manager = Utils.GetHeader(req, "managerName");
            const source = Utils.GetHeader(req, "sourceName");
            const result = Utils.GetHeader(req, "operationResult");
                    
            if(Utils.Invalid(user_id) || Utils.Invalid(program_id) || Utils.Invalid(manager) || Utils.Invalid(source))
            {
                res.statusCode = 406;
            }
            else
            {
                counter.Increment_2dim(manager, result, user_id);

                if(result == "SUCCESS")
                {
                    const combined_program_id = Utils.GetProgramUniqueId(program_id, manager, source);
                    rankings.forEach((ranking) => ranking.Increment(combined_program_id, user_id));
                    res.statusCode = 200;
                }
            }
        } 
        catch (err)
        {
            res.statusCode = 500;
            console.error(err);
        }
    }

    static ProcessPackage_NoOp(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>, rankings: Ranking_DB[], counter: Counter_DB)
    {
        try 
        {
            const user_id = Utils.ProcessUserId(Utils.GetHeader(req, "clientId"));
            const program_id = Utils.GetHeader(req, "packageId");
            const manager = Utils.GetHeader(req, "managerName");
            const source = Utils.GetHeader(req, "sourceName");
            const eventSource = Utils.GetHeader(req, "eventSource");
                    
            if(Utils.Invalid(user_id) || Utils.Invalid(program_id) || Utils.Invalid(manager) || Utils.Invalid(source) || Utils.Invalid(eventSource))
            {
                res.statusCode = 406;
            }
            else
            {
                counter.Increment_1dim(eventSource, user_id);

                const combined_program_id = Utils.GetProgramUniqueId(program_id, manager, source);
                rankings.forEach((ranking) => ranking.Increment(combined_program_id, user_id));
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

