import * as fs from 'fs';
import { Utils } from '../Utils.ts';
import { Settings } from '../Settings.ts';
import { ValuePerUser_DB } from './ValuePerUser_DB.ts';
import { Ranking_DB } from './Ranking_DB.ts';
import { Counter_DB } from './Counter_DB.ts';

export class MainDB {
    // ------------------------------------------------

    static ActiveUsers = new ValuePerUser_DB<number>("ActiveUsers");
    static ActiveVersions = new ValuePerUser_DB<string>("ActiveVersions");
    static ActiveManagers = new ValuePerUser_DB<number>("ActiveManagers");
    static ActiveSettings = new ValuePerUser_DB<number>("ActiveSettings");
    static ActiveLanguages = new ValuePerUser_DB<string>("ActiveLanguages");
    
    // ------------------------------------------------

    static PopularRanking = new Ranking_DB("PopularRanking", true);
    static InstallsRanking = new Ranking_DB("InstalledRanking", true);
    static UninstalledRanking = new Ranking_DB("UninstallsRanking", true);

    // ------------------------------------------------

    static ImportedBundles = new Counter_DB("ImportedBundles", 1)
    static ExportedBundles = new Counter_DB("ExportedBundles", 1)
    
    static InstallCount = new Counter_DB("InstallOperations", 2)
    static InstallReason = new Counter_DB("PkgInstallReasons", 1)
    static DownloadCount = new Counter_DB("DownloadOperations", 2)
    static UpdateCount = new Counter_DB("UpdateOperations", 2)
    static UninstallCount = new Counter_DB("UninstallOperations", 2)

    static ShownPackageDetails = new Counter_DB("ShownPackageDetails", 1)
    static SharedPackages = new Counter_DB("SharedPackages", 1)

    // ------------------------------------------------

    private static DB_PerUser = [this.ActiveUsers, this.ActiveVersions, this.ActiveManagers, this.ActiveSettings, this.ActiveLanguages];
    private static DB_Rankings = [this.InstallsRanking, this.UninstalledRanking, this.PopularRanking];
    private static DB_Counters = [this.ImportedBundles, this.ExportedBundles, this.InstallCount, this.InstallReason, 
        this.DownloadCount, this.UpdateCount, this.UninstallCount, this.ShownPackageDetails, this.SharedPackages];



    static UpdateUser(identifier: string, date: Date, version: string, activeManagers: number, activeSettings: number, language: string) 
    {        
        this.ActiveUsers.Set(identifier, date.getTime());
        this.ActiveVersions.Set(identifier, version);
        this.ActiveManagers.Set(identifier, activeManagers);
        this.ActiveSettings.Set(identifier, activeSettings);
        this.ActiveLanguages.Set(identifier, language);
    }

    static PurgeUsers() {
        const tenDaysAgo = (new Date()).getTime() - (Settings.USER_ACTIVITY_PERIOD * 1000);
        this.ActiveUsers.Data.forEach((date, identifier) => {
            if (date < tenDaysAgo) {
                console.info(`Deleting identifier ${identifier} from DB due to inactivity`);
                this.DB_PerUser.forEach((setting) => setting.Delete(identifier));
            }
        });
    }

    static ClearRankingAdditionCache(): void
    {
        this.DB_Rankings.forEach((db) => db.ClearRecentAdditionsList());
    }

    static LoadFromDisk() 
    {
        try 
        {
            this.DB_PerUser.forEach((db) => db.LoadFromDisk())
            this.DB_Rankings.forEach((db) => db.LoadFromDisk())
            this.DB_Counters.forEach((db) => db.LoadFromDisk())
        } 
        catch (err) 
        {
            console.error(`Could not load data from disk due to ${err}`);
        }
    }

    static SaveToDisk() 
    {
        if(!Utils.UNSAVED_CHANGES) return;

        try 
        {
            if(Settings.IS_DEBUG) console.log("Saving server state to disk...")
            this.DB_PerUser.forEach((db) => db.SaveToDisk())
            this.DB_Rankings.forEach((db) => db.SaveToDisk())
            this.DB_Counters.forEach((db) => db.SaveToDisk())
            Utils.UNSAVED_CHANGES = false;
        } 
        catch (err)
        {
            console.error(`Could not save data to disk due to ${err}`);
        }
    }

    static GenerateReport(rank_size: number): object
    {
        // MainDB.PurgeUsers();
        let avgTime = MainDB.ActiveUsers.GetReport_Average();
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
        }
    } 

    static GenerateRankings(rank_size: number): object
    {
        return {
            timestamp_utc_seconds: Math.floor(new Date().getTime() / 1000),
            popular: this.PopularRanking.GetProgramRanking(rank_size),
            installed: this.InstallsRanking.GetProgramRanking(rank_size),
            uninstalled: this.UninstalledRanking.GetProgramRanking(rank_size),
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