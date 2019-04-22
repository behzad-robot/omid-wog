const InputUtils = {
    bodyId: 0,
    fileId: 0,
    idInput: (name, value, settings = {}) =>
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
    textInput: (name, value, settings = { readonly: false, after: '', vue: false }) =>
    {
        var vue = settings.vue ? `v-model='item.name'` : '';
        var readonly = settings.readonly ? 'readonly' : '';
        var after = settings.after ? settings.after : '';
        return `<div class='form-row' label="${name}"><b>${name}:</b><input type='text' class='form-control m' ${vue} name='${name}' value='${value}' ${readonly}/>${after}</div>`;
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
        if (typeof value == 'string')
            value = value == 'true' ? true : false;
        value = value ? "checked" : "";
        return `
            <div class="for-row" label="${name}">
                <b>${name}:</b>
                <input type="checkbox" name="${name}" ${value}/>
            </div>
        `;
    },
    hiddenInput: (name, value, settings = { readonly: false }) =>
    {
        //return ":|";
        var readonly = settings.readonly ? "readonly" : "";
        return `<input type='hidden' class='form-control m' name='${name}' value='${value}' ${readonly}/>`;
    },
    imageInput: (parent, name, value, settings = { fileUploadURL: '', dir: '' }, onUploaded = undefined) =>
    {
        const f = InputUtils.fileId++;
        console.log(settings.dir);
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
            done: function (e, data)
            {
                console.log(data);
                console.log(e);
                $(`${parent} .form-row[fId=${f}] [name=status]`).html("Uploaded: " + data.result.url);
                $(`${parent} .form-row[fId=${f}] img`).attr('src', data.result.url);
                $(`${parent} .form-row[fId=${f}] input[type=hidden]`).val(data.result.path);
                $(`${parent} .form-row[fId=${f}] [name=preview-label-${name}]`).html(data.result.path);
                if (onUploaded != undefined)
                    onUploaded(data.result);
            }
        });
        console.log("this is fine");
        return "";
    },
    bodyInput: (name, value, settings = {}) =>
    {

        InputUtils.bodyId++;
        const b = InputUtils.bodyId;
        var readonly = settings.readonly ? "readonly" : "";
        setTimeout(() =>
        {
            var config = {
                font_names: `Roboto`,
                extraPlugins: 'behzad',

            };
            config.stylesSet = 'my_styles';
            // CKEDITOR.replace(name, config);
            $(`#bodyinput-${b}`).ckeditor(function ()
            {
            }, config);
        }, 300);
        return `
        <div class='form-row'>
        <b>${name}:</b>
        <textarea editor="true" id='bodyinput-${b}' class='form-control m' name='${name}' ${readonly}>${value}</textarea>
        </div>`;
    },
    airInput: (name, value, settings = {}) =>
    {
        InputUtils.bodyId++;
        const b = InputUtils.bodyId;
        return (`
        <div class="form-row" label="${name}" id="airInput-${b}" style="width:100%;border:1px solid #aaa;padding:5px;">
            <b>${name}:</b>
            <div name="preview" style="width:100%;height:200px;overflow-y:scroll">${value}</div>
            <div class="btn btn-md btn-light"  onclick="show_air_editor(undefined,'#airInput-${b}')">Edit</div>
            <textarea name="${name}" style="display:none">${value}</textarea>
        </div>
        `)
    },
    jsonInput: (name, value, settings = { readonly: false }) =>
    {
        var readonly = settings.readonly ? "readonly" : "";
        if (typeof value != 'string')
            value = JSON.stringify(value);
        return `<div class='form-row json-row'><b>${name}:</b><textarea class='form-control m' name='${name}' ${readonly}>${value}</textarea></div>`;
    },
    optionsInput: (name, value, options = [], settings = { readonly: false }) =>
    {
        var readonly = settings.readonly ? "readonly" : "";
        var optionsText = '<option></option>';
        for (var i = 0; i < options.length; i++)
        {
            var title = '', val = '';
            if (typeof options[i] == 'string')
            {
                title = options[i];
                val = options[i];
            }
            else
            {
                title = options[i].title;
                val = options[i].value;
            }
            var selected = val == value ? 'selected' : '';
            optionsText += `<option value="${val}" ${selected}>${title}</option>`;
        }
        return `<div class="form-row" label="${name}"><b>${name}:</b><select name="${name}" class="form-control m" ${readonly}>${optionsText}</select></div>`;
    },
    ID: function ()
    {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    },
};