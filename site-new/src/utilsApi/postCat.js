import { SocketCollection } from "../utils/socket-collection";
import { isEmptyString, ICON_404 } from "../utils/utils";
import { SITE_URL } from "../constants";


export class PostCat extends SocketCollection
{
    constructor(apiSocket)
    {
        super('posts-cats', apiSocket);
        this.fixOne = this.fixOne.bind(this);
        this.fixAll = this.fixAll.bind(this);
        this.find = this.find.bind(this);
        this.getOne = this.getOne.bind(this);
    }
    find(params = {})
    {
        return new Promise((resolve, reject) =>
        {
            super.find(params).then((results) =>
            {
                results = this.fixAll(results);
                resolve(results);
            }).catch(reject);
        });

    }
    getOne(_id)
    {
        return new Promise((resolve, reject) =>
        {
            super.getOne(_id).then((result) =>
            {
                result = this.fixOne(result);
                resolve(result);
            }).catch(reject);
        });
    }
    fixOne(cat)
    {
        cat.siteUrl = SITE_URL('posts/categories/'+cat.slug);
        return cat;
    }
    fixAll(cs)
    {
        for(var i = 0 ; i < cs.length;i++)
            cs[i] = this.fixOne(cs[i]);
        return cs;
    }

}
