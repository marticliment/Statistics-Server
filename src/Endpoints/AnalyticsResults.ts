import http from 'node:http';
import { MainDB } from '../DataBase/MainDB.ts';
import { Utils } from '../Utils.ts';
import { Settings } from '../Settings.ts';
import fs from 'node:fs';
import path from 'node:path';


export class PublicResults
{
    // static days = 10;
    // static activity_period_ms = 1000 * 3600 * 24 * this.days;

    static ReturnAvailableResults(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        try 
        {
            const apiKey = Utils.GetHeader(req, 'apiKey');
            if(apiKey == "")
            {
                res.statusCode = 406;
                return;
            }
            
            if (!Utils.Authenticate(apiKey))
            {
                res.statusCode = 403;
                return;
            }

            const results_dir = Settings.RESULTS_FOLDER;
            const files = fs.readdirSync(results_dir);
            const jsonFiles = files.filter(file => path.extname(file) === '.json');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            const resultIds = jsonFiles.map(file => parseInt(file.replace(".json", ""))).filter(id => !isNaN(id));
            res.end(JSON.stringify(resultIds));
        } 
        catch (e)
        {
            console.error("Could not read available results files due to " + e);
            res.statusCode = 500;
        }
    }

    static GetReportFromId(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        try 
        {
            const apiKey = Utils.GetHeader(req, 'apiKey');
            if(apiKey == "")
            {
                res.statusCode = 406;
                return;
            }
            
            if (!Utils.Authenticate(apiKey))
            {
                res.statusCode = 403;
                return;
            }

            // Check if the supplied parameters are OK
            let reportId = parseInt(Utils.GetHeader(req, "reportId"));
            if(Utils.Invalid(reportId))
            {
                res.statusCode = 406;
                return;
            }

            if(reportId == -1)
            {
                const results_dir = Settings.RESULTS_FOLDER;
                const files = fs.readdirSync(results_dir);
                const jsonFiles = files.filter(file => path.extname(file) === '.json');
                const resultIds = jsonFiles.map(file => parseInt(file.replace(".json", ""))).filter(id => !isNaN(id));
                reportId = Math.max(...resultIds);
            }
            
            // Check if the requested file exists
            const file = `${Settings.RESULTS_FOLDER}/${reportId}.json`;
            if(!fs.existsSync(file))
            {
                res.statusCode = 404;
                return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(fs.readFileSync(file));
        } 
        catch (e)
        {
            console.error("Could not get report due to " + e);
            res.statusCode = 500;
        }
    }

    static GenerateReport_CurrentInstant(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        res.statusCode = 200;

        const apiKey = Utils.GetHeader(req, 'apiKey');
        if(apiKey == "")
        {
            res.statusCode = 406;
            return;
        }
        
        if (!Utils.Authenticate(apiKey))
        {
            res.statusCode = 403;
            return;
        }
        
        
        res.write(JSON.stringify(MainDB.GenerateReport(10)))
    }
}
