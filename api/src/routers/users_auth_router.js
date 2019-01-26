import APIRouter from "./api_router";

export default class UsersAuthRouter extends APIRouter
{
    constructor(userSchema)
    {
        super();
        this.apiTokenRequired();
        const User = userSchema;
        this.router.post('/login', (req, res) =>
        {
            if ((req.body._id == undefined && req.body.email == undefined) || req.body.password == undefined)
            {
                this.handleError(req, res, "Parameters Missing! Please Provide _id/email + password!");
                return;
            }
            const query = {
                password: req.body.password,
            };
            if (req.body._id)
                query._id = req.body._id;
            if (req.body.email)
                query.email = req.body.email;
            User.findOne(query).exec((err, result) =>
            {
                if (err)
                {
                    this.handleError(req, res, err);
                    return;
                }
                if (result == null)
                {
                    this.handleError(req, res, "User not found!");
                    return;
                }
                result.token = this.encoder.encode({ _id: result._id, username: result.username, expiresIn: Date.now() + 14400000 }); //14400000
                User.findByIdAndUpdate(result._id, { $set: { token: result.token, lastLogin: this.now() } }, { new: true }, (err, user) =>
                {
                    if (err || user == null)
                    {
                        this.handleError(req, res, err ? err : "User not found!");
                        return;
                    }
                    user = user.toObject();
                    //user.set("encode",ENCODE_TRANSLATE.BEHZAD);
                    this.sendResponse(req, res, user);
                });
            });
        });
        this.router.post('/signup', (req, res) =>
        {
            if (req.body.username == undefined || req.body.password == undefined)
            {
                this.handleError("Parameters Missing! Please provide username , password.");
                return;
            }
            const data = {
                token: '',
                username: req.body.username,
                password: req.body.password,
                score: 0,
                profileImage: 'default',
                gameId: '',
                createdAt: this.now(),
                updatedAt: "",
            }
            var doc = new User(data);
            doc.save().then(() =>
            {
                this.sendResponse(req, res, doc);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/check-token', (req, res) =>
        {
            User.Helpers.isValidToken(req.body.token, (result) =>
            {
                //console.log(result);
                res.send(result);
            });
        });
    }
}