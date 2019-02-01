import Router from "../libs/router";

export default class SiteRouter extends Router
{
    constructor(modules)
    {
        super();
        //bind functions:
        this.requireLogin = this.requireLogin.bind(this);
        this.renderTemplate = this.renderTemplate.bind(this);
    }
    requireLogin()
    {

    }
    renderTemplate(req,res,fileName, data)
    {
        if (!fileName.includes("public/"))
            fileName = "public/" + fileName;
        try
        {
            let view_str = fileSystem.readFileSync(path.resolve(fileName)).toString();
            data.head = fileSystem.readFileSync(path.resolve('public/head.html'));
            data.actionbar = fileSystem.readFileSync(path.resolve('public/nav-bar.html'));
            data.footer = fileSystem.readFileSync(path.resolve('public/footer.html'));
            // return mustache.render(view_str, data);
            res.send(mustache.render(view_str, data));
        } catch (err)
        {
            res.send("render file failed =>" + err);
        }
    }
}