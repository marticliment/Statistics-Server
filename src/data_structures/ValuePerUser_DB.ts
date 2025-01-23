import * as fs from 'fs';
import { DBEntry } from './DBentry.ts'

export class ValuePerUser_DB<value_t> implements DBEntry
{
    private data_file: string;
    private data_name: string;
    Data: Map<string, value_t> = new Map<string, value_t>(); 

    constructor(name: string)
    {
        this.data_name = name;
        this.data_file = `data/${name}.json`
    }

    Set(identifier: string, value: value_t)
    {
        this.Data.set(identifier, value);
    }

    Get(identifier: string): value_t | undefined
    {
        return this.Data.get(identifier);
    }

    Delete(identifier: string): void
    {
        this.Data.delete(identifier);
    }

    Has(identifier: string): boolean
    {
        return this.Data.has(identifier);
    }

    Size(): number
    {
        return this.Data.size
    }

    GetReport_ByShareMap(): Map<value_t, number>
    {
        let result = new Map<value_t, number>();

        // Calculate how many of each kind there are
        this.Data.forEach((version, _) => {
            result.set(version, (result.get(version) ?? 0) + 1);
        });

        // Calculate percent
        result.forEach((count, version) => {
            result.set(version, (count*100.0)/this.Data.size);
        });

        return result;
    }

    GetReport_ByBitMask(): number[]
    {
        if (typeof ({} as value_t) !== 'number') 
        {
            throw new Error(`Cannot call ${this.data_name}.GetReport_ByBitMask: value_t must be of type number`);
        }
        
        // 32 possible values
        let result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        // For each user, analyze enabled managers
        this.Data.forEach((magicValue, identifier) => {
            let value = magicValue as number;
            for (let i = 0; i < 32; i++) if (value & (1 << i)) result[i]++;
        });

        // Calculate percent
        for(let i = 0; i < 32; i++) result[i] = (result[i]*100) / this.Data.size;

        return result;
    }

    LoadFromDisk(): void
    {
        try 
        {
            console.debug(`Loading data for ${this.data_name} from ${this.data_file}...`);
            this.Data.clear();
            if (fs.existsSync(this.data_file)) 
            {
                const data = fs.readFileSync(this.data_file, 'utf-8');
                const parsedData: { [key: string]: value_t} = JSON.parse(data);
                Object.entries(parsedData).forEach(([key, value]) => {
                    this.Data.set(key, value);
                });
                console.debug(`${this.data_name} was loaded successfully from ${this.data_file}`);
            } 
            else 
            {
                console.warn(`${this.data_name} was initialized empty (${this.data_file}) was not found`);
            }
        } 
        catch (err)
        {
            console.error(`Failed to load data for ${this.data_name} from ${this.data_file}:`, err);
        }
        
    }

    SaveToDisk(): void
    {
        try 
        {
            console.debug(`Saving ${this.data_name} to disk, on ${this.data_file}...`);
            this.Data.clear();
            const data_to_store: { [key: string]: value_t } = {};
            this.Data.forEach((value, key) => {
                data_to_store[key] = value;
            });
            fs.writeFileSync(this.data_file, JSON.stringify(data_to_store, null, 4), 'utf-8');
            console.debug(`${this.data_name} was successfully saved to disk`);            
        } 
        catch (err)
        {
            console.error(`Failed to save data for ${this.data_name} to file ${this.data_file}:`, err);
        }
    }
}