import http from 'http';
import { Health } from './Endpoints/Health.ts';
import { UserActivity } from './Endpoints/UserActivity.ts';
import { MainDB } from './DataBase/MainDB.ts'
import { GenerateReport } from './Endpoints/GenerateReport.ts';
import fs from 'fs';
import { Settings } from './Settings.ts';
import { ProgramRanking } from './endpoints/ProgramRanking.ts';

const server = http.createServer((req, res) => {
    try 
    {
        // TODO: Prevent API abuse
        res.setHeader('Content-Type', 'text/json');
        switch(req.url)
        {
            // Check that the server is alive
            case "/moo":
                Health.Respond(req, res);
                break;



            // Registers an user as active, and sets some values.
            case "/activity":
                UserActivity.Update(req, res);
                break;

            // Registers a program as installed
            case "/install":
                ProgramRanking.Update_Install(req, res);
                break;

            
            
            // Generates a report of the current server data
            case "/report":
                GenerateReport.Respond(req, res);
                break;

            default:
                if(Settings.IS_DEBUG) 
                {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/html');
                    res.write("<i>ligma</i>");
                    console.error(`unknown endpoint ${req.url}`)
                }
                else
                {
                    res.statusCode = 307;
                    res.setHeader("Location", Settings.REDIRECT_URL_WHEN_INVALID_ENDPOINT)
                }
                break;
        }
        res.end();
    }
    catch (ex)
    {
        try {
            res.statusCode = 500;
            res.end();
        } catch(err) { }
        console.error(`FATAL EXCEPTION ${ex}`)
    }
});

Settings.ParseAndReadArguments();

if(Settings.IS_DEBUG)
{
    console.error("@");
    console.error("@");
    console.error("@        DEBUG MODE IS ENABLED");
    console.error("@");
    console.error("@");
}

if (!fs.existsSync(Settings.DATA_FOLDER)) 
    fs.mkdirSync(Settings.DATA_FOLDER);

MainDB.LoadFromDisk();

// Purge inactive users.
MainDB.PurgeUsers();

setInterval(() => MainDB.SaveToDisk(), Settings.SAVE_ON_DISK_INTERVAL * 1000);
setInterval(() => MainDB.ClearRankingAdditionCache(), Settings.INSTALL_PROGRAMS_CACHE_CLEAN_INTERVAL* 1000)
setInterval(() => MainDB.PurgeUsers(), Settings.INACTIVE_USER_PURGE_INTERVAL * 1000)

server.listen(Settings.PORT, Settings.HOSTNAME, () => {
    console.log(`Server running at http://${Settings.HOSTNAME}:${Settings.PORT}/`);
});
