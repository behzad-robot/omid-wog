import APIRouter from "./api_router";

const LIMIT = 10000;
export class BackupRouter extends APIRouter
{
    constructor(models)
    {
        super();
        this.apiTokenRequired();
        this.adminTokenRequired();
        this.router.get('/', (req, res) =>
        {
            var backupResult = {};
            var keys = Object.keys(models);
            const findThings = (models, index, done) =>
            {
                if (index >= keys.length)
                {
                    done();
                    return;
                }
                var key = keys[index];
                models[key].find({}).lean().limit(LIMIT).exec((err, results) =>
                {
                    backupResult[key] = results;
                    findThings(models, index + 1, done);
                });
            };
            findThings(models,0,()=>{
                res.send(backupResult);
            });
        });
    }
}