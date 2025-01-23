import * as fs from 'fs';
import { Utils } from '../Utils.ts';
import { Settings } from '../Settings.ts';
import { ValuePerUser_DB } from './ValuePerUser_DB.ts';
import { Ranking_DB } from './Ranking_DB.ts';

export class MainDB {

    static ActiveUsers = new ValuePerUser_DB<number>("ActiveUsers");
    static ActiveVersions = new ValuePerUser_DB<string>("ActiveVersions");
    static ActiveManagers = new ValuePerUser_DB<number>("ActiveManagers");
    // static ActiveSettings = new ValuePerUser_DB<number>("ActiveSettings");
    
    static InstallsRanking = new Ranking_DB("InstalledRanking", true);

    private static DB_PerUser = [this.ActiveUsers, this.ActiveVersions, this.ActiveManagers/*, ActiveSettings*/];
    private static DB_Rankings = [this.InstallsRanking/*, ActiveSettings*/];

    static RegisterUser(identifier: string, date: Date, version: string) 
    {        
        this.ActiveUsers.Set(identifier, date.getTime());
        this.ActiveVersions.Set(identifier, version);

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

    static LoadFromDisk() {
        try 
        {
            this.DB_PerUser.forEach((db) => db.LoadFromDisk())
            this.DB_Rankings.forEach((db) => db.LoadFromDisk())
        } 
        catch (err) 
        {
            console.error(`Could not load data from disk due to ${err}`);
        }
    }

    static SaveToDisk() 
    {
        try {
            this.DB_PerUser.forEach((db) => db.SaveToDisk())
            this.DB_Rankings.forEach((db) => db.SaveToDisk())
        } 
        catch (err)
        {
            console.error(`Could not save data to disk due to ${err}`);
        }
    }

}