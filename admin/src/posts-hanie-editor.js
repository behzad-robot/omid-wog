import { APICollection } from "./utils/api-helper";
import { API_TOKEN, ADMIN_TOKEN } from "./constants";
import { replaceAll } from "../../site-new/src/utils/utils";

const Post = new APICollection('posts', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });


Post.find({},5000).then((posts)=>{
    for(var i = 0 ; i < posts.length;i++){
        let p = posts[i];
        if(p.body.indexOf('img:') != -1){
            console.log(p.title+' has a problem!!!!');
            p.body = replaceAll(p.body,'img:','img-');
            Post.edit(p._id,{body:p.body}).then((ps)=>{
                console.log(ps.title+' edited!');
            });
        }
    }
});