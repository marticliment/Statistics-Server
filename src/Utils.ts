
import crypto from 'node:crypto';
import * as http from 'node:http';
import { Settings } from './Settings.ts';

export class OperationType 
{
    static INSTALL: number = 0;
    static DOWNLOAD: number = 1;
    static UPDATE: number = 2;
    static UNINSTALL: number = 3;
}

export class OperationResult 
{
    static SUCCEEDED: number = 0;
    static FAILED: number = 1;
}


export class Utils
{
    static UNSAVED_CHANGES = false;

    static GetProgramUniqueId(id: string, manager: string, source: string): string
    {
        return `${id.replace(":", "¬#")}:${manager.replace(":", "¬#")}:${source.replace(":", "¬#")}`;
    }

    // Returns in the form of [name, manager, source]
    static GetProgramDataFromUniqueId(unique_id: string): string[]
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
        /*return Array.from(m).reduce((obj, [key, value]) => {
          obj[key as any] = value;
          return obj;
        }, {});*/
        return {}
    };

    static Invalid(param: string | number): boolean
    {
        if(typeof param === 'number') 
            return isNaN(param);
        else
            return param.length <= 0 || param.length > 75 
    }

    static IntegerizeIdentifier(id: string): number
    {
        const hash = crypto.createHash('md5').update(id).digest();
        return hash.readInt32BE(0);
    }

    static TestSQLSafety(value: string)
    {
        const unsafePatterns = [
            /--/, // SQL comment
            /;/,  // Statement terminator
            /'/,  // Single quote
            /"/,  // Double quote
            /\b(OR|AND)\b/i, // Logical operators
            /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b/i // SQL keywords
        ];

        for (const pattern of unsafePatterns) {
            if (pattern.test(value)) {
            throw new Error("SQL Injection attempt detected");
            }
        }
    }
}

