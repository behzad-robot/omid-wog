//form functions
const idInput = (name, value, extraInfo = {}) => {
    var after = extraInfo.after ? '&nbsp;&nbsp;&nbsp;' + extraInfo.after : '';
    return `<div class='form-row' label="${name}"><b>${name}:</b><input type='text' class='form-control m' name='${name}' value='${value}' readonly/>${after}</div>`;
};
const textInput = (name, value, settings = false) => {
    //return ":|";
    if(typeof settings == 'boolean')
    {
        var v = settings;
        settings = {};
        settings.readonly = v;
    }
    else
        settings.readonly = settings.readonly ? settings.readonly : false;
    var after = settings.after ? settings.after : '';
    var readonly = readonly ? "readonly" : "";
    console.log(settings);
    return `<div class='form-row' label="${name}"><b>${name}:</b><input type='text' class='form-control m' name='${name}' value='${value}' ${readonly}/>${after}</div>`;
};
const numberInput = (name, value, readonly = false) => {
    //return ":|";
    readonly = readonly ? "readonly" : "";
    return `<div class='form-row' label="${name}"><b>${name}:</b><input type='number' class='form-control m' name='${name}' value='${value}' ${readonly}/></div>`;
};
const boolInput = (name, value, readonly = false) => {
    var label = name;
    if (typeof name != 'string') {
        label = name.label;
        name = name.name;
    }
    readonly = readonly ? 1 : 0;
    value = value ? "checked" : "";
    return `<div class='form-row' label="${name}"><b>${label}:</b><input type='checkbox' class='form-control m' name='${name}' ${value} ${readonly}/></div>`;
}
const passwordInput = (name, value, readonly = false) => {
    //return ":|";
    readonly = readonly ? "readonly" : "";
    return `<div class='form-row' label="${name}"><b>${name}:</b><input type='password' class='form-control m' name='${name}' value='${value}' ${readonly}/></div>`;
};
const hiddenInput = (name, value, readonly = false) => {
    //return ":|";
    readonly = readonly ? "readonly" : "";
    return `<input type='hidden' class='form-control m' name='${name}' value='${value}' ${readonly}/>`;
};
let bId = 0;
const bodyInput = (name, value, settings = {}) => {
    // readonly = settings.readonly ? "readonly" : "";
    // setTimeout(function ()
    // {
    //     $(`textarea[name=${name}`).froalaEditor({
    //         // toolbarButtons: ['inlineClass'],
    //         // toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'inlineClass', 'clearFormatting', '|', 'emoticons', 'fontAwesome', 'specialCharacters', '-', 'paragraphFormat', 'lineHeight', 'paragraphStyle', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '|', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '-', 'insertHR', 'selectAll', 'getPDF', 'print', 'help', 'html', 'fullscreen', '|', 'undo', 'redo'],
    //         // toolbarButtonsXS: ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'inlineClass', 'clearFormatting', '|', 'emoticons', 'fontAwesome', 'specialCharacters', '-', 'paragraphFormat', 'lineHeight', 'paragraphStyle', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '|', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '-', 'insertHR', 'selectAll', 'getPDF', 'print', 'help', 'html', 'fullscreen', '|', 'undo', 'redo'],
    //         // toolbarButtonsMD: ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'inlineClass', 'clearFormatting', '|', 'emoticons', 'fontAwesome', 'specialCharacters', '-', 'paragraphFormat', 'lineHeight', 'paragraphStyle', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '|', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '-', 'insertHR', 'selectAll', 'getPDF', 'print', 'help', 'html', 'fullscreen', '|', 'undo', 'redo'],
    //         // toolbarButtonsSM: ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'inlineClass', 'clearFormatting', '|', 'emoticons', 'fontAwesome', 'specialCharacters', '-', 'paragraphFormat', 'lineHeight', 'paragraphStyle', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '|', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '-', 'insertHR', 'selectAll', 'getPDF', 'print', 'help', 'html', 'fullscreen', '|', 'undo', 'redo'],
    //         toolbarInline: false, height: 300,
    //         // ===========  images: ===== 
    //         imageUploadParam: 'my-file',
    //         imageUploadURL: settings.uploadUrl ? settings.uploadUrl : 'http://31.184.135.51:6565/admin/file-upload',
    //         // imageUploadParams: { 'my-dir': settings['my-dir'] },
    //         imageUploadMethod: 'POST',
    //         imageMaxSize: 12 * 1024 * 1024,  // Set max image size to 12MB.
    //         // Allow to upload PNG and JPG.
    //         imageAllowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    //         // ==== inline styles === 
    //         // Define new inline classes.
    //         inlineClasses: {
    //             'wog-lol-ap' : 'LOL AP',
    //             'wog-lol-ad' : 'LOL AD',
    //             'wog-lol-armor' : 'LOL Armor',
    //             'wog-lol-maxhp' : 'LOL Max HP',
    //         }

    //     }).on('froalaEditor.image.uploaded', function (e, editor, response)
    //     {
    //         // Image was uploaded to the server.
    //         // alert('upload success');
    //     }).on('froalaEditor.image.error', function (e, editor, error, response)
    //     {
    //         alert('upload rid code=' + error.code);
    //     });
    //     // alert(settings.uploadUrl);
    // }, 300);
    // return `<div class='form-row'><b>${name}:</b><textarea editor="true" class='form-control m' name='${name}' ${readonly}>${value}</textarea></div>`;
    bId++;
    const b = bId;
    setTimeout(() => {
        var config = {};
        config.stylesSet = 'my_styles';
        // CKEDITOR.replace(name, config);
        $(`#bodyinput-${b}`).ckeditor(function(){
        },config);
    }, 300);
    readonly = settings.readonly ? "readonly" : "";
    return `<div class='form-row'><b>${name}:</b><textarea editor="true" id='bodyinput-${b}' class='form-control m' name='${name}' ${readonly}>${value}</textarea></div>`;
};
const jsonInput = (name, value, readonly = false) => {
    readonly = readonly ? "readonly" : "";
    if (typeof value != 'string')
        value = JSON.stringify(value);
    return `<div class='form-row'><b>${name}:</b><textarea class='form-control m' name='${name}' ${readonly}>${value}</textarea></div>`;
};
var fuid = 0;
const imageInput = (parent, name, value, fileUploadURL, sizes = [], onImageUploaded = undefined) => {
    // let img = (value != null && value != '')
    //     ? `<img src='${value}' width='64px' />` + `<a class='small-link' href='${value}'>${value}</a>`
    //     : '';
    // return `<div class='form-row'><b>${name}:</b><input type='file' class='form-control m' name='${name}'/>&nbsp;&nbsp;` + img + `</div>`;
    fuid++;
    var otherSizes = '<br>';
    var sizesParams = '';
    // console.log(parent);
    for (var i = 0; i < sizes.length; i++) {
        var size = sizes[i];
        let fileName = value.substring(0, value.indexOf('.'));
        let fileFormat = value.substring(value.indexOf('.'), value.length);
        console.log(fileName);
        console.log(fileFormat);
        let icon_sized = fileName + `-resize-${size.width}x${size.height}` + fileFormat;
        let url = icon_sized;
        otherSizes += `<div style="display:inline-block;padding:2px;" class="text-center"><img src="${url}" width="64px" name="preview-${name}-${size.width}-${size.height}"/><br><span style="font-size:10px">${size.width}x${size.height}</span></div>`;
        if (i == 0)
            sizesParams = (fileUploadURL.indexOf("?") == -1 ? "?" : "&") + 'sizes=';
        sizesParams += size.width + 'x' + size.height + (i != sizes.length - 1 ? ',' : '');
    }
    $(parent).append(
        `<div class='form-row' style="background-color:#eee;border:1px solid #aaa;padding:5px;border-radius:5px;" name='image-field-${name}' fuid="${fuid}">`
        + `<b>${name}:</b>`
        + `<img src="${value}" name="preview-${name}" width="100px"/>&nbsp;<small name="preview-label-${name}">${value}</small><br><small>Image is not saved as object field till you press Save.</small>`
        + otherSizes
        + `<input type="hidden" name="${name}" value="${value}"/>`
        + `</div>`
    );
    fileUploadTool(`[fuid=${fuid}]`, name, fileUploadURL + sizesParams, (result) => {
        console.log(result);
        var value = result.path;
        $(`${parent} input[name=${name}`).val(value).trigger('change');
        $(`${parent} img[name=preview-${name}]`).attr('src', value);
        $(`${parent} [name=preview-label-${name}]`).html(value);
        for (var i = 0; i < sizes.length; i++) {
            var size = sizes[i];
            let fileName = value.substring(0, value.indexOf('.'));
            let fileFormat = value.substring(value.indexOf('.'), value.length);
            let icon_sized = fileName + `-resize-${size.width}x${size.height}` + fileFormat;
            $(`${parent} img[name=preview-${name}-${size.width}-${size.height}]`).attr('src', icon_sized);
        }
        if (onImageUploaded != null)
            onImageUploaded(result);
    });
}
const fileInput = (name, value) => {
    let img = (value != null && value != '')
        ? `<a class='small-link' href='${value}'>${value}</a>`
        : '';
    return `<div class='form-row'><b>${name}:</b><input type='file' class='form-control m' name='${name}'/>&nbsp;&nbsp;` + img + `</div>`;
}
// values:{value:string,title:string}
const dropDown = (name, values, value = '') => {
    let str = `<div class='form-row'><b>${name}:</b><select class='form-control m' name='${name}'>`;
    str = str + `<option value=''></option>`;
    if (typeof values[0] == 'string') {
        for (var i = 0; i < values.length; i++) {
            let selected = value == values[i] ? 'selected' : '';
            str = str + `<option value='${values[i]}' ${selected}>${values[i]}</option>`;
        }
    }
    else {
        //TODO
        for (var i = 0; i < values.length; i++) {
            let selected = value == values[i].value ? 'selected' : '';
            str = str + `<option value='${values[i].value}' ${selected}>${values[i].title}</option>`;
        }
    }
    str = str + '</select></div>';
    return str;
};



