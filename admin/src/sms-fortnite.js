import { APICollection } from "./utils/api-helper";
import { API_TOKEN, ADMIN_TOKEN } from "./constants";
var Kavenegar = require('kavenegar');
const kaveAPI = Kavenegar.KavenegarApi({ apikey: '3936574362386C644C2B357633524F4954436A6734623462506D6B3332484A4E' });

const User = new APICollection('users', { apiToken: API_TOKEN, adminToken: ADMIN_TOKEN });

User.find({}, 20000).then((users) =>
{
    console.log(`${users.length} users are available`);
    let phoneNumbers = [];
    const smsBody = 'واج حامی گیمر ها\n' + 'شرکت کننده محترم،\nبرای کسب اطلاع از آخرین اخبار مسابقه فورنتایت واج به دیسکورد ما بپیوندید:' + '\n' + `http://bit.ly/2VQaCm7`;
    for (var i = 0; i < users.length; i++)
    {
        let user = users[i];
        if (user.fortnite2019.hasJoined)
        {
            console.log(user.username + ' is fortnite!');
            if (user.phoneNumber != '' && user.phoneNumber.indexOf('?') == -1)
                phoneNumbers.push(user.phoneNumber);
        }
    }
    let str = '';
    for (var i = 0; i < phoneNumbers.length; i++)
    {
        str += phoneNumbers[i] + ',';
        if (i % 30 == 0 && i != 0)
        {
            str = str.substr(0, str.length - 1);
            console.log(str);
            console.log('=======================');
            kaveAPI.Send({
                message: smsBody,
                sender: "1000596446",
                receptor: str,
            }, function (response, status)
            {
                console.log(response);
                console.log(status);
            });
            str = '';
        }
    }
    // phoneNumbers += '09375801307,09215760687';
    // phoneNumbers = phoneNumbers.substr(0,phoneNumbers.length-1);
    // console.log(phoneNumbers.indexOf('0936070895o'));
    // console.log(phoneNumbers);
    // kaveAPI.Send({
    //     message : smsBody,
    //     sender: "1000596446",
    //     receptor : phoneNumbers,
    // }, function(response, status) {
    //     console.log(response);
    //     console.log(status);
    // });
    console.log('SMS SENT!');
});