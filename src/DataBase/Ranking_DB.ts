import * as fs from 'fs';
import { Settings } from '../Settings.ts';
import { MainDB } from './MainDB.ts';
import { Utils } from '../Utils.ts';

export class Ranking_DB
{
    private data_file: string;
    private data_name: string;
    
    private Data: Map<string, number> = new Map<string, number>(); 
    private RecentAdditions: Map<string, Set<string>> = new Map<string, Set<string>>();
    private PREVENT_SPAMMING: boolean;


    constructor(name: string, prevent_spamming: boolean)
    {
        this.data_name = name;
        this.data_file = `${Settings.DATA_FOLDER}/${name}.json`
        this.PREVENT_SPAMMING = prevent_spamming;
    }


    Increment(value_to_increment: string, author: string): void
    {
        // Check if the program has already been installed by the user
        if(!MainDB.ActiveUsers.Has(author)) 
        { 
            console.warn(`User ${author} is not considered to be active`); 
            return; 
        };
        
        if(this.PREVENT_SPAMMING)
        {
            if(this.RecentAdditions.get(author)?.has(value_to_increment) ?? false) 
            { 
                // If this user has already installed this program, do not.
                console.warn(`User ${author} already added ${value_to_increment} recently, ignoring`); 
                return; 
            } 
            else 
            {
                // Add the program to the list to prevent spamming. If there is no set, create one
                if(this.RecentAdditions.get(author) == null)
                    this.RecentAdditions.set(author, new Set<string>());

                this.RecentAdditions.get(author)?.add(value_to_increment);
            }
        }
        
        // Increase by one the install ranking of this program
        this.Data.set(value_to_increment, this.Data.get(value_to_increment) ?? 0 + 1);
    }

    GetProgramRanking(max_amount: number): (string | number)[][]
    {
        let sortedRanking = Array.from(this.Data.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, Math.min(this.Data.size, max_amount));

        return sortedRanking.map(([entry, count]) => Utils.GetProgramDataFromUniqueId(entry).concat([count]));
    }

    ClearRecentAdditionsList(): void
    {
        if(!this.PREVENT_SPAMMING) return;
        this.RecentAdditions.clear();
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
                const parsedData: { [key: string]: number} = JSON.parse(data);
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
            const data_to_store: { [key: string]: number } = {};
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