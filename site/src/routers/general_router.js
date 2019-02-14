import SiteRouter from "./site_router";

export default class SiteGeneralRouter extends SiteRouter {
    constructor(modules) {
        super(modules);
        this.router.get('/', (req, res) => {
            this.renderTemplate(req, res, 'wog-home.html', {});
        });
        this.router.get('/shop', (req, res) => {
            this.renderTemplate(req, res, 'coming-soon.html', {});
        });
        this.router.get('/contact-us', (req, res) => {
            this.renderTemplate(req, res, 'contact-us.html', {});
        });
        this.router.post('/contact-us-submit', (req, res) => {
            if (req.body.email == undefined || req.body.email.replace(' ', '') == '') {
                res.status(500).send({ error: "Email field cant be empty!" });
            }
            else if (req.body.subject == undefined || req.body.subject.replace(' ', '') == '') {
                res.status(500).send({ error: "Subject field cant be empty!" });
            }
            else if (req.body.body == undefined || req.body.body.replace(' ', '') == '') {
                res.status(500).send({ error: "Body field cant be empty!" });
            }
            else {
                modules.ContactUsForm.insert({
                    name: req.body.name ? req.body.name : '',
                    email: req.body.email,
                    subject: req.body.subject,
                    body: req.body.body,
                }).then((result) => {
                    res.status(200).send(result);
                }).catch((err) => {
                    res.status(500).send({ error: err.toString() });
                });;
            }
        });
        this.router.get('/html/:fileName', (req, res) => {
            this.renderTemplate(req, res, req.params.fileName + '.html', {});
        });
    }
}