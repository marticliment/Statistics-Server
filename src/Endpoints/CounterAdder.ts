import http from 'http';
import { MainDB } from '../DataBase/MainDB.ts';
import { Utils } from '../Utils.ts';
import { version } from 'os';


export class CounterAdder
{
    static SharedPackage(
        req: http.IncomingMessage, 
        res: http.ServerResponse<http.IncomingMessage>)
    {
        try 
        {
            const eventSource = Utils.GetHeader(req, "eventSource");
                    
            if(Utils.Invalid(eventSource))
            {
                res.statusCode = 406;
            }
            else
            {
                MainDB.IncrementCounter("sharedPackage", eventSource);
            }
        } 
        catch (err)
        {
            res.statusCode = 500;
            console.error(err);
        }
    }

    static PackageDetails(
        req: http.IncomingMessage, 
        res: http.ServerResponse<http.IncomingMessage>)
    {
        try 
        {
            const eventSource = Utils.GetHeader(req, "eventSource");
                    
            if(Utils.Invalid(eventSource))
            {
                res.statusCode = 406;
            }
            else
            {
                MainDB.IncrementCounter("packageDetails", eventSource);
            }
        } 
        catch (err)
        {
            res.statusCode = 500;
            console.error(err);
        }
    }


    static ExportBundle(
        req: http.IncomingMessage, 
        res: http.ServerResponse<http.IncomingMessage>)
    {
        try 
        {
            const bundleType = Utils.GetHeader(req, "bundleType");
                    
            if(Utils.Invalid(bundleType))
            {
                res.statusCode = 406;
            }
            else
            {
                MainDB.IncrementCounter("exportBundle", bundleType);
            }
        } 
        catch (err)
        {
            res.statusCode = 500;
            console.error(err);
        }
    }
    
    static ImportBundle(
        req: http.IncomingMessage, 
        res: http.ServerResponse<http.IncomingMessage>)
    {
        try 
        {
            const bundleType = Utils.GetHeader(req, "bundleType");
                    
            if(Utils.Invalid(bundleType))
            {
                res.statusCode = 406;
            }
            else
            {
                MainDB.IncrementCounter("importBundle", bundleType);
            }
        } 
        catch (err)
        {
            res.statusCode = 500;
            console.error(err);
        }
    }
}

