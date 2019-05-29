
import { AdminRouter } from "./admin_router";
import { API_URL, ADMIN_FILE_UPLOAD } from "../constants";
import { updateCache } from "../utils/cache";
const fs = require('fs');
const path = require('path');
export default class Dota2QuestionsPanelRouter extends AdminRouter
{
    constructor(AdminModules)
    {
        super();
        const Dota2Question = AdminModules.Dota2Question;
        this.requireAdmin();
        this.router.get('/', (req, res) =>
        {
            res.send(this.renderTemplate('dota2-questions-list.html', {
                admin: req.session.admin
            }));
        });
        this.router.get('/new', (req, res) =>
        {
            Dota2Question.insert({
                _draft : true,
                level : 0,
                question : '',
                answer : 0,
                options : [],
            }).then((result) =>
            {
                if (result._id)
                {
                    fs.mkdirSync(path.resolve('../storage/dota2-quiz/'+result._id));
                    res.redirect('/admin/dota2-questions/'+result._id);
                }
                else
                    res.send(result);
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.get('/:_id/delete', (req, res) =>
        {
            Dota2Question.delete(req.params._id).then((result) =>
            {
                res.send('<p>Item Delete Result</p>'+JSON.stringify(result)+'<br><br><a href="/admin/dota2-questions/">Back to Quetions</a>');
            }).catch((err) =>
            {
                res.send(err);
            });
        });
        this.router.post('/:_id/edit', (req, res) =>
        {
            if (req.body._id == undefined)
            {
                res.send({ error: "Missing _id", code: 500 });
                return;
            }
            // console.log(req.body);
            req.body._draft = req.body._draft == 'on' ? true : false;
            req.body.options = JSON.parse(req.body.options);
            const _id = req.body._id;
            delete (req.body._id);
            Dota2Question.edit(_id, req.body).then((result) =>
            {
                // res.send({code : 200 ,error : null , _data : result});
                res.redirect('/admin/dota2-questions/'+result._id+'/?edit=success');
            }).catch((err) =>
            {
                res.send({code : 500 ,error : err.toString() , _data :null});
            });
        });
        this.router.get('/:_id', (req, res) =>
        {
            res.send(this.renderTemplate('dota2-question-single.html', {
                admin: req.session.admin,
                _id : req.params._id,
                fileUploadURL: ADMIN_FILE_UPLOAD
            }));
        });
    }
}