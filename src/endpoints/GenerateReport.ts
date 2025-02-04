import http from 'http';
import { MainDB } from '../DataBase/MainDB.ts';
import { Utils } from '../Utils.ts';


export class GenerateReport
{
    // static days = 10;
    // static activity_period_ms = 1000 * 3600 * 24 * this.days;

    static Respond(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        res.statusCode = 200;

        const apiKey = Utils.GetHeader(req, 'apiKey');
        if(apiKey == "")
        {
            res.statusCode = 406;
        }
        else if (!Utils.Authenticate(apiKey))
        {
            res.statusCode = 403;
        }
        else
        {
            // MainDB.PurgeUsers();
            let avgTime = MainDB.ActiveUsers.GetReport_Average();
            if(avgTime != 0) avgTime = (new Date().getTime() - avgTime)/1000;
            else avgTime = -1;

            res.write(JSON.stringify({
                active_users: MainDB.ActiveUsers.Size(),
                avg_last_ping_timeDelta: avgTime,
                active_versions: MainDB.ActiveVersions.GetReport_ByShareMap(),
                active_languages: MainDB.ActiveLanguages.GetReport_ByShareMap(),
                active_managers: MainDB.ActiveManagers.GetReport_ByBitMask(),
                active_settings: MainDB.ActiveSettings.GetReport_ByBitMask(),
                
                popular_ranking: MainDB.PopularRanking.GetProgramRanking(10),
                installed_ranking: MainDB.InstallsRanking.GetProgramRanking(10),
                uninstalled_ranking: MainDB.UninstalledRanking.GetProgramRanking(10),

                imported_bundles: MainDB.ImportedBundles.GetReport_ByShareMap(),
                exported_bundles: MainDB.ExportedBundles.GetReport_ByShareMap(),
                install_count: MainDB.InstallCount.GetReport_ByShareMap(),
                install_reason: MainDB.InstallReason.GetReport_ByShareMap(),
                download_count: MainDB.DownloadCount.GetReport_ByShareMap(),
                update_count: MainDB.UpdateCount.GetReport_ByShareMap(),
                uninstall_count: MainDB.UninstallCount.GetReport_ByShareMap(),
                shown_package_details: MainDB.ShownPackageDetails.GetReport_ByShareMap(),
                shared_packages: MainDB.SharedPackages.GetReport_ByShareMap(),
            }))
        }
    }
}

