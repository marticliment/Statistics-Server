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

    static PopularRanking = new Ranking_DB("PopularRanking", false);
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

}