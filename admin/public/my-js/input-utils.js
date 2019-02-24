const InputUtils = {
    bodyId : 0 ,
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
    imageInput: (name, value, settings = { 'dir': '' }) =>
    {
        $(parent).append(
            `<div class='form-row' style="background-color:#eee;border:1px solid #aaa;padding:5px;border-radius:5px;" name='image-field-${name}'>`
            + `<b>${name}:</b>`
            + `<img src="${value}" name="preview-${name}" width="100px"/>&nbsp;<small name="preview-label-${name}">${value}</small><br><small>Image is not saved as object field till you press Save.</small>`
            + `<input type="hidden" name="${name}" value="${value}"/>`
            + `</div>`
        );
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
    }
};