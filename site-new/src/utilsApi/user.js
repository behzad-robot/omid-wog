import { SocketCollection } from "../utils/socket-collection";
import { isEmptyString, ICON_404 } from "../utils/utils";
import { SITE_URL } from "../constants";


export class User extends SocketCollection
{
    constructor(apiSocket)
    {
        super('users', apiSocket);
        this.fixOne = this.fixOne.bind(this);
        this.fixAll = this.fixAll.bind(this);
        this.public = this.public.bind(this);
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
    fixOne(u)
    {
        if (isEmptyString(u.profileImage))
            u.profileImage = SITE_URL('/images/user-profile-default.png');
        else
            u.profileImage = SITE_URL(u.profileImage);
        if(isEmptyString(u.cover))
            u.cover = SITE_URL('/images/user-default-cover.jpg');
        else
            u.cover = SITE_URL(u.cover);
        u.siteUrl = SITE_URL('users/' + u.username);
        return u;
    }
    fixAll(cs)
    {
        for (var i = 0; i < cs.length; i++)
            cs[i] = this.fixOne(cs[i]);
        return cs;
    }
    public(u)
    {
        delete (u.token);
        delete (u.email);
        delete (u.password);
        delete (u.phoneNumber);
        return u;
    }
}
