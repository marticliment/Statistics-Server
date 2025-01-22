
import querystring from 'querystring';
import http from 'http';
import { MainDB } from '../database.ts';
import crypto from 'crypto';


export class Utils
{
    static ProcessUserId(raw_id: string): string{
        return crypto.createHash('md5').update(raw_id).digest('base64url')
    }

    static GetProgramUniqueId(id: string, manager: string, source: string): string
    {
        return `${id.replace(":", "¬#")}:${manager.replace(":", "¬#")}:${source.replace(":", "¬#")}`;
    }

    // Returns in the form of [name, manager, source]
    static GetProgramDataFromUniqueId(unique_id: string): (string | number)[]
    {
        try {
            let pieces = unique_id.split(":");
            return [pieces[0].replace("¬#", ":"), pieces[1].replace("¬#", ":"), pieces[2].replace("¬#", ":")]
        } 
        catch (err) {
            console.error(err);
            return ["exception", "exception", "exception"]
        }
    }

    static GetPostParameter(body: string, key: string): string 
    {
        const postParams = querystring.parse(body);
        const raw_id = postParams[key] as string;
        if(typeof(raw_id) !== 'string') throw new Error("Null value");
        return raw_id;
    }

}

