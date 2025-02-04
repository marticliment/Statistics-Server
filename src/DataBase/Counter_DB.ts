import * as fs from 'fs';
import { Settings } from '../Settings.ts';
import { MainDB } from './MainDB.ts';
import { Utils } from '../Utils.ts';
import { count } from 'console';

export class Counter_DB
{
    private data_name: string;
    private Data: Map<string, number> = new Map<string, number>();
    public DimCount: number;

    constructor(name: string, dimCount: number)
    {
        this.data_name = name;
        this.DimCount = dimCount;
    }

    EnsureActivity(author: string)
    {
        let val = MainDB.ActiveUsers.Has(author);
        if(!val) console.warn(`User ${author} is not considered to be active`); 
        return val;
    }

    Increment_0dim(author: string): void
    {
        if(!this.EnsureActivity(author)) return;
        if(this.DimCount != 0) throw new Error(`Invalid dimension count ${this.DimCount} when expecting 0 on ${this.data_name}`);
        
        this.Data.set('value', (this.Data.get('value') ?? 0) + 1);
        Utils.UNSAVED_CHANGES = true;
    }

    Increment_1dim(group1: string, author: string): void
    {
        if(!this.EnsureActivity(author)) return;
        if(this.DimCount != 1) throw new Error(`Invalid dimension count ${this.DimCount} when expecting 1 on ${this.data_name}`);
     
        this.Data.set(group1, (this.Data.get(group1) ?? 0) + 1);
        Utils.UNSAVED_CHANGES = true;
    }

    Increment_2dim(group1: string, group2: string, author: string): void
    {
        if(!this.EnsureActivity(author)) return;
        if(this.DimCount != 2) throw new Error(`Invalid dimension count ${this.DimCount} when expecting 2 on ${this.data_name}`);
                
        let key = `${group1.replace('_', '')}_${group2.replace('_', '')}`;
        this.Data.set(key, (this.Data.get(key) ?? 0) + 1);
        Utils.UNSAVED_CHANGES = true;
    }

    GetReport_ByShareMap(): object
    {
        return Utils.MapToObject<string, number>(this.Data);
    }

    LoadFromDisk(): void
    {
        const new_file = `${Settings.DATA_FOLDER}/${this.data_name}.json.new`;
        const save_file = `${Settings.DATA_FOLDER}/${this.data_name}.json`;
        const old_file = `${Settings.DATA_FOLDER}/${this.data_name}.json.old`;
        try 
        {

            if(fs.existsSync(new_file) || fs.existsSync(old_file)) 
            {
                console.error(" @@ ");
                console.error(" @@  PANIC!!! ");
                console.error(" @@ ");
                console.error("Invalid FS state. check manually and run server again (no .old or .new files should be present)");
                process.exit(1);
            }
    
            console.debug(`Loading data for ${this.data_name} from ${save_file}...`);
            this.Data.clear();
            if (fs.existsSync(save_file)) 
            {
                const data = fs.readFileSync(save_file, 'utf-8');
                const parsedData: { [key: string]: number} = JSON.parse(data);
                Object.entries(parsedData).forEach(([key, value]) => {
                    this.Data.set(key, value);
                });
                console.debug(`${this.data_name} was loaded successfully from ${save_file}`);
            } 
            else 
            {
                console.warn(`${this.data_name} was initialized empty (${save_file}) was not found`);
            }
        } 
        catch (err)
        {
            console.error(`Failed to load data for ${this.data_name} from ${save_file}:`, err);
        }
        
    }

    SaveToDisk(): void
    {
        try 
        {
            // console.debug(`Saving ${this.data_name} to disk, on ${`${Settings.DATA_FOLDER}/${this.data_name}.json`}...`);
            const new_file = `${Settings.DATA_FOLDER}/${this.data_name}.json.new`;
            const save_file = `${Settings.DATA_FOLDER}/${this.data_name}.json`;
            const old_file = `${Settings.DATA_FOLDER}/${this.data_name}.json.old`;
            
            const data_to_store: { [key: string]: number } = {};
            this.Data.forEach((value, key) => {
                data_to_store[key] = value;
            });
            fs.writeFileSync(new_file, JSON.stringify(data_to_store, null, 0), 'utf-8');
            
            if (fs.existsSync(old_file)) fs.unlinkSync(old_file);
            if (fs.existsSync(save_file)) fs.renameSync(save_file, old_file); 
            fs.renameSync(new_file, save_file); 
            if (fs.existsSync(old_file)) fs.unlinkSync(old_file);
            
            // console.debug(`${this.data_name} was successfully saved to disk`);            
        } 
        catch (err)
        {
            console.error(`Failed to save data for ${this.data_name} to file ${`${Settings.DATA_FOLDER}/${this.data_name}.json`}:`, err);
        }
    }
}