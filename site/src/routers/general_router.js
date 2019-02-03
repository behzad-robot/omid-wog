import SiteRouter from "./site_router";

export default class SiteGeneralRouter extends SiteRouter
{
    constructor(modules){
        super(modules);
        this.router.get('/',(req,res)=>{
            this.renderTemplate(req,res,'wog-home.html',{});
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
        this.router.get('/kiri',(req,res)=>{
            this.renderTemplate(req,res,'slider-kiri.html',{});
        });
        this.router.get('/game',(req,res)=>{
            this.renderTemplate(req,res,'game-single.html',{});
        });
    }
}