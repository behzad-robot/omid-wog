import APIRouter from "./api_router";
import { SocketRouter } from "./socket_router";
import { isEmptyString, moment_now } from "../utils/utils";
import { JesEncoder } from "../utils/jes-encoder";
import { API_ENCODE_KEY } from "../constants";
import moment from 'moment';
const encoder = new JesEncoder(API_ENCODE_KEY);
const Kavenegar = require('kavenegar');
const kavenegarAPI = Kavenegar.KavenegarApi({ apikey: '4868637A4941627444765A477958596C306733367338776D567770686C73704F' });

class OTPHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.post('/send-otp', (req, res) =>
        {
            this.handler.sendOTP(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/check-otp', (req, res) =>
        {
            this.handler.checkOTP(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
    }
}
class OTPSocketRouter extends SocketRouter
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
        if (request.model != 'otpObjects')
            return;
        //logic comes here:
        if (request.method == 'send-otp')
        {
            this.handler.sendOTP(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'check-otp')
        {
            this.handler.checkOTP(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
    }

}
export class OTPHandler
{
    constructor(OTPObject)
    {
        this.OTPObject = OTPObject;
        //routers:
        this.httpRouter = new OTPHttpRouter(this);
        this.socketRouter = new OTPSocketRouter(this);
        //bind functions:
        this.sendOTP = this.sendOTP.bind(this);
        this.checkOTP = this.checkOTP.bind(this);
    }
    sendOTP(params)
    {
        const OTPObject = this.OTPObject;
        return new Promise((resolve, reject) =>
        {
            console.log(params);
            if (isEmptyString(params.phoneNumber) || isEmptyString(params.type))
            {
                reject({ code: 500, error: "parameters missing" });
                return;
            }
            OTPObject.findOne({ phoneNumber: params.phoneNumber, status: 0 }).exec((err, result) =>
            {
                if (err)
                {
                    reject({ code: 500, error: err.toString() });
                    return;
                }
                if (result != null)
                {
                    //check if we can re-send the sms:
                    var timePassed = Date.now() - result.lastSent;
                    if (timePassed > 60 * 1000)
                    {
                        OTPObject.findByIdAndUpdate(result._id, { lastSent: Date.now() }, { new: true }, (err, result) =>
                        {
                            kavenegarAPI.Send({ message: result.body, sender: "100065995", receptor: params.phoneNumber });
                            resolve({ ok: true, message: "sms resent" });
                        });
                    }
                    else
                    {
                        reject({ code: 500, error: "try again in a few seconds" });
                    }
                }
                else
                {
                    //all is ok lets do this:
                    const code = (Math.floor(Math.random() * 8) + 1).toString() + (Math.floor(Math.random() * 9)).toString() + (Math.floor(Math.random() * 9)).toString() + (Math.floor(Math.random() * 9)).toString();
                    const data = {
                        type: params.type,
                        phoneNumber: params.phoneNumber,
                        code: code,
                        body: `کد فعال سازی حساب واج شما: ${code}`,
                        status: 0,
                        lastSent: Date.now(),
                        createdAt: moment_now(),
                        updatedAt: moment_now(),
                    };
                    var doc = new OTPObject(data);
                    doc.save().then(() =>
                    {
                        kavenegarAPI.Send({ message: data.body, sender: "100065995", receptor: "09375801307" });
                        resolve({ ok: true, message: "sms sent" });
                    }).catch((err) =>
                    {
                        reject({ code: 500, error: err.toString() });
                    });
                }
            });
        });
    }
    checkOTP(params)
    {
        const OTPObject = this.OTPObject;
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.phoneNumber) || isEmptyString(params.type) || isEmptyString(params.code))
            {
                reject({ code: 500, error: "parameters missing" });
                return;
            }
            OTPObject.findOne({ type: params.type, phoneNumber: params.phoneNumber, status: 0 }).exec((err, result) =>
            {
                if (err)
                {
                    reject({ code: 500, error: err.toString() });
                    return;
                }
                if (result == null)
                {
                    reject({ code: 500, error: "object not found" });
                    return;
                }
                if (result.code != params.code)
                {
                    reject({ code: 500, error: "wrong code", ok: false });
                    return;
                }
                else
                {
                    OTPObject.findByIdAndUpdate(result._id, { status: 1 }, { new: true }, (err, result) =>
                    {
                        if (err)
                        {
                            reject({ code: 500, error: err.toString() });
                            return;
                        }
                        resolve({ ok: true });
                    });
                }
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
            this.User.findOne(query).exec((err, result) =>
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
                this.User.findByIdAndUpdate(result._id, { $set: { token: result.token, lastLogin: moment().format('YYYY-MM-DD hh:mm:ss') } }, { new: true }, (err, user) =>
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
            this.User.findOne({
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
                var doc = new this.User(data);
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
            this.User.Helpers.isValidToken(params.token, (result) =>
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
            this.User.edit(_id, params).then((result) =>
            {
                resolve(result);
            }).catch((err) =>
            {
                reject(err.toString());
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