import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants";
import { isEmptyString, replaceAll } from "../../utils/utils";
const fs = require('fs');
const path = require('path');
export class Dota2WikiRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/', (req, res) =>
        {
            siteModules.Cache.getGame({ token: 'dota2' }).then((game) =>
            {
                siteModules.Champion.find({ gameId: game._id, limit: 20000 }).then((champions) =>
                {
                    fs.readFile('../storage/caches/dota2-top-champions.json', (err, data) =>
                    {
                        if (err)
                        {
                            this.show500(req, res, err);
                            return;
                        }
                        let topChampionsIds = JSON.parse(data.toString());
                        let topChampions = [];
                        for (var i = 0; i < topChampionsIds.length; i++)
                        {
                            for (var j = 0; j < champions.length; j++)
                            {
                                if (topChampionsIds[i] == champions[j]._id)
                                {
                                    topChampions.push(champions[j]);
                                    break;
                                }
                            }
                        }
                        siteModules.Post.find({
                            '$or': [
                                { tags: 'dota2' },
                                { gameId: game._id },
                            ]
                        }).then((posts) =>
                        {
                            this.renderTemplate(req, res, 'wiki-dota2/dota2-home.html', {
                                game: game,
                                champions, champions,
                                topChampions: topChampions,
                                posts: posts,
                                //streamers are loaded in page :))
                            });
                        }).catch((err) =>
                        {
                            this.show500(req, res, err);
                        });

                    });
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            })
        });
    }
}