const submitBtn = (text = 'Save') => {
    return `<input type="submit" class="btn btn-lg btn-success" value="${text}" />`;
}
const initEditors = () => {
    //$('textarea[input=name').froalaEditor({toolbarInline: false})
}
const mediaItemBox = (media, onClick = '') => {
    return `<div class='col-md-3'><div class='media-item-box' path='${media.path}'>` +
        `<a href='${media.url}' class='thumbnail' style='background-image:url("${media.url}")'></a>` +
        `<div onclick='${onClick}("${media.path}")' class='btn btn-md btn-warning'>Remove</div>` +
        `</div></div>`;
}
//media functions:
const loadMedia = (url, next) => {
    if (url.indexOf('http') == -1) {
        $.get({
            url: API.media(url),
            success: function (data) {
                //console.log(data);
                let result = JSON.parse(data);
                next(result);
            }
        });
    }
    else {
        next({ url: url });
    }
};
//file uploader
const fileUploadTool = (parent, name, fileUploadURL, onUploaded) => {
    console.log('fileUploadTool=>' + parent);
    $(parent).append(
        `<div class="form-row" name="${name}-container">`
        + `<b>${name}</b>`
        + `<input type="file" name="my-file" class="form-control m" data-url="${fileUploadURL}">`
        + `<small name="status">Select a file!</small>`
        + `</div>`
    );
    $(`${parent} .form-row[name=${name}-container] input[name=my-file]`).fileupload(
        {
            dataType: 'json',
            progressall: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $(`${parent} .form-row[name=${name}-container] [name=status]`).html(`Uploading ${progress}% ...`);
            },
            done: function (e, data) {
                console.log(data);
                console.log(e);
                $(`${parent} .form-row[name=${name}-container] [name=status]`).html("Uploaded: " + data.result.url);
                if (onUploaded != undefined)
                    onUploaded(data.result);
            }
        }
    );
}
