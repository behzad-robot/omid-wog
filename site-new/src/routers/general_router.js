import SiteRouter from "./site_router";
const fs = require('fs');
const path = require('path');

export default class SiteGeneralRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/home', (req, res) =>
        {
            res.redirect('/');
        });
        this.router.get('/163110.txt',(req,res)=>{
            res.send('');
        });
        this.router.get('/', (req, res) =>
        {
            siteModules.Post.find({ limit: 5 }).then((latestPosts) =>
            {
                //gridPosts:
                fs.readFile(path.resolve('../storage/caches/posts-grid.json'), (err, gridFile) =>
                {
                    if (err)
                    {
                        this.show500(req, res, err.toString());
                        return;
                    }
                    var gridIds = JSON.parse(gridFile.toString());
                    siteModules.Post.find({ _ids: gridIds }).then((gs) =>
                    {
                        let gridPosts = [];
                        for (var i = 0; i < gridIds.length; i++)
                        {
                            for (var j = 0; j < gs.length; j++)
                            {
                                if (gs[j]._id == gridIds[i])
                                {
                                    gridPosts.push(gs[j]);
                                    break;
                                }
                            }
                        }
                        fs.readFile(path.resolve('../storage/aparat/posts-archive-aparat.json'), (err, aparatFile) =>
                        {
                            var aparatVideosFull = JSON.parse(aparatFile.toString());
                            // console.log(aparatVideosFull);
                            var aparatVideos = [];
                            for (var i = 0; i < aparatVideosFull.length && i < 5; i++)
                                aparatVideos.push(aparatVideosFull[i]);
                            this.renderTemplate(req, res, 'wog-home.html', {
                                latestPosts: latestPosts,
                                aparatVideos: aparatVideos,
                                gridPosts0: gridPosts[0],
                                gridPosts1: gridPosts[1],
                                gridPosts2: gridPosts[2],
                                gridPosts3: gridPosts[3],
                                gridPosts4: gridPosts[4],
                            });
                        });
                    });
                });

            });
        });
        this.router.get('/html/:fileName', (req, res) =>
        {
            this.renderTemplate(req, res, req.params.fileName + '.html', {});
        });
        this.router.get('/shop', (req, res) =>
        {
            this.renderTemplate(req, res, 'coming-soon.html', {});
        });
        this.router.get('/about-us', (req, res) =>
        {
            this.renderTemplate(req, res, 'about-us.html', {});
        });

        // this.router.get('/sms', (req, res) =>
        // {
        //     kavenegarAPI.Send({ message: "من یک تباهم آرزو دارم 3530" , sender: "100065995" , receptor: "09375801307" });
        //     res.send('TABAH!');
        // });
    }
}