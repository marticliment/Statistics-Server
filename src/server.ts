import http from 'node:http';
import { Health } from './Endpoints/Health.ts';
import { UserActivity } from './Endpoints/UserActivity.ts';
import { MainDB } from './DataBase/MainDB.ts'
import fs from 'node:fs';
import { Settings } from './Settings.ts';
import { BannedUsers } from './Banner.ts';
import { PackageOPs } from './Endpoints/ProgramRanking.ts';
import { CounterAdder } from './Endpoints/CounterAdder.ts';
import { PublicResults as StatisticsResults } from './Endpoints/AnalyticsResults.ts';
import { OperationType } from './Utils.ts';

const server = http.createServer((req, res) => {
    try {
        if (BannedUsers.IsBanned(req)) {
            res.statusCode = 429; // Too Many Requests
            res.end();
            return;
        }
        

        // TODO: Prevent API abuse
        res.setHeader('Content-Type', 'text/json');
        switch (req.url) {
            // Check that the server is alive
            case "/moo":
                Health.Respond(req, res);
                break;

            // Registers an user as active, and sets some values.
            case "/activity":
                UserActivity.Update(req, res);
                break;

            case "/package/install":
                PackageOPs.OperationResult(req, res, OperationType.INSTALL);
                break;

            case "/package/download":
                PackageOPs.OperationResult(req, res, OperationType.DOWNLOAD);
                break;

            case "/package/update":
                PackageOPs.OperationResult(req, res, OperationType.UPDATE);
                break;

            case "/package/uninstall":
                PackageOPs.OperationResult(req, res, OperationType.UNINSTALL);
                break;

            case "/package/details":
                CounterAdder.PackageDetails(req, res);
                break;

            case "/package/share":
                CounterAdder.SharedPackage(req, res);
                break;
                
            case "/bundles/export":
                CounterAdder.ExportBundle(req, res);
                break;

            case "/bundles/import":
                CounterAdder.ImportBundle(req, res);
                break;


            
            // Gets the report for a given id
            case "/report/get-public":
                StatisticsResults.GetReportFromId(req, res);
                break;
            
            // Lists the available reports
            case "/report/list-public":
                StatisticsResults.ReturnAvailableResults(req, res);
                break;


            // Generates a report of the current server data
            case "/report/get-current":
                StatisticsResults.GenerateReport_CurrentInstant(req, res).finally(() => res.end());
                return;
                break;

            default:
                if (Settings.IS_DEBUG) {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/html');
                    res.write("<i>ligma</i>");
                    console.error(`unknown endpoint ${req.url}`)
                }
                else {
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
        } catch (err) { }
        console.error(`FATAL EXCEPTION ${ex}`)
    }
});

Settings.ParseAndReadArguments();

if (Settings.IS_DEBUG) {
    console.error("@");
    console.error("@");
    console.error("@        DEBUG MODE IS ENABLED");
    console.error("@");
    console.error("@");
}

if (!fs.existsSync(Settings.DATA_FOLDER))
    fs.mkdirSync(Settings.DATA_FOLDER);

if (!fs.existsSync(Settings.RESULTS_FOLDER))
    fs.mkdirSync(Settings.RESULTS_FOLDER);

if (!fs.existsSync(Settings.FLAGS_FOLDER))
    fs.mkdirSync(Settings.FLAGS_FOLDER);

// Purge inactive users.
MainDB.PurgeUsers();

setInterval(() => MainDB.ClearRankingAdditionCache(), Settings.INSTALL_PROGRAMS_CACHE_CLEAN_INTERVAL * 1000);
setInterval(() => MainDB.PurgeUsers(), Settings.INACTIVE_USER_PURGE_INTERVAL * 1000);
setInterval(() => MainDB.SaveResultsIfFlagSet(), 10 * 1000);
setInterval(() => MainDB.SaveRankingsIfFlagSet(), 10 * 1000);

setInterval(() => BannedUsers.ResetActivityCount(), 1000);
setInterval(() => BannedUsers.PardonBanned(), Settings.USER_BAN_PARDON_TIMEOUT * 1000);

server.listen(Settings.PORT, Settings.HOSTNAME, () => {
    console.log(`Server running at http://${Settings.HOSTNAME}:${Settings.PORT}/`);
});
