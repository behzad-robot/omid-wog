import SiteRouter from "./site_router";
import { isEmptyString } from "../utils/utils";

const fs = require('fs');
const path = require('path');
export default class SiteUsersRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/:username', (req, res) =>
        {
            siteModules.User.find({ username: req.params.username }).then((users) =>
            {
                if (users.length == 0)
                {
                    this.show404(req, res);
                    return;
                }
                let user = users[0];
                // let user = siteModules.User.public(users[0]);
                siteModules.Post.find({ authorId: user._id, limit: 200 }).then((posts) =>
                {
                    for (var i = 0; i < posts.length; i++)
                        posts[i]._user = user;
                    siteModules.SocialPost.find({ userId: user._id, limit: 200 }).then(async (socialPosts) =>
                    {
                        try
                        {
                            let bookmarkPosts = [];
                            console.log(user.social.bookmarks);
                            if (user.social.bookmarks != undefined && user.social.bookmarks.length != 0)
                            {
                                console.log('wtf is this if!');
                                bookmarkPosts = await siteModules.SocialPost.find({ _ids: user.social.bookmarks });
                            }
                            console.log(bookmarkPosts);
                            this.renderTemplate(req, res, 'user-profile.html', {
                                user: user,
                                isCurrentUser: ((req.session != undefined && req.session.currentUser != undefined && user._id == req.session.currentUser._id) ? true : undefined),
                                posts: posts,
                                postsCount: posts.length,
                                socialPosts: socialPosts,
                                bookmarkPosts: bookmarkPosts,
                            });
                        }
                        catch (err)
                        {
                            this.show500(req, res, err);
                        }
                    });
                }).catch((err) =>
                {
                    this.show500(req, res, err);
                });

            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
        this.router.get('/:username/edit', (req, res) =>
        {
            if (req.params.username != req.session.currentUser.username)
            {
                res.status(400).send('access denied');
                return;
            }
            this.renderTemplate(req, res, 'edit-profile.html', {
                success: req.query.msg == 'success',
            });
        });
        this.router.post('/:username/submit-edit', (req, res) =>
        {

            if (isEmptyString(req.body._id))
            {
                res.send({ success: false, error: "parameters missing" });
                return;
            }
            if (req.body._id != req.session.currentUser._id)
            {
                res.send({ success: false, error: "cant edit another user" });
                return;
            }
            if (isEmptyString(req.body.username))
            {
                res.send({ success: false, error: "username cant be empty" });
                return;
            }
            if (isEmptyString(req.body.password))
            {
                res.send({ success: false, error: "password cant be empty" });
                return;
            }
            if (req.body.password != req.body.confirmPassword)
            {
                res.send({ success: false, error: "passwords dont match" });
                return;
            }
            let doEditUser = () =>
            {
                //ok username is unique!
                const data = {
                    _id: req.body._id,
                    token: req.session.currentUser.token,
                    username: req.body.username,
                    password: req.body.password,
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    age: req.body.age,
                    sex: req.body.sex,
                    epicGamesID: req.body.epicGamesID,
                    psnID: req.body.psnID,
                    instagramID: req.body.instagramID,
                    twitchID: req.body.twitchID,
                    resume: req.body.resume,
                };
                if (!isEmptyString(req.body.profileImage))
                    data.profileImage = req.body.profileImage;
                if (!isEmptyString(req.body.cover))
                    data.cover = req.body.cover;
                siteModules.User.apiCall('editProfile', data).then((result) =>
                {
                    if (isEmptyString(result._id))
                    {
                        res.send({ success: false, error: "internal server error" });
                        return;
                    }
                    result = siteModules.User.fixOne(result);
                    req.session.currentUser = result;
                    req.session.save((err) =>
                    {
                        if (err)
                        {
                            res.send({ success: false, error: err.toString() });
                            return;
                        }
                        res.send({ success: true, user: result });
                    });
                }).catch((err) =>
                {
                    res.send({ success: false, error: err.toString() });
                    return;
                });
            }
            const userPath = 'users/' + req.body._id + '/';
            if (!fs.existsSync("../storage/users/" + req.body._id + '/'))
                fs.mkdirSync("../storage/users/" + req.body._id + '/');
            this.handleFile(req, res, 'profileImage', userPath).then((img) =>
            {
                if (img)
                    req.body.profileImage = img.path;
                this.handleFile(req, res, 'cover', userPath).then((coverImage) =>
                {
                    if (coverImage)
                        req.body.cover = coverImage.path;
                    if (req.files && req.files.resume != undefined && !isEmptyString(req.files.resume.name))
                    {
                        let fileName = req.files.resume.name.toString().toLowerCase();
                        if (fileName.indexOf('.pdf') == -1 && fileName.indexOf('.txt') == -1 && fileName.indexOf('.doc') == -1
                            && fileName.indexOf('.docx') == -1 && fileName.indexOf('.jpeg') == -1 && fileName.indexOf('.jpg') == -1
                            && fileName.indexOf('.png') == -1)
                        {
                            res.send({ success: false, error: 'resume file format must be pdf/txt/doc/docx/jpg/jpeg/png ' });
                            return;
                        }
                        console.log(req.files.resume);
                    }
                    this.handleFile(req, res, 'resume', userPath).then((resumeFile) =>
                    {
                        if (resumeFile)
                            req.body.resume = resumeFile.path;
                        doEditUser();
                    }).catch((err) =>
                    {
                        res.send({ success: false, error: err.toString() });
                    });
                }).catch((err) =>
                {
                    res.send({ success: false, error: err.toString() });
                });
            }).catch((err) =>
            {
                res.send({ success: false, error: err.toString() });
            });
        });
    }
}