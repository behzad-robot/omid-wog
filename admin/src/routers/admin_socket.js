
import { AdminRouter } from "./admin_router";
import { IS_LOCALHOST } from "../constants";

export default class AdminSocketRouter extends AdminRouter
{
    constructor(User, Game)
    {
        super();
        this.router.get('/game/:_id', (req, res) =>
        {
            res.status(200).send(this.renderTemplate('socket.html', { _id: req.params._id , ws_url : IS_LOCALHOST() ? 'ws://localhost:4040': 'ws://determination.ir:4040'}));
        });
        this.router.all('/api/game/', (req, res) =>
        {
            if (req.query.command == 'login-trash')
            {
                User.apiCall('login/', 'POST', {
                    email: "trash@gmail.com",
                    password: '1234'
                }).then((json) =>
                {
                    res.send(json);
                }).catch((err) =>
                {
                    res.send({ error: err.toString() });
                });
            }
            else if (req.query.command == 'login-garbage')
            {
                User.apiCall('login/', 'POST', {
                    email: "garbage@gmail.com",
                    password: '1234'
                }).then((json) =>
                {
                    res.send(json);
                }).catch((err) =>
                {
                    res.send({ error: err.toString() });
                });
            }
            else if (req.query.command == 'load-game')
            {
                Game.getOne(req.query._id).then((json) =>
                {
                    res.send(json);
                }).catch((err) =>
                {
                    res.send({ error: err.toString() });
                });
            }
            else
            {
                res.send({error:"invalid command!"});
            }
        });
    }
}