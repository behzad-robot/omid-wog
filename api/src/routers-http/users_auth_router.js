import APIRouter from "./api_router";

export default class UsersAuthRouter extends APIRouter {
    constructor(userSchema) {
        super();
        this.apiTokenRequired();
        const User = userSchema;
        this.router.post('/login', (req, res) => {
            if ((req.body._id == undefined && req.body.email == undefined && req.body.username == undefined) || req.body.password == undefined) {
                this.handleError(req, res, "Parameters Missing! Please Provide _id/email/username + password!");
                return;
            }
            const query = {
                password: req.body.password,
            };
            if (req.body._id)
                query._id = req.body._id;
            if (req.body.email)
                query.email = req.body.email;
            if(req.body.username)
                query.username = req.body.username;
            User.findOne(query).exec((err, result) => {
                if (err) {
                    this.handleError(req, res, err);
                    return;
                }
                if (result == null) {
                    this.handleError(req, res, "User not found!",404);
                    return;
                }
                result.token = this.encoder.encode({ _id: result._id, username: result.username, expiresIn: Date.now() + 14400000 }); //14400000
                User.findByIdAndUpdate(result._id, { $set: { token: result.token, lastLogin: this.now() } }, { new: true }, (err, user) => {
                    if (err || user == null) {
                        this.handleError(req, res, err ? err : "User not found!");
                        return;
                    }
                    user = user.toObject();
                    //user.set("encode",ENCODE_TRANSLATE.BEHZAD);
                    this.sendResponse(req, res, user);
                });
            });
        });
        this.router.post('/signup', (req, res) => {
            if (req.body.username == undefined || req.body.password == undefined
                 || req.body.phoneNumber == undefined
                || req.body.firstName == undefined || req.body.lastName == undefined
                || req.body.sex == undefined) {
                this.handleError(req,res,"Parameters Missing!");
                return;
            }
            console.log("parameters are fine");
            const data = {
                username: req.body.username,
                password: req.body.password,
                email: req.body.email ? req.body.email  : "",
                phoneNumber: req.body.phoneNumber,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                sex: req.body.sex,
                followingGames: [],
                createdAt: this.now(),
                updatedAt: "",
            }
            User.findOne({
                $or: [
                    { username: data.username },
                    { email: data.email },
                    { phoneNumber: data.phoneNumber },
                ]
            }).exec((err, result) => {
                if (err) {
                    this.handleError(req, res, err);
                    return;
                }
                if (result != null && result != undefined) {
                    var error = "User already exists.";
                    if (result.username == data.username)
                        error = "User with this username already exists.";
                    else if (result.email == data.email)
                        error = "User with this email already exists.";
                    else if (result.phoneNumber == data.phoneNumber)
                        error = "User with this phoneNumber already exists.";
                    this.handleError(req, res, error);
                    return;
                }
                var doc = new User(data);
                doc.save().then(() => {
                    this.sendResponse(req, res, doc);
                }).catch((err) => {
                    this.handleError(req, res, err);
                });
            });
        });
        this.router.post('/check-token', (req, res) => {
            User.Helpers.isValidToken(req.body.token, (result) => {
                //console.log(result);
                res.send(result);
            });
        });
    }
}