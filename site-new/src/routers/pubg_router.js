import SiteRouter from "./site_router";
import { isEmptyString } from "../utils/utils";
import { create } from  '../utils/zarinpal/zarinpal';
const zarinpal = create()
export default class PubGRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.siteModules = siteModules;
        this.router.get('/', (req, res) =>
        {
            this.renderTemplate(req, res, 'pubgsignup.html', {});
        });
        this.router.post('/submit', (req, res) =>
        {
            if (isEmptyString(req.body.teamName))
            {
                res.status(500).send("Team name cant be empty");
                return;
            }
            if (
                    (isEmptyString(req.body.member1FirstName) || isEmptyString(req.body.member1LastName) || isEmptyString(req.body.member1PhoneNumber) || isEmptyString(req.body.member1Username))
                    || (isEmptyString(req.body.member2FirstName) || isEmptyString(req.body.member2LastName) || isEmptyString(req.body.member2PhoneNumber) || isEmptyString(req.body.member2Username))
                    || (isEmptyString(req.body.member3FirstName) || isEmptyString(req.body.member3LastName) || isEmptyString(req.body.member3PhoneNumber) || isEmptyString(req.body.member3Username))
                    || (isEmptyString(req.body.member4FirstName) || isEmptyString(req.body.member4LastName) || isEmptyString(req.body.member4PhoneNumber) || isEmptyString(req.body.member4Username))
            )
            {
                res.status(500).send("Members Info Is not compelete");
                return;
            }
            console.log('pashmam');
            var data = {
                teamName: req.body.teamName,
                payment: {
                    status: 0,
                    description: 'حق ورودیه مسابقات پابجی واج',
                    payedAt: '?',
                    refID: -1,
                },
                createdAt: this.now(),
                updatedAt: '',
                members: [
                    {
                        isLeader: true,
                        phoneNumber: req.body.member1PhoneNumber,
                        username: req.body.member1Username,
                        firstName: req.body.member1FirstName,
                        lastName: req.body.member1LastName,
                    },
                    {
                        isLeader: false,
                        phoneNumber: req.body.member2PhoneNumber,
                        username: req.body.member2Username,
                        firstName: req.body.member2FirstName,
                        lastName: req.body.member2LastName,
                    },
                    {
                        isLeader: false,
                        phoneNumber: req.body.member3PhoneNumber,
                        username: req.body.member3Username,
                        firstName: req.body.member3FirstName,
                        lastName: req.body.member3LastName,
                    },
                    {
                        isLeader: false,
                        phoneNumber: req.body.member4PhoneNumber,
                        username: req.body.member4Username,
                        firstName: req.body.member4FirstName,
                        lastName: req.body.member4LastName,
                    }
                ]
            }
            console.log('data created');
            siteModules.PubGTeam.insert(data).then((result) =>
            {
                console.log(result);
                // res.send(result);
                //call zarinpal:
                res.send('منتظر تایید زرین پال برای اتصال به درگاه پرداخت هستیم.'+'<br>'+'<a href="/pubg-tournament/callback">مشاهده پیش نمایش صفحه پس از پرداخت</a>');
                // zarinpal.PaymentRequest({}).then((result)=>{

                // }).catch((err)=>{
                //     res.status(500).send(err.toString());
                // });
            }).catch((err) =>
            {
                res.status(500).send(err.toString());
            });
        });
        this.router.get('/callback',(req,res)=>{
            this.renderTemplate(req,res,'pubg-done.html',{});
        });

    }
}