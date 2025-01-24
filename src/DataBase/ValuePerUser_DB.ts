import * as fs from 'fs';
import { Utils } from '../Utils.ts';
import { Settings } from '../Settings.ts';

export class ValuePerUser_DB<value_t>
{
    private data_name: string;
    Data: Map<string, value_t> = new Map<string, value_t>(); 

    constructor(name: string)
    {
        this.data_name = name;
    }

    Set(identifier: string, value: value_t)
    {
        this.Data.set(identifier, value);
        Utils.UNSAVED_CHANGES = true;
    }

    Get(identifier: string): value_t | undefined
    {
        return this.Data.get(identifier);
    }

    Delete(identifier: string): void
    {
        this.Data.delete(identifier);
        Utils.UNSAVED_CHANGES = true;
    }

    Has(identifier: string): boolean
    {
        return this.Data.has(identifier);
    }

    Size(): number
    {
        return this.Data.size
    }

    GetReport_ByShareMap(): object
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

        return Utils.MapToObject<value_t, number>(result);
    }

    GetReport_ByBitMask(): number[]
    {   
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
            console.debug(`Loading data for ${this.data_name} from ${`${Settings.DATA_FOLDER}/${this.data_name}.json`}...`);
            this.Data.clear();
            if (fs.existsSync(`${Settings.DATA_FOLDER}/${this.data_name}.json`)) 
            {
                const data = fs.readFileSync(`${Settings.DATA_FOLDER}/${this.data_name}.json`, 'utf-8');
                const parsedData: { [key: string]: value_t} = JSON.parse(data);
                Object.entries(parsedData).forEach(([key, value]) => {
                    this.Data.set(key, value);
                });
                console.debug(`${this.data_name} was loaded successfully from ${`${Settings.DATA_FOLDER}/${this.data_name}.json`}`);
            } 
            else 
            {
                console.warn(`${this.data_name} was initialized empty (${`${Settings.DATA_FOLDER}/${this.data_name}.json`}) was not found`);
            }
        } 
        catch (err)
        {
            console.error(`Failed to load data for ${this.data_name} from ${`${Settings.DATA_FOLDER}/${this.data_name}.json`}:`, err);
        }
        
    }

    SaveToDisk(): void
    {
        try 
        {
            // console.debug(`Saving ${this.data_name} to disk, on ${`${Settings.DATA_FOLDER}/${this.data_name}.json`}...`);
            const data_to_store: { [key: string]: value_t } = {};
            this.Data.forEach((value, key) => {
                data_to_store[key] = value;
            });
            fs.writeFileSync(`${Settings.DATA_FOLDER}/${this.data_name}.json`, JSON.stringify(data_to_store, null, 4), 'utf-8');
            // console.debug(`${this.data_name} was successfully saved to disk`);            
        } 
        catch (err)
        {
            console.error(`Failed to save data for ${this.data_name} to file ${`${Settings.DATA_FOLDER}/${this.data_name}.json`}:`, err);
        }
    }
}