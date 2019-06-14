import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants";
import { isEmptyString, replaceAll } from "../../utils/utils";

export class SocialPostsRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.use((req, res, next) =>
        {
            if (!this.isLoggedIn(req))
            {
                res.redirect('/login/?redirect=/social');
                return;
            }
            next();
        });
        this.router.get('/new', (req, res) =>
        {
            this.renderTemplate(req,res,'social/social-new-post.html',{
                
            });
        });
        this.router.post('/new-save',(req,res)=>{
            
        });
    }
}