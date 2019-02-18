import { SocketCollection } from "../utils/socket-collection";

export class PostCat extends SocketCollection
{
    constructor(apiSocket)
    {
        super('posts-cats', apiSocket);
        this.fixOne = this.fixOne.bind(this);
        this.fixAll = this.fixAll.bind(this);
        //find:
        this._find = this.find;
        this.find = (params) =>
        {
            return Promise((resolve, reject) =>
            {
                this._find(params).then((results) =>
                {
                    results = PostCat.fixAll(results);
                    resolve(results);
                }).catch(reject);
            });
        };
        //getOne:
        this._getOne = this.getOne;
        this.getOne = (_id) =>
        {
            return Promise((resolve, reject) =>
            {
                this._getOne(_id).then((result) =>
                {
                    result = PostCat.fixOne(result);
                    resolve(result);
                }).catch(reject);
            });
        };
    }
    fixOne(c)
    {
        return c;
    }
    fixAll(cs)
    {
        for (var i = 0; i < cs.length; i++)
            cs[i] = this.fixOne(cs[i]);
        return cs;
    }

}
