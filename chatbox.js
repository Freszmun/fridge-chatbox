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
            // show user names
            showNames: true,
            // show message time
            showTime: true,
            // setting messages float
            messages2Side: true,
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
                onSend: null,
                requestHistory: null
            }
        };
        messagesContainer;
        messageInputContainer;
        requestingHistory = false;
        lastScrollY = 0;
        initialize(_this) {
            _this.messagesContainer = document.createElement('div');
            _this.messageInputContainer = document.createElement('div');
            _this.messagesContainer.classList.add('messages-container');
            _this.appendChild(_this.messagesContainer);
            if (_this.config.methods.input) {
                _this.messageInputContainer.classList.add('input-container');
                if (_this.config.methods.attachFiles) _this.messageInputContainer.classList.add('attach-files');
                _this.messageInputContainer.innerHTML = `${(_this.config.methods.attachFiles ? `<div class="attachments-view"></div>
${icon('attachment')}` : '')}
<p class="textarea" contenteditable="true"></p>
${icon('send')}`;
                _this.appendChild(_this.messageInputContainer);
            }
            let noreqHistory = () => {
                setTimeout(() => {
                    _this.requestingHistory = false;
                }, 200);
            }
            _this.messagesContainer.addEventListener('scroll', ev => {
                if (_this.config.actions.requestHistory && !_this.requestingHistory && ev.target.scrollTop < 3 && _this.lastScrollY > ev.target.scrollTop) {
                    _this.requestingHistory = true;
                    if (_this.config.actions.requestHistory.then) {
                        _this.config.actions.requestHistory(_this).then(() => {
                            noreqHistory();
                        }).catch(err => {
                            noreqHistory();
                            console.error(err);
                        });
                    } else {
                        try {
                            _this.config.actions.requestHistory(_this);
                        } catch(err) {
                            console.error(err);
                        }
                        noreqHistory();
                    }
                }
                _this.lastScrollY = ev.target.scrollTop;
            });
        }
        clearChatbox() {
            this.messagesContainer.innerHTML = '';
        }
        appendBefore(elem) {
            let firstMessage = this.messagesContainer.firstChild;
            if (firstMessage) {
                this.messagesContainer.insertBefore(elem, firstMessage);
                if (firstMessage.getAttribute('data-message-author') === elem.getAttribute('data-message-author')) {
                    let elems = [firstMessage.querySelector('img'), firstMessage.querySelector('.name')];
                    if (elems[0]) firstMessage.removeChild(elems[0]);
                    if (elems[1]) firstMessage.removeChild(elems[1]);
                    firstMessage.classList.add('tab');
                    elem.classList.add('tab-group');
                }
            } else this.messagesContainer.appendChild(elem);
        }
        append(elem) {
            let lastMessage = this.messagesContainer.lastChild;
            this.messagesContainer.appendChild(elem);
            if (lastMessage && lastMessage.getAttribute('data-message-author') === elem.getAttribute('data-message-author')) {
                let elems = [elem.querySelector('img'), elem.querySelector('.name')];
                if (elems[0]) elem.removeChild(elems[0]);
                if (elems[1]) elem.removeChild(elems[1]);
                elem.classList.add('tab');
                elem.previousElementSibling.classList.add('tab-group');
            }
        }
        createMessage(obj, self) {
            /*{
                id: 0,
                time: 'yyyy-mm-dd hh:mm',
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
            messageElem.setAttribute('data-message-id', obj.id);
            messageElem.setAttribute('data-message-author', obj.author.id);
            messageElem.innerHTML = `
${(this.config.showTime ? `<span class="time">${obj.time}</span>` : '')}
${(this.config.showAvatars ? `<img class="avatar" src="${obj.author.avatar}" alt="${obj.author.name}">` : '')}
${(this.config.showNames ? `<span class="name">${obj.author.name}</span>` : '')}
${(obj.content.text ? `<div class="text-box"></div>` : '')}
${((obj.content.attachments && obj.content.attachments.length > 0) ? `<div class="attachments">
${(iterateTemplate(obj.content.attachments, `<img class="attachment" src="[thumb]" data-src="[src]" data-message="${obj.id}" data-author="${obj.author.id}" alt="[name]">`))}
</div>` : '')}`;
            if (obj.content.text) setTimeout(() => {
                messageElem.querySelector('.text-box').innerText = obj.content.text;
            })
            return messageElem;
        }
        appendMessage(obj, self) {
            let scrollBottom = (this.messagesContainer.scrollHeight - 40 <= this.messagesContainer.scrollTop + this.messagesContainer.clientHeight) ? (this.messagesContainer.scrollHeight + 9999) : false;
            this.append(this.createMessage(obj, self));
            if (scrollBottom) setTimeout(() => {
                this.messagesContainer.scrollTo(0, scrollBottom);
            });
        }
        appendBeforeMessage(obj, self) {
            this.appendBefore(this.createMessage(obj, self));
        }

        checkInputHeight(ev) {
            if (ev.target.tagName === 'P')
                this.style.setProperty('--input-height', (ev.target.clientHeight + 2) + 'px');
        }

        sendAction(elem) {
            let text = elem.innerText;
            if (!text || text === '') return;
            if (this.config.actions.onSend) this.config.actions.onSend(text);
            elem.innerHTML = '';
            this.style.setProperty('--input-height', (elem.clientHeight + 2) + 'px');
        }

        connectedCallback() {
            this.addEventListener("paste", function(ev) {
                ev.preventDefault();
                let text = (ev.originalEvent || ev).clipboardData.getData('text/plain');
                document.execCommand("insertText", false, text);
                this.checkInputHeight(ev);
            });
            this.addEventListener('cut', this.checkInputHeight);
            this.addEventListener('change', this.checkInputHeight);
            this.addEventListener('keydown', ev => {
                if (ev.target.tagName === 'P'&& ev.key === 'Enter' && !ev.shiftKey) ev.preventDefault();
            });
            this.addEventListener('keyup', ev => {
                if (ev.target.tagName === 'P') {
                    this.style.setProperty('--input-height', (ev.target.clientHeight + 6) + 'px');
                    if (ev.key === 'Enter') {
                        if (!ev.shiftKey) {
                            this.sendAction(ev.target);
                        }
                    }
                }
            });
            this.addEventListener('click', ev => {
                if (!ev.target) return;
                if (ev.target.getAttribute('data-icon-name') === 'send') {
                    this.sendAction(this.messageInputContainer.querySelector("p.textarea"));
                }
                let closestMessage = ev.target.closest('.message');
                if (closestMessage) {
                    if (closestMessage.classList.contains('show-date')) {
                        closestMessage.classList.remove('show-date');
                    } else {
                        closestMessage.classList.add('show-date');
                    }
                }
            });

            this.addEventListener('dragover', function (ev) {
                ev.preventDefault();
            });
            this.addEventListener('drop', ev => {
                ev.preventDefault();
                let attachmentsContainer = this.messageInputContainer.querySelector('.attachments-view');
                if (!attachmentsContainer.files) attachmentsContainer.files = [];
                    for (let dataTransfer of ev.dataTransfer.items) {
                        let file = dataTransfer.getAsFile();
                        if (this.config.methods.attachFilesFilter && this.config.methods.attachFilesFilter(file.type)) {
                            let img = document.createElement('IMG'),
                                reader = new FileReader();
                            img.setAttribute('alt', file.name);
                            reader.onload = () => {
                                img.src = reader.result;
                            }
                            reader.readAsDataURL(file);
                            img.file = file;
                            attachmentsContainer.appendChild(img);
                            attachmentsContainer.files.push(file);
                        }
                    }

            });

            setTimeout(this.initialize, null, this);
        }
    }
    window.customElements.define('app-chatbox', HTMLChatbox);
})();
