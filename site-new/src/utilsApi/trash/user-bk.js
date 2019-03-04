
import { APICollection } from "../utils/api-helper";
import { API_TOKEN, ADMIN_TOKEN } from "../constants";
import { isEmptyString } from "../utils/utils";

export const User = new APICollection('users', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
//fixers:
User.checkToken = (token) =>
{
    return new Promise((resolve, reject) =>
    {
        User.apiCall('/check-token', 'POST', { token: token }).then(resolve).catch(reject);
    });
};
User.fixOne = (user) =>
{
    if (isEmptyString(user.profileImage))
        user.profileImage = '/images/user-profile-default.png';
    if (isEmptyString(user.cover))
        user.cover = '/images/poro-pool.jpg';
    if (isEmptyString(user.aboutMe))
        user.aboutMe = 'وارد نشده.';
    return user;
};
User.public = (doc) =>
{
    doc = User.fixOne(doc);
    delete (doc.token);
    delete (doc.password);
    delete (doc.email);
    delete (doc.phoneNumber);
    return doc;
}
//override:
User._find = User.find;
User._getOne = User.getOne;
User.find = function (query, limit = 50, offset = 0)
{
    return new Promise((resolve, reject) =>
    {
        User._find(query, limit, offset).then((users) =>
        {
            users = User.fixAll(users);
            resolve(users);
        }).catch(reject);
    });
}
User.getOne = function (_id)
{
    return new Promise((resolve, reject) =>
    {
        User._getOne(_id).then((user) =>
        {
            user = User.fixOne(user);
            resolve(user);
        }).catch(reject);
    });
}
