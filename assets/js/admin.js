jQuery(document).ready(function ($) {
    let mediaUploader;
    const button = $('#chat_logo_button');
    const input = $('#chat_logo');
    const wrapper = $('#chat_logo_preview_wrapper');
    const preview = $('#chat_logo_preview');

    // Select Image
    if (button.length) {
        button.on('click', function (e) {
            e.preventDefault();
            mediaUploader = wp.media({
                title: 'Select Logo',
                button: { text: 'Use this image' },
                multiple: false
            });
            mediaUploader.on('select', function () {
                const attachment = mediaUploader.state().get('selection').first().toJSON();
                input.val(attachment.url);

                if (preview.length) {
                    preview.attr('src', attachment.url).show();
                    wrapper.show();
                } else {
                    input.after(`
                        <div id='chat_logo_preview_wrapper' style='position: relative; display: inline-block; margin-top: 10px;'>
                            <img id='chat_logo_preview' src='${attachment.url}' style='max-width: 150px;' />
                            <button type='button' id='chat_logo_remove' style='
                                position: absolute;
                                top: -8px;
                                right: -8px;
                                background: #c00;
                                color: #fff;
                                border: none;
                                border-radius: 50%;
                                width: 20px;
                                height: 20px;
                                cursor: pointer;
                            '>&times;</button>
                        </div>
                    `);
                }
            });
            mediaUploader.open();
        });
    }

    // Remove image
    $(document).on('click', '#chat_logo_remove', function () {
        input.val('');
        $('#chat_logo_preview_wrapper').remove();
    });
});
