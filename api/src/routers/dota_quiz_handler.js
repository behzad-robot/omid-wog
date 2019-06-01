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

class Dota2QuizHttpRouter extends APIRouter
{
    constructor(handler)
    {
        super();
        this.handler = handler;
        this.router.post('/new-session', (req, res) =>
        {
            this.handler.newQuizSession(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/get-questions', (req, res) =>
        {
            this.handler.getQuestionsForQuiz(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
        this.router.post('/answer-question', (req, res) =>
        {
            this.handler.answerQuestion(req.body).then((result) =>
            {
                this.sendResponse(req, res, result);
            }).catch((err) =>
            {
                this.handleError(req, res, err);
            });
        });
    }
}
class Dota2QuizSocketRouter extends SocketRouter
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
        if (request.method == 'dota2-quiz-new-session')
        {
            this.handler.newQuizSession(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'dota2-quiz-get-questions')
        {
            this.handler.getQuestionsForQuiz(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
        else if (request.method == 'dota2-quiz-answer-question')
        {
            this.handler.answerQuestion(request.params).then((result) =>
            {
                this.sendResponse(socket, request, result);
            }).catch((err) =>
            {
                this.handleError(socket, request, err);
            });
        }
    }

}
export class Dota2QuizHandler
{
    constructor(User, Dota2Question)
    {
        this.User = User;
        this.Dota2Question = Dota2Question;
        //routers:
        this.httpRouter = new Dota2QuizHttpRouter(this);
        this.socketRouter = new Dota2QuizSocketRouter(this);
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
            this.User.findOne({ _id: params.userId }).exec((err, user) =>
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
                let s = {
                    _id: ID_MAKER(),
                    createdAt: moment_now(),
                    goal: params.goal,
                    questions: [],
                    status: 'ongoing',
                };
                user.dota2Quiz.sessions.push(s);
                this.User.findByIdAndUpdate(user._id, { $set: { dota2Quiz: user.dota2Quiz } }, { new: true }, (err, user) =>
                {
                    if (err)
                    {
                        reject(err.toString());
                        return;
                    }
                    resolve({ user, session: s });
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
            this.User.findOne({ _id: params.userId }).exec((err, user) =>
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
                this.Dota2Question.find(query).limit(20000).lean().exec((err, questions) =>
                {
                    if (err)
                    {
                        reject(err);
                        return;
                    }
                    //shuffle questions:
                    console.log(questions[0]._id);
                    for (var i = 0; i < questions.length * 2; i++)
                    {
                        let a = parseInt(Math.random() * questions.length);
                        let b = parseInt(Math.random() * questions.length);
                        let temp = questions[a];
                        questions[a] = questions[b];
                        questions[b] = temp;
                    }
                    //provide results:
                    let results = [];
                    for (var i = 0; i < questions.length && i < params.limit; i++)
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
                    if (results.length < params.limit)
                    {
                        hasDuplicates = true;
                        for (var i = 0; i < questions.length && i < (params.limit - results.length); i++)
                        {
                            results.push(questions[i]);
                        }
                    }
                    for (var i = 0; i < results.length; i++)
                    {
                        results[i] = Object.assign({}, results[i]);
                        delete (results[i].answer);
                    }
                    resolve({ questions: results, hasDuplicates });
                });
            });
        });
    }
    answerQuestion(params) //{userId , userToken , sessionId : string , questionId : string  , answer : Number }
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
            if (isEmptyString(params.sessionId))
            {
                reject('missing parameter sessionId.');
                return;
            }
            if (isEmptyString(params.questionId))
            {
                reject('missing parameter questionId.');
                return;
            }
            if (isEmptyString(params.answer.toString()) || isNaN(params.answer) || params.answer < 0)
            {
                reject('missing parameter answer.');
                return;
            }
            this.User.findOne({ _id: params.userId }).exec((err, user) =>
            {
                if (err)
                {
                    resolve(err);
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
                if (session.status == 'loose')
                {
                    reject('already lost session');
                    return;
                }
                this.Dota2Question.findOne({ _id: params.questionId }).exec((err, question) =>
                {
                    if (err)
                    {
                        reject(err.toString());
                        return;
                    }
                    if (question == undefined)
                    {
                        reject('question not found');
                        return;
                    }
                    session.questions.push({ qId: question._id, answer: params.answer });
                    let result = { correctAnswer: question.answer, answer: params.answer, question: question };
                    if (question.answer != params.answer)
                        session.status = 'loose';
                    result.session = session;
                    this.User.findByIdAndUpdate(user._id, { $set: { dota2Quiz: user.dota2Quiz } }, { new: true }, (err, user) =>
                    {
                        if (err)
                        {
                            reject(err.toString());
                            return;
                        }
                        result.user = user;
                        resolve(result);
                    });
                });
            });
        });
    }


}