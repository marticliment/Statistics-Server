import http from 'http';
import { Health } from './Endpoints/Health.ts';
import { UserActivity } from './Endpoints/UserActivity.ts';
import { MainDB } from './DataBase/MainDB.ts'
import { GenerateReport } from './Endpoints/GenerateReport.ts';
import fs from 'fs';
import { ProgramRanking } from './Endpoints/ProgramRanking.ts';
import { ActiveManagers } from './Endpoints/ActiveManagers.ts';
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
                    res.statusCode = 404;
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
