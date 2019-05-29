import APIRouter from "./api_router";
import { SocketRouter } from "./socket_router";
import { isEmptyString, moment_now } from "../utils/utils";
import { JesEncoder } from "../utils/jes-encoder";
import { API_ENCODE_KEY } from "../constants";
const encoder = new JesEncoder(API_ENCODE_KEY);

const ID_MAKER = () =>
{
    return '_' + Math.random().toString(36).substr(2, 9);
};

class DotaQuizHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.post('/new-comment', (req, res) =>
        {
            this.handler.newComment(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
    }
}
class DotaQuizSocketRouter extends SocketRouter
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
        if (request.method == 'new-comment')
        {
            this.handler.newComment(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
    }

}
export class DotaQuizHandler
{
    constructor(User, Dota2Question)
    {
        this.User = User;
        this.Dota2Question = Dota2Question;
        //routers:
        this.httpRouter = new DotaQuizHttpRouter(this);
        this.socketRouter = new DotaQuizSocketRouter(this);
        //bind functions:
        this.newQuizSession = this.newQuizSession.bind(this);
        this.getQuestionsForQuiz = this.getQuestionsForQuiz.bind(this);
        this.answerQuestion = this.answerQuestion.bind(this);
    }
    newQuizSession(params) //{userId , userToken , goal }
    {
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.userId))
            {
                reject('missing parameter userId.');
                return;
            }
            if (isEmptyString(params.userToken))
            {
                reject('missing parameter userToken.');
                return;
            }
            if (isEmptyString(params.goal))
            {
                reject('missing parameter goal.');
                return;
            }
            this.User.findOneById(params.userId).exec((err, user) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                if (user.token != params.userToken)
                {
                    reject('invalid userToken');
                    return;
                }
                if (user.dota2Quiz == undefined)
                    user.dota2Quiz = { sessions: [] };
                user.dota2Quiz.sessions.push({
                    _id: ID_MAKER(),
                    createdAt: moment_now(),
                    goal: params.goal,
                    questions: [],
                    status: 'ongoing',
                });
                this.User.findByIdAndUpdate(user._id, { $set: { dota2Quiz: user.dota2Quiz } }, { new: true }, (err, user) =>
                {
                    if (err)
                    {
                        reject(err.toString());
                        return;
                    }
                    resolve(user);
                });
            });
        });
    }
    /**
     * this function removes answer field from questions! :))
     * also makes sure we are not passing duplicate questions if possible!
     */
    getQuestionsForQuiz(params) //{userId , userToken , sessionId , limit : 1 , level : -1 }
    {
        if (params.limit == undefined)
            params.limit = 1;
        if (params.level == undefined)
            params.level = -1;
        return new Promise((resolve, reject) =>
        {
            if (isEmptyString(params.userId))
            {
                reject('missing parameter userId.');
                return;
            }
            if (isEmptyString(params.userToken))
            {
                reject('missing parameter userToken.');
                return;
            }
            if (isEmptyString(params.sessionId))
            {
                reject('missing parameter sessionId.');
                return;
            }
            this.User.findOneById(params.userId).exec((err, user) =>
            {
                if (err)
                {
                    reject(err.toString());
                    return;
                }
                if (user.token != params.userToken)
                {
                    reject('invalid userToken');
                    return;
                }
                if (user.dota2Quiz == undefined)
                {
                    reject('invalid sessionId');
                    return;
                }
                let session = undefined;
                for (var i = 0; i < user.dota2Quiz.sessions.length; i++)
                {
                    if (user.dota2Quiz.sessions[i]._id == params.sessionId)
                    {
                        session = user.dota2Quiz.sessions[i];
                        break;
                    }
                }
                if (session == undefined)
                {
                    reject('invalid sessionId');
                    return;
                }
                let query = {};
                if (params.level != -1)
                    query.level = params.level;
                this.Dota2Question.find(query).limit(20000).exec((err, questions) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    //shuffle questions:
                    for (var i = 0; i < questions.length * 2; i++)
                    {
                        let a = Math.random() % questions.length;
                        let b = Math.random() % questions.length;
                        let temp = questions[a];
                        questions[a] = questions[b];
                        questions[b] = temp;
                    }
                    //provide results:
                    let results = [];
                    for (var i = 0; i < questions.length; i++)
                    {
                        let has = false;
                        //check not in session questions:
                        for (var j = 0; j < session.questions.length; j++)
                        {
                            if (session.questions[j].qId == questions[i]._id)
                            {
                                has = true;
                                break;
                            }
                        }
                        if (!has)
                            results.push(questions[i]);
                    }
                    let hasDuplicates = false;
                    if (results.length < limit)
                    {
                        hasDuplicates = true;
                        for (var i = 0; i < questions.length && i < (limit - results.length); i++)
                        {
                            results.push(questions[i]);
                        }
                    }
                    resolve({questions,hasDuplicates});
                });
            });
        });
    }
    answerQuestion(params) //{userId , userToken , questionId : string  , answer : Number }
    {
        return new Promise((resolve, reject) =>
        {

        });
    }


}