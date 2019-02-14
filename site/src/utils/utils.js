export function isEmptyString(str) {
    return str == undefined || str == "undefined" || str == '' || str.replace(' ', '') == '' || str == '?';
}