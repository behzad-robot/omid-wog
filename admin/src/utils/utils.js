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
