import { SocketCollection } from "../utils/socket-collection";
import { isEmptyString, ICON_404 } from "../utils/utils";


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
        return Promise((resolve, reject) =>
        {
            super.getOne(_id).then((result) =>
            {
                result = this.fixOne(result);
                resolve(result);
            }).catch(reject);
        });
    }
    fixOne(g)
    {
        for (var i = 0; i < g.items.length; i++)
        {
            if (isEmptyString(g.items[i].icon))
                g.items[i].icon = ICON_404;
        }
        if (isEmptyString(g.icon))
            g.icon = ICON_404;
        if (isEmptyString(g.cover))
            g.cover = ICON_404;
        if (isEmptyString(g.coverTall))
            g.coverTall = ICON_404;
        g.siteUrl = '/PostCats/' + g.slug;
        return g;
    }
    fixAll(cs)
    {
        for (var i = 0; i < cs.length; i++)
            cs[i] = this.fixOne(cs[i]);
        return cs;
    }

}
