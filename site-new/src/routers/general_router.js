import SiteRouter from "./site_router";

export default class SiteGeneralRouter extends SiteRouter
{
    constructor(modules)
    {
        super(modules);
        this.router.get('/',(req,res)=>{
            res.end("New Website is WIP! :D Goto another url!");
        });
        this.router.get('/html/:fileName',(req,res)=>{
            this.renderTemplate(req,res,req.params.fileName+'.html',{});
        });
    }
}