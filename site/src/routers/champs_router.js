import SiteRouter from "./site_router";

export default class SiteChampionsRouter extends SiteRouter {
    constructor(siteModules) {
        super(siteModules);
        this.router.get('/:champSlug',(req,res)=>{
            siteModules.Champion.find({slug : req.params.champSlug}).then((champions)=>{
                if( champions.length == 0 )
                    this.show404(req,res);
                else
                {
                    let champion = champions[0];
                    champion = siteModules.Champion.fixOne(champion);
                    this.renderTemplate(req,res,'champion-single.html',{
                        champion : champion,
                        gameSlug : req.params.gameSlug,
                    });
                }
            }).catch((err)=>{
                this.show500(req,res,err.toString());
            });
        });
    }
}