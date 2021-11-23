(function() {

    function icon(name) {
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-icon-name="${name}">`;
        switch(name) {
            case 'attachment': svg += '<path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>'; break;
            case 'send': svg += '<path d="M0 0h24v24H0V0z" fill="none"/><path d="M4.01 6.03l7.51 3.22-7.52-1 .01-2.22m7.5 8.72L4 17.97v-2.22l7.51-1M2.01 3L2 10l15 2-15 2 .01 7L23 12 2.01 3z"/>'; break;
            case 'reply': svg += '<path d="M0 0h24v24H0V0z" fill="none"/><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>'; break;
            // case 'send': svg += ''; break;
        }
        return svg + '</svg>'
    }

    function fillTemplate(data, template = '') {
        return template.replace(RegExp(/\[\w+\]/gm), (valName) => {
            if (typeof(data) === 'string' || typeof(data) === 'number') return data;
            return data[valName.replace(RegExp(/\[|\]/gm), '')];
        });
    }

    function iterateTemplate(list, template) {
        let html = '';
        for (let obj of list) {
            html += fillTemplate(obj, template);
        }
        return html;
    }

    class HTMLChatbox extends HTMLElement {
        config = {
            // show user avatars
            showAvatars: true,
            // setting messages float
            messages2Side: true,
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
                attachFilesFilter: function (mimetype) {
                    // allow only images
                    return mimetype.includes('image');
                }
            },
            actions: {
                messages: {context: null, click: null},
                attachments: {context: null, click: null},
                avatar: {context: null, click: null},
                onEnter: null
            }
        };
        messagesContainer;
        messageInputContainer;
        initialize(_this) {
            _this.messagesContainer = document.createElement('div'),
                _this.messageInputContainer = document.createElement('div');
            _this.messagesContainer.classList.add('messages-container');
            _this.appendChild(_this.messagesContainer);
            if (_this.config.methods.input) {
                _this.messageInputContainer.classList.add('input-container');
                _this.messageInputContainer.classList.add('attach-files')
                _this.messageInputContainer.innerHTML = `${(_this.config.methods.attachFiles ? `<div class="attachments-view"></div>
${icon('attachment')}` : '')}
<p class="textarea" contenteditable="true"></p>
${icon('send')}`;
                _this.appendChild(_this.messageInputContainer);
            }
        }
        clearChatbox() {
            this.messagesContainer.innerHTML = '';
        }
        append(elem) {
            let firstMessage = this.messagesContainer.firstChild;
            if (firstMessage) this.messagesContainer.insertBefore(elem, firstMessage);
                else this.messagesContainer.appendChild(elem);
        }
        appendMessage(obj, self) {
            /*{
                id: 0,
                author: {
                    id: 0,
                    name: 'str',
                    avatar: 'url'
                },
                content: {
                    text: 'str',
                    attachments: [
                        {
                            thumb: 'url',
                            src: 'url',
                            name: 'str'
                        }
                    ]
                }
            }*/
            let messageElem = document.createElement('div');
            messageElem.classList.add('message');
            if (this.config.messages2Side) messageElem.classList.add((self ? 'right' : 'left'));
            if (this.config.showAvatars) messageElem.classList.add('show-avatars');
            messageElem.innerHTML = `
<span class="name">${obj.author.name}</span>
${(this.config.showAvatars ? `<img src="${obj.author.avatar}" alt="${obj.author.name}">` : '')}
${(obj.content.text ? `<div class="text-box">${obj.content.text}</div>` : '')}
${((obj.content.attachments && obj.content.attachments.length > 0) ? `<div class="attachments">
${(iterateTemplate(obj.content.attachments, `<img src="[thumb]" --data-src="[src]" --data-message="${obj.id}" --data-author="${obj.author.id}" alt="[name]">`))}
</div>` : '')}`;
            this.append(messageElem);
        }

        connectedCallback() {
            this.addEventListener('keyup', ev => {
                if (ev.target.tagName === 'P') {
                    this.style.setProperty('--input-height', (ev.target.clientHeight + 2) + 'px');
                }
            })
            setTimeout(this.initialize, null, this);
        }
    }
    window.customElements.define('app-chatbox', HTMLChatbox);
})();