// @ts-ignore
import http from 'http';
import { Health } from './endpoints/Health.ts';
import { UserActivity } from './endpoints/UserActivity.ts';
import { MainDB } from './database.ts'
import { GenerateReport } from './endpoints/GenerateReport.ts';
import fs from 'fs';
import path from 'path';
import { ProgramRanking } from './endpoints/ProgramRanking.ts';

const hostname = '127.0.0.1';
const port = 3000;

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
                UserActivity.AddUser(req, res);
                break;

            case "/report":
                GenerateReport.Respond(req, res);
                break;

            case "/install":
                ProgramRanking.InstallProgram(req, res);
                break;
                
            default:
                res.setHeader('Content-Type', 'text/html');
                res.write("<i>ligma</i>");
                console.error(`unknown endpoint ${req.url}`)
                break;
        }
        res.end();
    }
    catch (ex)
    {
        console.error(`FATAL EXCEPTION ${ex}`)
    }
});



setInterval(() => MainDB.SaveToDisk(), 10 * 1000);
setInterval(() => MainDB.ClearRecentlyInstalledCache(), 24 * 36000 * 1000)

console.log("Retrieving data from disk...")
if (!fs.existsSync('data')) fs.mkdirSync('data');
MainDB.LoadFromDisk();
console.log("Retrieved data from disk. Starting server...")

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
