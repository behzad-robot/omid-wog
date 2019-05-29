import SiteRouter from "../site_router";
import { SITE_URL } from "../../constants"

export class Dota2QuizRouter extends SiteRouter
{
    constructor(siteModules)
    {
        super(siteModules);
        this.router.get('/', (req, res) =>
        {
            this.renderTemplate(req, res, 'dota2-quiz/quiz-archive.html', {});
        });
        this.router.get('/new-dummy-quiz', (req, res) =>
        {
            siteModules.User.apiCall('dota2-quiz-new-session', {
                userId: req.session.currentUser._id,
                userToken: req.session.currentUser.token,
                goal: 'dummy-quiz',
            }).then((response) =>
            {
                req.session.currentUser = response.user;
                req.session.save(() =>
                {
                    res.redirect('/dota2-quiz/quiz/' + response.session._id);
                });
            }).catch((err) =>
            {
                this.show500(req, res, err);
            })
        });
        this.router.get('/quiz/:_id', (req, res) =>
        {
            let session = undefined;
            for (var i = 0; i < req.session.currentUser.dota2Quiz.sessions.length; i++)
            {
                if (req.session.currentUser.dota2Quiz.sessions[i]._id == req.params._id)
                {
                    session = req.session.currentUser.dota2Quiz.sessions[i];
                    break;
                }
            }
            if (session == undefined)
            {
                res.status(404).send('Session not found!');
                return;
            }
            this.renderTemplate(req, res, '/dota2-quiz/quiz-page.html', {
                session: session,
                session_str : JSON.stringify(session),
            });
        });
        this.router.post('/get-questions',(req,res)=>{
            siteModules.User.apiCall('dota2-quiz-get-questions',req.body).then((response)=>{
                res.send({code : 200 , error : null , _data : response});
            }).catch((err)=>{
                res.send({code : 500 , error : err.toString() , _data : null});
            });
        });
        this.router.post('/answer-question',(req,res)=>{
            siteModules.User.apiCall('dota2-quiz-answer-question',req.body).then((response)=>{
                res.send({code : 200 , error : null , _data : response});
            }).catch((err)=>{
                res.send({code : 500 , error : err.toString() , _data : null});
            });
        });
    }
}