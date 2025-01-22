import * as fs from 'fs';

export class ActiveUsersDB {
    private static activeUsers: Map<string, number> = new Map<string, number>();
    private static activeVersions: Map<string, string> = new Map<string, string>();

    static Add(identifier: string, date: Date, version: string) {
        this.activeUsers.set(identifier, date.getTime());
        this.activeVersions.set(identifier, version);
    }

    static Purge(activity_period_ms: number) {
        const tenDaysAgo = (new Date()).getTime() - activity_period_ms;
        this.activeUsers.forEach((date, identifier) => {
            if (date < tenDaysAgo) {
                this.activeUsers.delete(identifier);
                this.activeVersions.delete(identifier);
                console.info(`Deleting user ${identifier} from the active list`)
            }
        });
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

    static LoadFromDisk() {
        try {
            if (fs.existsSync('data/ActiveUsers.json')) {
                this.activeUsers.clear();
                const data = fs.readFileSync('data/ActiveUsers.json', 'utf-8');
                const parsedData: { [key: string]: number } = JSON.parse(data);
                Object.entries(parsedData).forEach(([identifier, date]) => {
                    this.activeUsers.set(identifier, date);
                });
            }
            
            if (fs.existsSync('data/ActiveVersions.json')) {
                this.activeVersions.clear();
                const data = fs.readFileSync('data/ActiveVersions.json', 'utf-8');
                const parsedData: { [key: string]: string } = JSON.parse(data);
                Object.entries(parsedData).forEach(([identifier, version]) => {
                    this.activeVersions.set(identifier, version);
                });
            }
        } catch (err) {
            console.warn(`Could not load ActiveUsers from disk due to ${err}`);
        }
    }

    static SaveToDisk() {
        const act_data: { [key: string]: number } = {};
        this.activeUsers.forEach((date, identifier) => {
            act_data[identifier] = date;
        });
        fs.writeFileSync('data/ActiveUsers.json', JSON.stringify(act_data, null, 4), 'utf-8');

        const ver_data : { [key: string]: string } = {};
        this.activeVersions.forEach((version, identifier) => {
            ver_data[identifier] = version;
        });
        fs.writeFileSync('data/ActiveVersions.json', JSON.stringify(ver_data, null, 4), 'utf-8');
    }

}




export class Database {

}