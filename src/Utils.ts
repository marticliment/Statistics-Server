
import crypto from 'crypto';
import * as http from 'http';
import { Settings } from './Settings.ts';


export class Utils
{
    static UNSAVED_CHANGES = false;

    static ProcessUserId(raw_id: string): string {
        if(raw_id == "") return raw_id;
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

    static GetHeader(req: http.IncomingMessage, key: string) : string
    {
        let value = req.headers[key] || req.headers[key.toLowerCase()];
        if (typeof value !== 'string') return "";
        return value;
    }

    static Authenticate(token: string): boolean
    {
        const hash = crypto.createHash('sha256').update(token + Settings.SALT).digest('hex');
        return hash === Settings.API_KEY_HASH;
    }

    static MapToObject<key_t, value_t>(m: Map<key_t, value_t>)
    {
        return Array.from(m).reduce((obj, [key, value]) => {
          obj[key as any] = value;
          return obj;
        }, {});
    };

}

