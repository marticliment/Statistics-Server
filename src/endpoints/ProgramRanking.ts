import http from 'node:http';
import { MainDB } from '../DataBase/MainDB.ts';
import { OperationResult, OperationType, Utils } from '../Utils.ts';
export class PackageOPs
{
    static OperationResult(
        req: http.IncomingMessage, 
        res: http.ServerResponse<http.IncomingMessage>, 
        operationType: number,
    )
    {
        try 
        {
            const user_id = Utils.GetHeader(req, "clientId");
            const program_id = Utils.GetHeader(req, "packageId");
            const manager = Utils.GetHeader(req, "managerName");
            const source = Utils.GetHeader(req, "sourceName");
            const result = Utils.GetHeader(req, "operationResult");
            const event = Utils.GetHeader(req, "eventSource");
                    
            if(Utils.Invalid(user_id) || Utils.Invalid(program_id) || Utils.Invalid(manager) || Utils.Invalid(source) || Utils.Invalid(result))
            {
                res.statusCode = 406;
            }
            else
            {
                let version = "234";
                let res = result == "SUCCESS"? OperationResult.SUCCEEDED: OperationResult.FAILED;
                MainDB.AddOperation(version, program_id, source, manager, operationType, res, event)
            }
        } 
        catch (err)
        {
            res.statusCode = 500;
            console.error(err);
        }
    }
}

