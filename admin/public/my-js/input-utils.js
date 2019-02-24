const InputUtils = {
    bodyId: 0,
    fileId: 0,
    idInput: (name, value, settings) =>
    {
        var after = settings.after ? settings.after : '';
        return `<div class='form-row' label="${name}"><b>${name}:</b><input type='text' class='form-control m' name='${name}' value='${value}' readonly/>${after}</div>`;
    },
    draftInput: (value, settings = { name: '_draft', extraInfo: {} }) =>
    {
        if (value == undefined)
            value = false;
        return (
            `
                <div class="form-row">
                    <b>${settings.name}</b>
                    <input type="checkbox" ${value === true ? 'checked' : ''}  name="${settings.name}"/>
                </div>
            `
        );
    },
    textInput: (name, value, settings = { readonly: false, after: '' }) =>
    {
        var readonly = settings.readonly ? 'readonly' : '';
        var after = settings.after ? settings.after : '';
        return `<div class='form-row' label="${name}"><b>${name}:</b><input type='text' class='form-control m' name='${name}' value='${value}' ${readonly}/>${after}</div>`;
    },
    numberInput: (name, value, settings = { readonly: false, after: '' }) =>
    {
        //return ":|";
        var readonly = settings.readonly ? "readonly" : "";
        var after = settings.after ? settings.after : '';
        return `<div class='form-row' label="${name}"><b>${name}:</b><input type='number' class='form-control m' name='${name}' value='${value}' ${readonly}/>${after}</div>`;
    },
    boolInput: (name, value, settings = { after: '' }) =>
    {
        var after = settings.after ? settings.after : '';
        value = value ? "checked" : "";
        return `
            <div class="for-row" label="${name}">
                <b>${name}:</b>
                <input type="checkbox" name="${name}" ${value}/>
            </div>
        `;
    },
    hiddenInput : (name, value, settings = { readonly: false }) =>
    {
        //return ":|";
        var readonly = settings.readonly ? "readonly" : "";
        return `<input type='hidden' class='form-control m' name='${name}' value='${value}' ${readonly}/>`;
    },
    imageInput: (parent,name, value, settings = { fId: -1, fileUploadURL: '', dir: '' } , onUploaded = undefined) =>
    {
        const f = InputUtils.fileId++;
        $(parent).append(
            `<div class='form-row' style="background-color:#eee;border:1px solid #aaa;padding:5px;border-radius:5px;" fId="${f}" name='image-field-${name}'>
            <b>${name}:</b>
            <img src="${value}" name="preview-${name}" width="100px"/>&nbsp;<small name="preview-label-${name}">${value}</small><br><small>Image is not saved as object field till you press Save.</small>
            <input type="hidden" name="${name}" value="${value}"/>
            <input type="file" name="my-file" fId="${f}" class="form-control m" data-url="${settings.fileUploadURL}">
            <small name="status"></small>
            </div>`
        );
        $(`${parent} .form-row[fId=${f}] input[type=file]`).fileupload({
            dataType: 'json',
            formData: { 'dir': settings.dir },
            progressall: function (e, data)
            {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $(`${parent} .form-row[fId=${f}] [name=status]`).html(`Uploading ${progress}% ...`);
            },
            done: function (e, data) {
                console.log(data);
                console.log(e);
                // $(`${parent} .form-row[fId=${f}] [name=status]`).html("Uploaded: " + data.result.url);
                // if (onUploaded != undefined)
                //     onUploaded(data.result);
            }
        });
    },
    bodyInput: (name, value, settings = {}) =>
    {
        InputUtils.bodyId++;
        const b = InputUtils.bodyId;
        return `
        <div class='form-row'>
        <b>${name}:</b>
        <textarea editor="true" id='bodyinput-${b}' class='form-control m' name='${name}' ${readonly}>${value}</textarea>
        </div>`;
    },
    ID : function ()
    {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    },
};