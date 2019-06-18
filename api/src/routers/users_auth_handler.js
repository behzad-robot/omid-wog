import APIRouter from "./api_router";
import { SocketRouter } from "./socket_router";
import { isEmptyString, moment_now } from "../utils/utils";
import { JesEncoder } from "../utils/jes-encoder";
import { API_ENCODE_KEY, SITE_URL, ADMIN_TOKEN } from "../constants";
import moment from 'moment';
const encoder = new JesEncoder(API_ENCODE_KEY);
const fs = require('fs');
const path = require('path');

class UsersAuthHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.post('/login', (req, res) =>
        {
            this.handler.login(req.body).then((user) =>
            {
                this.sendResponse(req, res, user);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/signup', (req, res) =>
        {
            this.handler.signup(req.body).then((user) =>
            {
                this.sendResponse(req, res, user);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/check-token', (req, res) =>
        {
            this.handler.checkToken(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/edit-profile', (req, res) =>
        {
            if (!isEmptyString(req.header('user-token')))
            {
                req.body.token = req.header('user-token');
            }
            this.handler.checkUserFolder(req.body._id);
            const userPath = `users/${req.body._id}/`;
            this.handleFile(req, res, 'profileImage', userPath).then((img) =>
            {
                if (img)
                    req.body.profileImage = img.path;
                this.handleFile(req, res, 'cover', userPath).then((img) =>
                {
                    if (img)
                        req.body.cover = img.path;
                    this.handler.editProfile(req.body).then((result) =>
                    {
                        this.sendResponse(req, res, result);
                    }).catch((err) =>
                    {
                        this.handleError(req, res, err);
                    });
                }).catch((err) =>
                {
                    this.handleError(req, res, err.toString(), 500);
                });
            }).catch((err) =>
            {
                this.handleError(req, res, err.toString(), 500);
            });
        });
        this.router.get('/get-admins', (req, res) =>
        {
            console.log(req.header('admin-token'));
            if (isEmptyString(req.header('admin-token')) || req.header('admin-token') != ADMIN_TOKEN)
            {
                console.log(req.header('admin-token') + '=>' + ADMIN_TOKEN);
                this.handleError(req, res, 'access denied', 400);
                return;
            }
            this.handler.getAllAdmins().then((admins) =>
            {
                this.sendResponse(req, res, admins);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
    }
}
class UsersAuthSocketRouter extends SocketRouter
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
        if (request.model != 'users')
            return;
        //logic comes here:
        if (request.method == 'login')
        {
            console.log(request);
            this.handler.login(request.params).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'signup')
        {
            this.handler.signup(request.params).then((user) =>
            {
                this.sendResponse(socket, request, user);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'checkToken' || request.method == 'check-token')
        {
            this.handler.checkToken(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'editProfile')
        {
            this.handler.checkUserFolder(request.params._id);
            this.handler.editProfile(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
    }

}
export class UsersAuthHandler
{
    constructor(User)
    {
        this.User = User;
        //routers:
        this.httpRouter = new UsersAuthHttpRouter(this);
        this.socketRouter = new UsersAuthSocketRouter(this);
        //bind functions:
        this.login = this.login.bind(this);
        this.signup = this.signup.bind(this);
        this.checkToken = this.checkToken.bind(this);
        this.editProfile = this.editProfile.bind(this);
        this.checkUserFolder = this.checkUserFolder.bind(this);
        this.getAllAdmins = this.getAllAdmins.bind(this);
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
                query.username = { $regex: new RegExp(params.username, 'i') };
            this.User.findOne(query).exec((err, result) =>
            {
                if (err)
                {
                    reject({ code: 500, error: err });
                    return;
                }
                if (result == null)
                {
                    reject({ code: 404, error: "user not found" });
                    return;
                }
                result.token = encoder.encode({ _id: result._id, username: result.username, expiresIn: Date.now() + 14400000 }); //14400000
                let d = { token: result.token, lastLogin: moment().format('YYYY-MM-DD hh:mm:ss') };
                // if (result.social == undefined)
                // {
                //     d.social = {
                //         followers: [],
                //         followings: [],
                //         coins: 0,
                //         followedHashtags: [],
                //     };

                // }
                // else
                // {

                // }
                this.User.findByIdAndUpdate(result._id, { $set: d }, { new: true }, (err, user) =>
                {
                    if (err)
                    {
                        reject({ code: 500, error: err.toString() });
                        return;
                    }
                    if (user == null)
                    {
                        reject({ code: 404, error: "user not found" });
                        return;
                    }
                    user = user.toObject();
                    if (isEmptyString(user.profileImage))
                        user.profileImage = SITE_URL('/images/mario-gamer.jpg');
                    if (isEmptyString(user.cover))
                        user.cover = SITE_URL('/images/user-default-cover.jpg');

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
                epicGamesID: params.epicGamesID ? params.epicGamesID : '',
                psnID: params.psnID ? params.psnID : '',
                sex: params.sex,
                followingGames: [],
                createdAt: moment_now(),
                updatedAt: "",
                token: encoder.encode({ _id: '?', username: params.username, expiresIn: Date.now() + 14400000 }), //14400000
            }
            this.User.findOne({
                $or: [
                    { username: { $regex: new RegExp(data.username, 'i') } },
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
                var doc = new this.User(data);
                doc.save().then(() =>
                {
                    if (isEmptyString(doc.profileImage))
                        doc.profileImage = SITE_URL('/images/mario-gamer.jpg');
                    if (isEmptyString(doc.cover))
                        doc.cover = SITE_URL('/images/user-default-cover.jpg');
                    if (!isEmptyString(params.refferer) && !isEmptyString(params.refferer.replace(' ', '')))
                    {
                        this.User.findOne({ username: params.refferer }).exec((err, otherUser) =>
                        {
                            if (err)
                            {
                                console.log('refferer FAILED:' + err.toString());
                                return;
                            }
                            if (otherUser == undefined)
                            {
                                return;
                            }
                            otherUser.dota2EpicCenter2019.invites.push({ userId: doc._id.toString(), createdAt: moment_now() });
                            otherUser.dota2EpicCenter2019.coins += 50;
                            if (otherUser.dota2EpicCenter2019.invites.length == 10)
                                otherUser.dota2EpicCenter2019.coins += 1000;
                            this.User.findByIdAndUpdate(otherUser._id, { $set: { dota2EpicCenter2019: otherUser.dota2EpicCenter2019 } }, { new: true }).then((result) =>
                            {
                                console.log(`refferer ${result.username} got coins`);
                            }).catch((err) =>
                            {
                                console.log('refferer FAILED:' + err.toString());
                            });
                        });
                    }
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
            this.User.Helpers.isValidToken(params.token, (result) =>
            {
                //console.log(result);
                resolve(result);
            });
        });
    }
    checkUserFolder(_id)
    {
        if (isEmptyString(_id))
            return;
        //check if user has a folder:
        const userFolder = path.resolve('../storage/users/' + _id);
        if (!fs.existsSync(userFolder))
            fs.mkdirSync(userFolder);
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
            this.User.findOne({ token: params.token }).exec((err, poff) =>
            {
                delete (params.token);
                if (err || poff == null)
                {
                    reject(err ? err : 'object not found');
                    return;
                }
                let editUser = () =>
                {
                    this.User.findByIdAndUpdate(_id, params, { new: true }).then((result) =>
                    {
                        //before finishing check if profileImage , cover need resize:
                        if (!isEmptyString(result.profileImage))
                        {
                            //profile image file also exists:
                            if (fs.existsSync(path.resolve('..' + result.profileImage)))
                            {
                                //check resizes:

                            }
                        }
                        resolve(result);
                    }).catch((err) =>
                    {
                        reject(err.toString());
                    });
                };
                if (params.username && poff.username != params.username) 
                {
                    this.User.findOne({ username: { $regex: new RegExp(params.username, 'i') } }).exec((err, result) =>
                    {
                        if (err)
                        {
                            reject(err);
                            return;
                        }
                        if (result != undefined)
                            reject("user with this username already exists");
                        else
                            editUser();
                    });
                }
                else
                    editUser();
            });
        });
    }
    getAllAdmins()
    {
        return new Promise((resolve, reject) =>
        {
            this.User
                .find({ 'accessLevel.isAdmin': true })
                .limit(50)
                .exec((err, results) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    resolve(results);
                });
        });
    }
    // sendOTP(params)
    // {
    //     return new Promise((resolve, reject) =>
    //     {
    //         try
    //         {

    //             const phoneNumber = params.phoneNumber;
    //             const code = (Math.floor(Math.random()*8)+1).toString()+(Math.floor(Math.random()*9)).toString()+(Math.floor(Math.random()*9)).toString()+(Math.floor(Math.random()*9)).toString();
    //             kavenegarAPI.Send({ message: `کد فعال سازی حساب واج ${code}`, sender: "100065995", receptor: "09375801307" });
    //             resolve(true);
    //         }
    //         catch (err)
    //         {
    //             reject(err.toString());
    //         }
    //     });

    // }
}