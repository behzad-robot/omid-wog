CKEDITOR.plugins.add( 'behzad', {
    icons: 'behzad,image-right,image-left',
    init: function( editor ) {
        editor.addCommand('imageWithCaption',{
            exec : function(editor){
                var now = new Date();
                editor.insertHtml( `
                <!--<figure class="image" style="display:inline-block">
                    <img alt="^_^" height="auto" src="https://via.placeholder.com/800x600?text=Your+Text+Comes+Here" width="100%">
                    <figcaption>fuck this shit</figcaption>
                </figure>-->
                <div class="wog-image-with-caption">
                    <img alt="^_^" height="auto" src="https://via.placeholder.com/800x600?text=Your+Text+Comes+Here" width="100%">
                    <p>this is fine</p>
                </div>
                ` );
            }
        });
        editor.ui.addButton( 'imageWithCaption', {
            label: 'Insert Image With Caption',
            command: 'imageWithCaption',
            toolbar: 'insert',
            icon : 'image-right',
        });
        // alert(":D behzad plugin is alive!");
    }
});