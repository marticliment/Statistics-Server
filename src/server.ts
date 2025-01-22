import http from 'http';
import { Health } from './endpoints/Health.ts';
import { UserActivity } from './endpoints/UserActivity.ts';
import { MainDB } from './database.ts'
import { GenerateReport } from './endpoints/GenerateReport.ts';
import fs from 'fs';
import { ProgramRanking } from './endpoints/ProgramRanking.ts';
import { ActiveManagers } from './endpoints/ActiveManagers.ts';
import { Settings } from './Settings.ts';

const server = http.createServer((req, res) => {
    try 
    {
        res.setHeader('Content-Type', 'text/json');
        switch(req.url)
        {
            case "/health":
                Health.Respond(req, res);
                break;

            case "/favicon.ico":
                res.statusCode = 404;
                break;

            case "/activity":
                UserActivity.Update(req, res);
                break;

            case "/report":
                GenerateReport.Respond(req, res);
                break;

            case "/install":
                ProgramRanking.Update_Install(req, res);
                break;

            case "/managers":
                ActiveManagers.Update(req, res);
                break;
                
            default:
                if(Settings.IS_DEBUG) 
                {
                    res.setHeader('Content-Type', 'text/html');
                    res.write("<i>ligma</i>");
                    console.error(`unknown endpoint ${req.url}`)
                } else {
                    res.statusCode = 500;
                    res.end();
                }
                break;
        }
        res.end();
    }
    catch (ex)
    {
        console.error(`FATAL EXCEPTION ${ex}`)
    }
});



setInterval(() => MainDB.SaveToDisk(), Settings.SAVE_ON_DISK_INTERVAL * 1000);
setInterval(() => MainDB.ClearRecentlyInstalledCache(), Settings.INSTALL_PROGRAMS_CACHE_CLEAN_INTERVAL* 1000)

console.log("Retrieving data from disk...")
if (!fs.existsSync('data')) fs.mkdirSync('data');
MainDB.LoadFromDisk();
console.log("Retrieved data from disk. Starting server...")

server.listen(Settings.PORT, Settings.HOSTNAME, () => {
    console.log(`Server running at http://${Settings.HOSTNAME}:${Settings.PORT}/`);
});
