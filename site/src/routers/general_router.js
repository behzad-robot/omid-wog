import SiteRouter from "./site_router";

export default class SiteGeneralRouter extends SiteRouter
{
    constructor(modules){
        super(modules);
        this.router.get('/',(req,res)=>{
            console.log(':|');
            this.renderTemplate(req,res,'wog-home.html',{});
        });
    }
}