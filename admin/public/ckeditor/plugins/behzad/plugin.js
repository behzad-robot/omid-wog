CKEDITOR.plugins.add( 'behzad', {
    icons: 'behzad,image-right,image-left',
    init: function( editor ) {
        editor.addCommand('insertImageRText',{
            exec : function(editor){
                var now = new Date();
                editor.insertHtml( `
                <div class="wog-insertImageRText">
                    <img src="https://via.placeholder.com/800x600?text=Your+Text+Comes+Here" style="float:right"/>
                    <p>Your Text Comes Here</p>
                </div>
                ` );
            }
        });
        editor.ui.addButton( 'insertImageRText', {
            label: 'Insert Image Right + Text',
            command: 'insertImageRText',
            toolbar: 'insert',
            icon : 'image-right',
        });
        // alert(":D behzad plugin is alive!");
    }
});