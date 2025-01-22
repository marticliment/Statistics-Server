// @ts-ignore
import http from 'http';
import { Health } from './endpoints/Health.ts';
import { UserActivity } from './endpoints/UserActivity.ts';
import { ActiveUsersDB } from './database.ts'
import { GenerateReport } from './endpoints/GenerateReport.ts';
import fs from 'fs';
import path from 'path';

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



setInterval(() => {
    console.log('Saving data to disk');
    ActiveUsersDB.SaveToDisk();
}, 1000);


const dataFolderPath = path.join(__dirname, 'data');
if (!fs.existsSync(dataFolderPath)) fs.mkdirSync(dataFolderPath);
ActiveUsersDB.LoadFromDisk();

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
