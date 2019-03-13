import { SocketCollection } from "../utils/socket-collection";
import { isEmptyString, ICON_404 } from "../utils/utils";
import { SITE_URL } from "../constants";



export class Post extends SocketCollection
{
    constructor(apiSocket)
    {
        super('posts', apiSocket);
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
    fixOne(p)
    {
        if (isEmptyString(p.thumbnail))
            p.thumbnail = ICON_404;
        p.thumbnail = SITE_URL(p.thumbnail);
        p.siteUrl = SITE_URL('/posts/' + p.slug);
        if (p.authorId == undefined)
            p.authorId = p.adminId;
        if (p.extras == undefined)
            p.extras = { bigBox: false };
        return p;
    }
    fixAll(cs)
    {
        for (var i = 0; i < cs.length; i++)
            cs[i] = this.fixOne(cs[i]);
        return cs;
    }

}
