import { APICollection } from "../utils/api-helper";
import { API_TOKEN, ADMIN_TOKEN } from "../constants";
import { isEmptyString } from "../utils/utils";

export const Champion = new APICollection('champions', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });
//fixers:
Champion.fixOne = (champ) =>
{
    if (isEmptyString(champ.icon))
        champ.icon = ICON_404;
    if (isEmptyString(champ.icon_gif))
        champ.icon_gif = champ.icon_tall;
    console.log('persian=>' + champ.descriptionPersian + '=>' + isEmptyString(champ.descriptionPersian));
    if (isEmptyString(champ.descriptionPersian.replace(' ', '').replace('<br>', '').replace('\n', '')))
        champ.descriptionPersian = 'وارد نشده';
    champ.siteUrl = '/champions/' + champ.slug;
    champ.roles_str = '';
    for (var i = 0; i < champ.roles.length; i++)
        champ.roles_str += champ.roles[i].name + ' , ';
    champ.roles_str = champ.roles_str.substring(0, champ.roles_str.length - 1);
    return champ;
};
Champion.fixAll = (champions) =>
{
    for (var i = 0; i < champions.length; i++)
    {
        champions[i] = Champion.fixOne(champions[i]);
    }
    return champions;
};
//override:
Champion._find = Champion.find;
Champion._getOne = Champion.getOne;
Champion.find = function (query, limit = 50, offset = 0)
{
    return new Promise((resolve, reject) =>
    {
        Champion._find(query, limit, offset).then((champs) =>
        {
            champs = Champion.fixAll(champs);
            resolve(champs);
        }).catch(reject);
    });
}
Champion.getOne = function (_id)
{
    return new Promise((resolve, reject) =>
    {
        Champion._getOne(_id).then((champ) =>
        {
            champ = Champion.fixOne(champ);
            resolve(champ);
        }).catch(reject);
    });
}
