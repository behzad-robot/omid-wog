import SiteRouter from "../site_router";
import { SITE_URL, IS_LOCALHOST } from "../../constants";
import { isEmptyString, replaceAll } from "../../utils/utils";

export class SocialChatRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.use((req, res, next) =>
        {
            if (!this.isLoggedIn(req))
            {
                res.redirect('/login/?redirect=/social');
                return;
            }
            next();
        });
        this.router.get('/', (req, res) =>
        {
            siteModules.SocialChatGroup.find({}).then((groups) =>
            {
                let CHAT_WS_URL = IS_LOCALHOST() ? 'ws://localhost:7575' : 'ws://worldofgamers.ir:7575';
                this.renderTemplate(req, res, 'social/social-chat.html', {
                    groups,
                    CHAT_WS_URL,
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            });
        });
    }
}
const loadSocialPosts = function (siteModules, currentUser, params)
{
    return new Promise((resolve, reject) =>
    {
        siteModules.SocialPost.find(params).then((posts) =>
        {
            for (var i = 0; i < posts.length; i++)
                posts[i] = fixPost(posts[i], currentUser);
            let requiredUsersIds = [];
            for (var i = 0; i < posts.length; i++)
            {
                let has = false;
                for (var j = 0; j < requiredUsersIds.length; j++)
                {
                    if (requiredUsersIds[j] == posts[i].userId)
                    {
                        has = true;
                        break;
                    }
                }
                if (!has)
                    requiredUsersIds.push(posts[i].userId);
            }
            siteModules.User.find({ _ids: requiredUsersIds }).then((users) =>
            {
                for (var i = 0; i < posts.length; i++)
                {
                    for (var j = 0; j < users.length; j++)
                    {
                        if (posts[i].userId == users[j]._id)
                        {
                            posts[i]._user = users[j];
                            break;
                        }
                    }
                }
                resolve(posts);
            });
        }).catch(reject);
    });
}