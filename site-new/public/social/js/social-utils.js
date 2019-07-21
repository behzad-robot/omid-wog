function showToast(icon,text)
{
    let toastSection = $(".toast-section");
    if (toastSection == undefined || toastSection.length == 0)
    {
        $("body").append(`
        <section class="toast-section">
        <div class="container">
            <div class="toast-alert">
                <img class="toast-icon" src="/storage/social-posts/5d33e17bcf3029144d59085c/DvuS6XTX4AED0Dp-1563681129770-resize-150x150.jpg"/>
                <div class="toast-text"></div>   
            </div>
        </div>
        </section>`);
    }
    $(".toast-icon").attr('src', icon);
    $(".toast-text").html(text);
    //
    $(".toast-section").animate({ 'bottom': '20px' }, 200);
    setTimeout(() =>
    {
        $(".toast-section").animate({ 'bottom': '-200px' }, 200);
    }, 2200);
}