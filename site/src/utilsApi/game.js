import { SocketCollection } from "../utils/socket-collection";


export class Game extends SocketCollection
{
    constructor(apiSocket)
    {
        super('games', apiSocket);
        this.fixOne = this.fixOne.bind(this);
        this.fixAll = this.fixAll.bind(this);
        //find:
        // this.find = this.find.bind(this);
        //getOne:
        this._getOne = this.getOne;
        this.getOne = (_id) =>
        {
            return Promise((resolve, reject) =>
            {
                this._getOne(_id).then((result) =>
                {
                    result = Game.fixOne(result);
                    resolve(result);
                }).catch(reject);
            });
        };
    }
    // find(params = {})
    // {
    //     console.log(':D');
    //     return Promise((resolve, reject) =>
    //     {
    //         super._find(params).then((results) =>
    //         {
    //             console.log(":|");
    //             results = Game.fixAll(results);
    //             resolve(results);
    //         }).catch(reject);
    //     });
    // };
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
