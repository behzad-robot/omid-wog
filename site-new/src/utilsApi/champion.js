import { SocketCollection } from "../utils/socket-collection";
import { isEmptyString, ICON_404 } from "../utils/utils";
import { SITE_URL } from "../constants";


export class Champion extends SocketCollection
{
    constructor(apiSocket)
    {
        super('champions', apiSocket);
        this.fixOne = this.fixOne.bind(this);
        this.fixAll = this.fixAll.bind(this);
        this.find = this.find.bind(this);
        this.findOne = this.findOne.bind(this);
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
    findOne(params = {})
    {
        return new Promise((resolve, reject) =>
        {
            this.find(params).then((cs) =>
            {
                if (cs == undefined || cs.length == 0)
                    reject('not found');
                else
                    resolve(cs[0]);
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
    fixOne(c)
    {
        c.siteUrl = SITE_URL('wiki/dota2/champions/' + c.slug);
        c.rolesStr = '';
        for (var i = 0; i < c.roles.length; i++)
        {
            c.rolesStr += (c.roles[i].name + ',');
        }
        c.rolesStr = c.rolesStr.substring(0, c.rolesStr.length - 2);
        if (c.topBuilds == undefined)
            c.topBuilds = [];
        return c;
    }
    fixAll(cs)
    {
        for (var i = 0; i < cs.length; i++)
            cs[i] = this.fixOne(cs[i]);
        return cs;
    }

}
