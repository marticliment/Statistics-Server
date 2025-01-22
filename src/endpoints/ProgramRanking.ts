
import querystring from 'querystring';
import http from 'http';
import { MainDB } from '../database.ts';
import crypto from 'crypto';
import { UserActivity } from './UserActivity.ts';
import { Utils } from './Utils.ts';


export class ProgramRanking
{
    static InstallProgram(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        try 
        {
            if(req.method != "POST" || req.headers['content-type'] != 'application/x-www-form-urlencoded') throw new Error("Invalid request type");

            let body = '';
            req.on('data', (chunk) => body += chunk.toString()); 

            req.on('end', () => {
                try {
                    const user_id = Utils.ProcessUserId(Utils.GetPostParameter(body, "identifier"));
                    const program_id = Utils.GetPostParameter(body, "program");
                    const manager = Utils.GetPostParameter(body, "manager");
                    const source = Utils.GetPostParameter(body, "source");
                    const combined_program_id = Utils.GetProgramUniqueId(program_id, manager, source);

                    MainDB.InstallProgram(user_id, combined_program_id);
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

