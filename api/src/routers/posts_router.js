import APIRouter from "./api_router";
import { SocketRouter } from "./socket_router";
import { isEmptyString, moment_now } from "../utils/utils";
import { JesEncoder } from "../utils/jes-encoder";
import { API_ENCODE_KEY } from "../constants";
import moment from 'moment';
const encoder = new JesEncoder(API_ENCODE_KEY);


class PostsHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.get('/search', (req, res) =>
        {
            this.handler.search(req.query.s).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
    }
}
class PostsSocketRouter extends SocketRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.onMessage = this.onMessage.bind(this);
    }
    onMessage(socket, request)
    {
        if (!this.isValidRequest(request))
            return;
        if (request.model != 'posts')
            return;
        //logic comes here:
        if (request.method == 'search')
        {
            this.handler.search(request.params.s).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
    }

}
export class PostsHandler
{
    constructor(Post)
    {
        this.Post = Post;
        //routers:
        this.httpRouter = new PostsHttpRouter(this);
        this.socketRouter = new PostsSocketRouter(this);
        //bind functions:
        this.search = this.search.bind(this);
    }
    search(searchQuery, limit = 20, offset = 0)
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(searchQuery))
            {
                reject('search query cant be empty');
                return;
            }
            var regex = { '$regex': searchQuery, '$options': 'i' };
            this.Post.find({
                '$or': [
                    { title: regex },
                    { intro: regex },
                    { body: regex },
                    { tags: searchQuery }
                ]
            }).limit(limit).skip(offset).exec((err, results) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                for (var i = 0; i < results.length; i++)
                    results[i] = this.Post.Helpers.public(results[i]);
                resolve(results);
            });
        });
    }
    login(params = { username: '', email: '', password: '' })
    {
        return new Promise((resolve, reject) =>
        {
            if ((isEmptyString(params.username) && isEmptyString(params.email) && isEmptyString(params._id)) || isEmptyString(params.password))
            {
                reject({ code: 500, error: "Parameters Missing! Please Provide _id/email/username + password!" });
                return;
            }
            const query = {
                password: params.password,
            };
            if (params._id)
                query._id = params._id;
            if (params.email)
                query.email = params.email;
            if (params.username)
                query.username = params.username;
            console.log(query);
            this.Post.findOne(query).exec((err, result) =>
            {
                if (err)
                {
                    reject({ code: 500, error: err });
                    return;
                }
                if (result == null)
                {
                    reject({ code: 400, error: "User Not found" });
                    return;
                }
                console.log("this is fine");
                result.token = encoder.encode({ _id: result._id, username: result.username, expiresIn: Date.now() + 14400000 }); //14400000
                this.Post.findByIdAndUpdate(result._id, { $set: { token: result.token, lastLogin: moment().format('YYYY-MM-DD hh:mm:ss') } }, { new: true }, (err, user) =>
                {
                    if (err || user == null)
                    {
                        reject({ code: 400, error: "User not found!" });
                        return;
                    }
                    user = user.toObject();
                    resolve(user);
                });
            });
        });
    }
    signup(params)
    {
        return new Promise((resolve, reject) =>
        {
            if (params.username == undefined || params.password == undefined
                || params.phoneNumber == undefined
                || params.firstName == undefined || params.lastName == undefined
                || params.sex == undefined)
            {
                reject({ code: 500, error: "Parameters missing!" });
                return;
            }
            const data = {
                username: params.username,
                password: params.password,
                email: params.email ? params.email : "",
                phoneNumber: params.phoneNumber,
                firstName: params.firstName,
                lastName: params.lastName,
                sex: params.sex,
                followingGames: [],
                createdAt: moment_now(),
                updatedAt: "",
            }
            this.Post.findOne({
                $or: [
                    { username: data.username },
                    { email: data.email },
                    { phoneNumber: data.phoneNumber },
                ]
            }).exec((err, result) =>
            {
                if (err)
                {
                    reject({ code: 500, error: err.toString() });
                    return;
                }
                if (result != null && result != undefined)
                {
                    var error = "User already exists.";
                    if (result.username == data.username)
                        error = "User with this username already exists.";
                    else if (result.email == data.email)
                        error = "User with this email already exists.";
                    else if (result.phoneNumber == data.phoneNumber)
                        error = "User with this phoneNumber already exists.";
                    reject({ code: 500, error: error });
                    return;
                }
                console.log(data);
                var doc = new this.Post(data);
                doc.save().then(() =>
                {
                    resolve(doc);
                }).catch((err) =>
                {
                    reject({ code: 500, error: err.toString() });
                });
            });
        });
    }
    checkToken(params)
    {
        return new Promise((resolve, reject) =>
        {
            this.Post.Helpers.isValidToken(params.token, (result) =>
            {
                //console.log(result);
                resolve(result);
            });
        });
    }
    editProfile(params)
    {
        return new Promise((resolve, reject) =>
        {
            const _id = params._id;
            if (isEmptyString(params.token))
            {
                reject('token is missing');
                return;
            }
            this.Post.findOne({ token: params.token }).exec((err, poff) =>
            {
                delete (params.token);
                if (err || poff == null)
                {
                    reject(err ? err : 'object not found');
                    return;
                }
                this.Post.findByIdAndUpdate(_id, params, { new: true }).then((result) =>
                {
                    resolve(result);
                }).catch((err) =>
                {
                    reject(err.toString());
                });
            });
        });
    }
}