import moment from 'moment';
export function isEmptyString(str) {
    return str == undefined || str == "undefined" || str == '' || str.replace(' ', '') == '' || str == '?';
}
export const ICON_404 = '/images/404-image.png';

export function getResizedFileName(filePath,width,height)
{
    if(isEmptyString(filePath))
        return filePath;
    let fileName = filePath.substring(0, filePath.indexOf('.'));
    let fileFormat = filePath.substring(filePath.indexOf('.'), filePath.length);
    let file_resize = fileName + `-resize-${width}x${height}` + fileFormat;
    return file_resize;
}
export function replaceAll(target, search, replacement)
{
    return target.split(search).join(replacement);
}
export function moment_now()
{
    return moment().format('YYYY-MM-DD hh:mm:ss');
}