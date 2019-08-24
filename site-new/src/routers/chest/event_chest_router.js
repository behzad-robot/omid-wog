import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants"
const fs = require('fs');
const path = require('path');
const SUBMITED_FILE = path.resolve('../storage/event-numbers.json');
const EVENT_USERNAME_NUMBER_FILE = path.resolve('../storage/event-username-number.txt');
export class EventChestRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        let announceWinner = false;
        this.router.get('/admin', (req, res) =>
        {
            this.renderTemplate(req, res, 'event-chest/admin.html', {
                announceWinner: announceWinner,
            });
        });
        this.router.all('/admin/submit', (req, res) =>
        {
            announceWinner = req.query.winner && req.query.winner == 'true';
            res.redirect('/event-chest/admin');
        });
        this.router.get('/signup', (req, res) =>
        {
            let username = getGeneratedUsername();
            let email = username+"@gmail.com";
            this.renderTemplate(req, res, 'event-chest/signup.html', {
                username : username,
                email : email,
            });
        });
        this.router.get('/open-chest', (req, res) =>
        {
            if (!this.isLoggedIn(req))
            {
                res.redirect('/login/?redirect=' + '/event-chest/open-chest');
                return;
            }
            this.renderTemplate(req, res, 'event-chest/open-chest.html', {

            });
        });
        this.router.post('/open-chest/submit', (req, res) =>
        {
            req.body.number = parseInt(req.body.number);
            siteModules.User.find({ _id: req.body.userId }).then((users) =>
            {
                let user = users[0];
                if (user.canDoChestEvent == undefined || user.canDoChestEvent === true)
                {
                    siteModules.User.edit(req.body.userId, { canDoChestEvent: false }).then((user) =>
                    {
                        loadSubmitedNumbers().then((numbers) =>
                        {
                            let submitedBefore = false;
                            for (var i = 0; i < numbers.length; i++)
                            {
                                if (req.body.number == numbers[i])
                                {
                                    submitedBefore = true;
                                    break;
                                }
                            }
                            if (submitedBefore)
                            {
                                res.send({ code: 200, winner: false });
                            }
                            else
                            {
                                addToSubmitedNumbers(req.body.number).then(() =>
                                {
                                    res.send({ code: 200, winner: announceWinner });
                                    announceWinner = false;
                                });
                            }
                        });

                    }).catch((err) =>
                    {
                        res.send({ code: 500, error: err });
                    });
                }
                else
                    res.send({ code: 500, error: "already done event" });
            });
        });
    }
}
function loadSubmitedNumbers()
{
    return new Promise((resolve, reject) =>
    {
        let hasFile = fs.existsSync((SUBMITED_FILE));
        if (!hasFile)
            resolve([]);
        else
        {
            resolve(JSON.parse(fs.readFileSync((SUBMITED_FILE)).toString()));
        }
    });
}
function addToSubmitedNumbers(number)
{
    return new Promise((resolve, reject) =>
    {
        loadSubmitedNumbers().then((numbers) =>
        {
            numbers.push(number);
            fs.writeFile((SUBMITED_FILE), JSON.stringify(numbers), (err) =>
            {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    });
}
function getGeneratedUsername(){
    // console.log(fs.readFileSync(EVENT_USERNAME_NUMBER_FILE).toString());
    var number = parseInt(fs.readFileSync(EVENT_USERNAME_NUMBER_FILE).toString());
    number++;
    var username = "user_"+number.toString();
    fs.writeFileSync(EVENT_USERNAME_NUMBER_FILE,number.toString());
    return username;
}