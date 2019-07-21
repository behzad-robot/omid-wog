import { SocketCollection } from "../utils/socket-collection";
import { isEmptyString, ICON_404, replaceAll } from "../utils/utils";
import { SITE_URL } from "../constants";
import * as linkify from 'linkifyjs';;
import linkifyHtml from 'linkifyjs/html';
import hashtag from 'linkifyjs/plugins/hashtag'; // optional

export class SocialPost extends SocketCollection
{
    constructor(apiSocket)
    {
        super('social-posts', apiSocket);
        this.fixOne = this.fixOne.bind(this);
        this.fixAll = this.fixAll.bind(this);
        this.public = this.public.bind(this);
        this.find = this.find.bind(this);
        this.getOne = this.getOne.bind(this);
    }
    find(params = {})
    {
        return new Promise((resolve, reject) =>
        {
            super.find(params).then((results) =>
            {
                results = this.fixAll(results);
                resolve(results);
            }).catch(reject);
        });

    }
    getOne(_id)
    {
        return new Promise((resolve, reject) =>
        {
            super.getOne(_id).then((result) =>
            {
                result = this.fixOne(result);
                resolve(result);
            }).catch(reject);
        });
    }
    fixOne(u)
    {
        u.siteUrl = SITE_URL('/social/posts/' + u._id);
        u.editUrl = SITE_URL('/social/posts/edit/' + u._id);
        u.deleteUrl = SITE_URL('/social/posts/delete/' + u._id);
        u.body_formatted = u.body;
        // if (u.tags != undefined && u.tags.length != 0)
        // {
        //     let tags = u.body_formatted.match(/#[a-z]+/gi);
        //     for (var i = 0; i < tags.length; i++)
        //     {
        //         let url = SITE_URL('/social/posts-archive/?tag=' + tags[i]);
        //         u.body_formatted = replaceAll(u.body_formatted, tags[i], `<a href="${url}">${tags[i]}</a>`);
        //     }
        // }
        // u.body_formatted = linkifyHtml(u.body_formatted);
        u.body_formatted = replaceAll(u.body_formatted, '\r\n', '\n');
        u.body_formatted = resolveBody(u.body_formatted);
        u.body_formatted = replaceAll(u.body_formatted, '\n', '<br>');
        
        // u.body_formatted = hashtag(u.body_formatted);
        return u;
    }
    fixAll(cs)
    {
        for (var i = 0; i < cs.length; i++)
            cs[i] = this.fixOne(cs[i]);
        return cs;
    }
    public(u)
    {
        return u;
    }
}

function resolveBody(str)
{
    // order matters
    var re = [
        "\\b((?:https?|ftp)://[^\\s\"'<>]+)\\b",
        "\\b(www\\.[^\\s\"'<>]+)\\b",
        "\\b(\\w[\\w.+-]*@[\\w.-]+\\.[a-z]{2,6})\\b",
        //"#([a-z0-9]+)"
        "#([^#]+)[\s,;\n]*"
    ];
    re = new RegExp(re.join('|'), "gi");

    return str.replace(re, function (match, url, www, mail, twitler)
    {
        if (url)
            return "<a href=\"" + url + "\">" + url + "</a>";
        if (www)
            return "<a href=\"http://" + www + "\">" + www + "</a>";
        if (mail)
            return "<a href=\"mailto:" + mail + "\">" + mail + "</a>";
        if (twitler) //return "<a href=\"foo?bar=" + twitler + "\">#" + twitler + "</a>";
        {
            let hasEnter = twitler.indexOf('\n') != -1 ? '\n' : '';
            twitler = twitler.replace('\n','');
            return `<a href="${SITE_URL('/social/posts-archive/?tag=' + twitler)}">#${twitler}</a>${hasEnter}`;
        }

        // shouldnt get here, but just in case
        return match;
    });
}