import * as fs from 'fs';

export class ActiveUsersDB {
    private static activeUsers: Map<string, number> = new Map<string, number>();

    static Add(identifier: string, date: Date) {
        this.activeUsers.set(identifier, date.getTime())
    }

    static Purge(activity_period_ms: number) {
        const tenDaysAgo = (new Date()).getTime() - activity_period_ms;
        this.activeUsers.forEach((date, identifier) => {
            if (date < tenDaysAgo) {
                this.activeUsers.delete(identifier);
                console.info(`Deleting user ${identifier} from the active list`)
            }
        });
    }

    static GetActiveCount() {
        return this.activeUsers.size;
    }

    static LoadFromDisk() {
        try {
            if (fs.existsSync('ActiveUsers.json')) {
                const data = fs.readFileSync('ActiveUsers.json', 'utf-8');
                const parsedData: { [key: string]: number } = JSON.parse(data);
                Object.entries(parsedData).forEach(([identifier, date]) => {
                    this.activeUsers.set(identifier, date);
                });
            }
        } catch (err) {
            console.warn(`Could not load ActiveUsers from disk due to ${err}`);
        }
    }

    static SaveToDisk() {
        const data: { [key: string]: number } = {};
        this.activeUsers.forEach((date, identifier) => {
            data[identifier] = date;
        });
        fs.writeFileSync('ActiveUsers.json', JSON.stringify(data, null, 4), 'utf-8');
    }

}




export class Database {

}