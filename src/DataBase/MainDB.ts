import * as fs from 'node:fs';
import { Database } from "bun:sqlite";

import { OperationResult, OperationType, Utils } from '../Utils.ts';
import { Settings } from '../Settings.ts';


export class MainDB {

    static DB = new Database(`${Settings.DATA_FOLDER}/database.db`);

    static UpdateUser(
        identifier: string, 
        version: string, 
        activeManagers: number, 
        activeSettings: number, 
        language: string) 
    {
        let intIdentifier = Utils.IntegerizeIdentifier(identifier);
        Utils.TestSQLSafety(version);
        Utils.TestSQLSafety(language);

        this.DB.exec(
            `INSERT OR REPLACE INTO Users (Identifier, LastConnection, ClientVersion, ActiveSettings, ActiveManagers, Language) 
             VALUES (${intIdentifier}, ${Date.now()}, '${version}', '${activeSettings}', '${activeManagers}', '${language}');`
        );
    }

    static AddOperation(
        clientVersion: string,
        packageId: string,
        packageSource: string,
        packageManager: string,
        operationType: number,
        operationResult: number,
        operationReferral: string,
    )
    {
        Utils.TestSQLSafety(packageId);
        Utils.TestSQLSafety(packageSource);
        Utils.TestSQLSafety(packageManager);
        Utils.TestSQLSafety(clientVersion);
        Utils.TestSQLSafety(operationReferral);

        this.DB.exec(
            `INSERT INTO Operations (PackageId, PackageSource, PackageManager, OperationType, 
                OperationResult, ClientVersion, OperationReferral, EventCount) 
             VALUES ('${packageId}', '${packageSource}', '${packageManager}', ${operationType}, 
                '${operationResult}', '${clientVersion}', '${operationReferral}', 1)
             ON CONFLICT(PackageId, PackageSource, PackageManager, OperationType, 
                OperationResult, ClientVersion, OperationReferral) 
             DO UPDATE SET EventCount = EventCount + 1;`
        );
    }

    static IncrementCounter(key: string, subkey: string)
    {
        Utils.TestSQLSafety(key);
        Utils.TestSQLSafety(subkey);

        this.DB.exec(
            `INSERT INTO RawCounters (Key, SubKey, Value) 
             VALUES ('${key}', '${subkey}', 1) 
             ON CONFLICT(Key, SubKey) 
             DO UPDATE SET Value = Value + 1;`
        );
    }

    static PurgeUsers() {
        /*const tenDaysAgo = (new Date()).getTime() - (Settings.USER_ACTIVITY_PERIOD * 1000);
        this.ActiveUsers.Data.forEach((date, identifier) => {
            if (date < tenDaysAgo) {
                console.info(`Deleting identifier ${identifier} from DB due to inactivity`);
                this.DB_PerUser.forEach((setting) => setting.Delete(identifier));
            }
        });*/
    }

    static ClearRankingAdditionCache(): void
    {
        //this.DB_Rankings.forEach((db) => db.ClearRecentAdditionsList());
    }

    static GenerateReport(rank_size: number): object
    {
        return {};
        // MainDB.PurgeUsers();
        /*let avgTime = MainDB.ActiveUsers.GetReport_Average();
        if(avgTime != 0) avgTime = (new Date().getTime() - avgTime)/1000;
        else avgTime = -1;

        return {
            timestamp_utc_seconds: Math.floor(new Date().getTime() / 1000),
            active_users: this.ActiveUsers.Size(),
            avg_last_ping_timeDelta: avgTime,
            active_versions: this.ActiveVersions.GetReport_ByShareMap(),
            active_languages: this.ActiveLanguages.GetReport_ByShareMap(),
            active_managers: this.ActiveManagers.GetReport_ByBitMask(),
            active_settings: this.ActiveSettings.GetReport_ByBitMask(),
            
            popular_ranking: this.PopularRanking.GetProgramRanking(rank_size),
            installed_ranking: this.InstallsRanking.GetProgramRanking(rank_size),
            uninstalled_ranking: this.UninstalledRanking.GetProgramRanking(rank_size),

            imported_bundles: this.ImportedBundles.GetReport_ByShareMap(),
            exported_bundles: this.ExportedBundles.GetReport_ByShareMap(),
            install_count: this.InstallCount.GetReport_ByShareMap(),
            install_reason: this.InstallReason.GetReport_ByShareMap(),
            download_count: this.DownloadCount.GetReport_ByShareMap(),
            update_count: this.UpdateCount.GetReport_ByShareMap(),
            uninstall_count: this.UninstallCount.GetReport_ByShareMap(),
            shown_package_details: this.ShownPackageDetails.GetReport_ByShareMap(),
            shared_packages: this.SharedPackages.GetReport_ByShareMap(),
        }*/
    } 

    static GenerateRankings(rank_size: number): object
    {
        return {
            timestamp_utc_seconds: Math.floor(new Date().getTime() / 1000),
            //popular: this.PopularRanking.GetProgramRanking(rank_size),
            //installed: this.InstallsRanking.GetProgramRanking(rank_size),
            //uninstalled: this.UninstalledRanking.GetProgramRanking(rank_size),
        }
    } 

    static SaveResultsIfFlagSet()
    {
        try {
            const flagPath = `${Settings.FLAGS_FOLDER}/${Settings.SAVE_RESULTS_FLAG}`;
            if(fs.existsSync(flagPath))
            {            
                fs.unlinkSync(flagPath);
                let contents: string = JSON.stringify(this.GenerateReport(15));
                const fileName = `${Math.floor(new Date().getTime() / 1000)}.json`;
                const filePath = `${Settings.RESULTS_FOLDER}/${fileName}`;
                // console.log(`Saving file ${filePath}`);
                fs.writeFileSync(filePath, contents);
            }
        } 
        catch (e)
        {
            console.error(`Failed to save results file due to ${e}`);
        }
    }

    static SaveRankingsIfFlagSet()
    {
        try {
            const flagPath = `${Settings.FLAGS_FOLDER}/${Settings.SAVE_RANKINGS_FLAG}`;
            if(fs.existsSync(flagPath))
            {            
                fs.unlinkSync(flagPath);
                let contents: string = JSON.stringify(this.GenerateRankings(50));
                const fileName = `LiveRanking.json`;
                const filePath = `${Settings.RESULTS_FOLDER}/${fileName}`;
                // console.log(`Saving file ${filePath}`);
                fs.writeFileSync(filePath, contents);
            }
        } 
        catch (e)
        {
            console.error(`Failed to save results file due to ${e}`);
        }
    }

}