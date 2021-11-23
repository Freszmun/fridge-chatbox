const chatbox = document.querySelector('app-chatbox');
let messages = 0;
chatbox.config.actions.onSend = function(text) {
    let now = new Date(),
        time = (now.toLocaleDateString() + ' ' + now.toLocaleTimeString()).split(':');
    time.splice(2, 1);
    time = time.join(':');
    chatbox.appendMessage({
        id: ++messages,
        time: time,
        author: {
            id: 0,
            name: 'You',
            avatar: 'assets/avatar-1.jpg'
        },
        content: {
            text: text
        }
    }, true);
};

function sendRes(text) {
    let now = new Date(),
        time = (now.toLocaleDateString() + ' ' + now.toLocaleTimeString()).split(':');
    time.splice(2, 1);
    time = time.join(':');
    chatbox.appendMessage({
        id: ++messages,
        time: time,
        author: {
            id: 1,
            name: 'Anna',
            avatar: 'assets/avatar-2.jpg'
        },
        content: {
            text: text
        }
    }, false);
}

