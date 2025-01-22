import http from 'http';

export class Health
{
    static Respond(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>)
    {
        res.statusCode = 200;
        res.write(JSON.stringify({status: "ready"}))
    }
}

