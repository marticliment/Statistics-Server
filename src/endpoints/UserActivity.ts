
import querystring from 'querystring';
import http from 'http';
import { ActiveUsersDB } from '../database.ts';
import crypto from 'crypto';


export class UserActivity
{
    static AddUser(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        try 
        {
            if(req.method != "POST" || req.headers['content-type'] != 'application/x-www-form-urlencoded') throw new Error("Invalid request type");

            let body = '';
            req.on('data', (chunk) => body += chunk.toString()); 

            req.on('end', () => {
                try {
                    const postParams = querystring.parse(body);
                    const raw_id = postParams["identifier"] as string;
                    if(typeof(raw_id ) !== 'string') throw new Error("Null identifier");
                    const id = crypto.createHash('md5').update(raw_id).digest('hex');

                    const version = postParams["version"] as string;
                    if(typeof(version) !== 'string') throw new Error("Null version");
                    
                    ActiveUsersDB.Add(id, new Date(), version);
                    res.statusCode = 200;
                    res.end();
                } 
                catch (err)
                {
                    res.statusCode = 500;
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

