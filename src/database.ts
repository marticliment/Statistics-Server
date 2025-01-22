import * as fs from 'fs';
import { Utils } from './endpoints/Utils.ts';
import { Settings } from './Settings.ts';

export class MainDB {
    private static activeUsers: Map<string, number> = new Map<string, number>();
    private static activeVersions: Map<string, string> = new Map<string, string>();
    
    private static recentlyInstalled: Map<string, Set<string>> = new Map<string, Set<string>>(); // volatile
    private static installedRanking: Map<string, number> = new Map<string, number>();

    private static activeManagers: Map<string, number> = new Map<string, number>();

    static RegisterUser(identifier: string, date: Date, version: string) {
        this.activeUsers.set(identifier, date.getTime());
        this.activeVersions.set(identifier, version);
    }

    static Purge() {
        const tenDaysAgo = (new Date()).getTime() - (Settings.USER_ACTIVITY_PERIOD * 1000);
        this.activeUsers.forEach((date, identifier) => {
            if (date < tenDaysAgo) {
                this.activeUsers.delete(identifier);
                this.activeVersions.delete(identifier);
                this.activeManagers.delete(identifier);
                console.info(`Deleting user ${identifier} from the active list`)
            }
        });
    }

    static InstallProgram(identifier: string, programId: string)
    {
        // Check if the program has already been installed by the user
        if(!this.activeUsers.has(identifier)) { console.warn(`User ${identifier} has not been marked as active`); return; } ;
        if(this.recentlyInstalled.get(identifier)?.has(programId) ?? false) { console.warn(`User ${identifier} already installed this program`); return; };

        // Add the program to the list to prevent spamming
        if(this.recentlyInstalled.get(identifier) == null) 
            this.recentlyInstalled.set(identifier, new Set<string>);
        this.recentlyInstalled.get(identifier)?.add(programId);
        
        // Increase by one the install ranking of this program
        this.installedRanking.set(programId, this.installedRanking.get(programId) ?? 0 + 1);
    }

    static ClearRecentlyInstalledCache()
    {
        console.log("Cleaning RecentlyInstalled cache");
        this.recentlyInstalled.clear();
    }


    static GetActiveCount() {
        return this.activeUsers.size;
    }

    static GetVersionPercent(): Map<string, number>
    {
        let result = new Map<string, number>();

        this.activeVersions.forEach((version, identifier) => {
            result.set(version, (result.get(version) ?? 0) + 1);
        });

        result.forEach((count, version) => {
            result[version] = (count*100.0)/this.activeVersions.size;
        });

        return result;
    }


    static SetActiveManagers(identifier: string, magicValue: number)
    {
        // Check if the program has already been installed by the user
        if(!this.activeUsers.has(identifier)) { console.warn(`User ${identifier} has not been marked as active`); return; } ;

        this.activeManagers.set(identifier, magicValue);
    }

    static GetActiveManagerPercent(): number[]
    {
        // 32 possible values
        let result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        // For each user, analyze enabled managers
        this.activeManagers.forEach((magicValue, identifier) => {
            for (let i = 0; i < 32; i++) if (magicValue & (1 << i)) result[i]++;
        });

        // Calculate percent
        for(let i = 0; i < 32; i++) result[i] = (result[i]*100) / this.activeManagers.size;

        return result;
    }


    static GetProgramRanking(max_amount: number): (string | number)[][]
    {
        let sortedRanking = Array.from(this.installedRanking.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, Math.min(this.installedRanking.size, max_amount));

        return sortedRanking.map(([programId, count]) => Utils.GetProgramDataFromUniqueId(programId).concat([count]));
    }

    static LoadFromDisk() {
        try {
            if (fs.existsSync('data/ActiveUsers.json')) {
                this.activeUsers.clear();
                const data = fs.readFileSync('data/ActiveUsers.json', 'utf-8');
                const parsedData: { [key: string]: number } = JSON.parse(data);
                Object.entries(parsedData).forEach(([identifier, date]) => {
                    this.activeUsers.set(identifier, date);
                });
                console.log(" - activeUsers was loaded from data/ActiveUsers.json");
            }
            
            if (fs.existsSync('data/ActiveVersions.json')) {
                this.activeVersions.clear();
                const data = fs.readFileSync('data/ActiveVersions.json', 'utf-8');
                const parsedData: { [key: string]: string } = JSON.parse(data);
                Object.entries(parsedData).forEach(([identifier, version]) => {
                    this.activeVersions.set(identifier, version);
                });
                console.log(" - activeVersions was loaded from data/ActiveVersions.json");
            }

            if (fs.existsSync('data/InstallRanking.json')) {
                this.installedRanking.clear();
                const data = fs.readFileSync('data/InstallRanking.json', 'utf-8');
                const parsedData: { [key: string]: number } = JSON.parse(data);
                Object.entries(parsedData).forEach(([programId, count]) => {
                    this.installedRanking.set(programId, count);
                });
                console.log(" - installedRanking was loaded from data/InstallRanking.json");
            }
            
            if (fs.existsSync('data/ActiveManagers.json')) {
                this.activeManagers.clear();
                const data = fs.readFileSync('data/ActiveManagers.json', 'utf-8');
                const parsedData: { [key: string]: number } = JSON.parse(data);
                Object.entries(parsedData).forEach(([identifier, magicValue]) => {
                    this.activeManagers.set(identifier, magicValue);
                });
                console.log(" - activeManagers was loaded from data/ActiveManagers.json");
            }
        } catch (err) {
            console.warn(`Could not load ActiveUsers from disk due to ${err}`);
        }
    }

    static SaveToDisk() {
        console.log('Saving data to disk...');
        const act_data: { [key: string]: number } = {};
        this.activeUsers.forEach((date, identifier) => {
            act_data[identifier] = date;
        });
        fs.writeFileSync('data/ActiveUsers.json', JSON.stringify(act_data, null, 4), 'utf-8');
        console.log(" - activeUsers was saved to data/ActiveUsers.json");

        const ver_data : { [key: string]: string } = {};
        this.activeVersions.forEach((version, identifier) => {
            ver_data[identifier] = version;
        });
        fs.writeFileSync('data/ActiveVersions.json', JSON.stringify(ver_data, null, 4), 'utf-8');
        console.log(" - activeVersions was saved to data/ActiveVersions.json");

        const installed_ranking: { [key: string]: number } = {};
        this.installedRanking.forEach((count, programId) => {
            installed_ranking[programId] = count;
        });
        fs.writeFileSync('data/InstallRanking.json', JSON.stringify(installed_ranking, null, 4), 'utf-8');
        console.log(" - installedRanking was saved to data/InstallRanking.json");
        
        const active_managers: { [key: string]: number } = {};
        this.activeManagers.forEach((magicValue, identifier) => {
            active_managers[identifier] = magicValue;
        });
        fs.writeFileSync('data/ActiveManagers.json', JSON.stringify(active_managers, null, 4), 'utf-8');
        console.log(" - activeManagers was saved to data/ActiveManagers.json");
        console.log('Data saved to disk.');
    }

}