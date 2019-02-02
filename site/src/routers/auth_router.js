import SiteRouter from "./site_router";

export default class SiteAuthRouter extends SiteRouter
{
    constructor(modules){
        super(modules);
        this.router.post('/login',(req,res)=>{
            if(req.body.username == undefined  || req.body.password == undefined)
            {
                res.send("Parameters Missing!");                
                return;
            }
            
        });
        this.router.get('/champ',(req,res)=>{
            this.renderTemplate(req,res,'champion-single.html',{});
        });
        this.router.get('/ali',(req,res)=>{
            this.renderTemplate(req,res,'ali.html',{});
        });
        this.router.get('/post',(req,res)=>{
            this.renderTemplate(req,res,'post-single.html',{});
        });
    }
}