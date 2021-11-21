class HTMLChatbox extends HTMLElement {
    config = {
        // show user avatars
        showAvatars: {
            // for send messages from current client
            self: true,
            // from others
            others: true
        },
        // setting messages float
        messagesFloat: {
            // for send messages from current client
            self: 'right',
            // from others
            others: 'left'
        },
        // show message without waiting for server response
        showMessageInChatboxOnEnter: true,
        // allowed methods
        methods: {
            // allow user input
            input: true,
            // add forward button for message
            forwardMessage: true,
            // add more button on message
            moreActionsMessage: true,
            // allow adding files
            attachFiles: true,
            // filter files by type
            attachFilesFilter: function(mimetype) {
                // allow only images
                return mimetype.includes('image');
            }
        },
        actions: {
            messages: {
                context: null,
                click: null
            },
            attachments: {
                context: null,
                click: null
            },
            avatar: {
                context: null,
                click: null
            },
            onEnter: null
        }
    };
    // unique chat-id for generated css rules
    cid = Math.random().toString(36).substr(2);
    connectedCallback() {

    }
}