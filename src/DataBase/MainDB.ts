import * as fs from 'node:fs';
// import { Database } from "bun:sqlite";
import pkg from 'sqlite3';
const { Database } = pkg;

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

    static async GenerateReport(rank_size: number): Promise<object> {
        const db = this.DB;
        const timestamp_utc_seconds = Math.floor(Date.now() / 1000);

        function getSingleValue(sql: string, params: any[]): Promise<any> {
            return new Promise((resolve, reject) => {
                db.get(sql, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        }

        function getAllRows(sql: string, params: any[] = []): Promise<any[]> {
            return new Promise((resolve, reject) => {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        }

        // Active users in the last USER_ACTIVITY_PERIOD seconds
        const activeUsersRow = await getSingleValue(
            `SELECT COUNT(*) as count FROM Users WHERE LastConnection > ?`,
            [Date.now() - Settings.USER_ACTIVITY_PERIOD * 1000]
        );
        const active_users = activeUsersRow?.count ?? 0;

        // Average last ping time delta (in seconds)
        const avgTimeRow = await getSingleValue(
            `SELECT AVG(LastConnection) as avgTime FROM Users WHERE LastConnection > ?`,
            [Date.now() - Settings.USER_ACTIVITY_PERIOD * 1000]
        );
        let avgTime = avgTimeRow?.avgTime ?? 0;
        if (avgTime !== 0) {
            avgTime = (Date.now() - avgTime) / 1000;
        } else {
            avgTime = -1;
        }

        // Active versions
        const versionsRows = await getAllRows(
            `SELECT ClientVersion, COUNT(*) as count FROM Users GROUP BY ClientVersion`
        );
        const active_versions: Record<string, number> = {};
        for (const row of versionsRows) {
            active_versions[row.ClientVersion] = row.count;
        }

        // Active languages
        const languagesRows = await getAllRows(
            `SELECT Language, COUNT(*) as count FROM Users GROUP BY Language`
        );
        const active_languages: Record<string, number> = {};
        for (const row of languagesRows) {
            active_languages[row.Language] = row.count;
        }

        // Active managers (bitmask)
        const managersRows = await getAllRows(
            `SELECT ActiveManagers FROM Users`
        );
        // Determine the maximum number of bits you want to track, e.g., 32
        const MANAGER_BITS = 32;
        const active_managers: number[] = Array(MANAGER_BITS).fill(0);
        for (const row of managersRows) {
            const value = row.ActiveManagers ?? 0;
            for (let bit = 0; bit < MANAGER_BITS; ++bit) {
                if ((value & (1 << bit)) !== 0) {
                    active_managers[bit]++;
                }
            }
        }

        // Active settings (bitmask)
        const settingsRows = await getAllRows(
            `SELECT ActiveSettings FROM Users`
        );
        const SETTINGS_BITS = 32;
        const active_settings: number[] = Array(SETTINGS_BITS).fill(0);
        for (const row of settingsRows) {
            const value = row.ActiveSettings ?? 0;
            for (let bit = 0; bit < SETTINGS_BITS; ++bit) {
                if ((value & (1 << bit)) !== 0) {
                    active_settings[bit]++;
                }
            }
        }

        // Rankings (top N by EventCount)
        async function getRanking(operationType: number, limit: number): Promise<[string, string, string, number][]> {
            const rows = await getAllRows(
            `SELECT PackageId, PackageSource, PackageManager, SUM(EventCount) as count 
             FROM Operations 
             WHERE OperationType = ? 
             GROUP BY PackageId, PackageSource, PackageManager 
             ORDER BY count DESC 
             LIMIT ?`,
            [operationType, limit]
            );
            return rows.map((row: any) => [
            row.PackageId,
            row.PackageSource,
            row.PackageManager,
            row.count
            ]);
        }

        // Combine installed, downloaded, and updated rankings by summing counts for each [packageId, sourceName, managerName]
        function combineRankings(...rankings: Array<Array<[string, string, string, number]>>): [string, string, string, number][] {
            const combinedMap: Record<string, number> = {};
            for (const ranking of rankings) {
            for (const entry of ranking) {
                const key = `${entry[0]}|${entry[1]}|${entry[2]}`;
                combinedMap[key] = (combinedMap[key] || 0) + entry[3];
            }
            }
            // Convert to array and sort by count descending
            return Object.entries(combinedMap)
            .map(([key, count]) => {
                const [packageId, sourceName, managerName] = key.split('|');
                return [packageId, sourceName, managerName, count] as [string, string, string, number];
            })
            .sort((a, b) => b[3] - a[3])
            .slice(0, rank_size);
        }

        const _installed_ranking = await getRanking(OperationType.INSTALL, rank_size);
        const _downloaded_ranking = await getRanking(OperationType.DOWNLOAD, rank_size);
        const updated_ranking = await getRanking(OperationType.UPDATE, rank_size);
        const uninstalled_ranking = await getRanking(OperationType.UNINSTALL, rank_size);

        const installed_ranking = combineRankings(_installed_ranking, _downloaded_ranking);
        const popular_ranking = combineRankings(installed_ranking, updated_ranking);

        // Helper for share maps
        async function getShareMap(key: string) {
            const rows = await getAllRows(
            `SELECT SubKey, Value FROM RawCounters WHERE Key = ?`,
            [key]
            );
            const map: Record<string, number> = {};
            for (const row of rows) {
            map[row['SubKey']] = row.Value;
            }
            return map;
        }

        // Example share maps (replace with actual keys/columns as needed)
        const imported_bundles = await getShareMap('importBundle');
        const exported_bundles = await getShareMap('exportBundle');
        //const install_reason = await getShareMap('install_reason');
        
        // Aggregate install_count, download_count, update_count, uninstall_count from Operations table
        async function getOperationCountMap(operationType: number): Promise<Record<string, number>> {
            // Map: "<PackageManager>_<Result>" => count
            const rows = await getAllRows(
            `SELECT PackageManager, OperationResult, SUM(EventCount) as count
             FROM Operations
             WHERE OperationType = ?
             GROUP BY PackageManager, OperationResult`,
            [operationType]
            );
            const map: Record<string, number> = {};
            for (const row of rows) {
            // Try to resolve OperationResult to string if possible
            let resultStr = typeof OperationResult === "object" && OperationResult !== null
                ? Object.keys(OperationResult).find(k => (OperationResult as any)[k] === row.OperationResult)
                : row.OperationResult;
            if (!resultStr) resultStr = String(row.OperationResult);
            if (resultStr == "0") resultStr = "SUCCEEDED";
            else if (resultStr == "1") resultStr = "FAILED";
            else console.log(resultStr, typeof(resultStr))
            map[`${row.PackageManager}_${resultStr}`] = row.count;
            }
            return map;
        }

        const install_count = await getOperationCountMap(OperationType.INSTALL);
        const download_count = await getOperationCountMap(OperationType.DOWNLOAD);
        const update_count = await getOperationCountMap(OperationType.UPDATE);
        const uninstall_count = await getOperationCountMap(OperationType.UNINSTALL);
        const shown_package_details = await getShareMap('packageDetails');
        const shared_packages = await getShareMap('sharedPackage');

        return {
            timestamp_utc_seconds,
            active_users,
            avg_last_ping_timeDelta: avgTime,
            active_versions,
            active_languages,
            active_managers,
            active_settings,
            installed_ranking,
            popular_ranking,
            uninstalled_ranking,
            imported_bundles,
            exported_bundles,
            //install_reason,
            download_count,
            update_count,
            install_count,
            uninstall_count,
            shown_package_details,
            shared_packages,
        };
    }

    static async GenerateRankings(rank_size: number): Promise<object> {
        return {
            timestamp_utc_seconds: Math.floor(new Date().getTime() / 1000),
            // popular: await this.PopularRanking.GetProgramRanking(rank_size),
            // installed: await this.InstallsRanking.GetProgramRanking(rank_size),
            // uninstalled: await this.UninstalledRanking.GetProgramRanking(rank_size),
        }
    }

    static async SaveResultsIfFlagSet()
    {
        try {
            const flagPath = `${Settings.FLAGS_FOLDER}/${Settings.SAVE_RESULTS_FLAG}`;
            if(fs.existsSync(flagPath))
            {            
                fs.unlinkSync(flagPath);
                let contents: string = JSON.stringify(await this.GenerateReport(15));
                const fileName = `${Math.floor(new Date().getTime() / 1000)}.json`;
                const filePath = `${Settings.RESULTS_FOLDER}/${fileName}`;
                fs.writeFileSync(filePath, contents);
            }
        } 
        catch (e)
        {
            console.error(`Failed to save results file due to ${e}`);
        }
    }

    static async SaveRankingsIfFlagSet()
    {
        try {
            const flagPath = `${Settings.FLAGS_FOLDER}/${Settings.SAVE_RANKINGS_FLAG}`;
            if(fs.existsSync(flagPath))
            {            
                fs.unlinkSync(flagPath);
                let contents: string = JSON.stringify(await this.GenerateRankings(50));
                const fileName = `LiveRanking.json`;
                const filePath = `${Settings.RESULTS_FOLDER}/${fileName}`;
                fs.writeFileSync(filePath, contents);
            }
        } 
        catch (e)
        {
            console.error(`Failed to save results file due to ${e}`);
        }
    }

}