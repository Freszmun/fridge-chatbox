const chatbox = document.querySelector('app-chatbox');
chatbox.config.showAvatars = false;
chatbox.config.actions.requestHistory = function(chatboxElem) {
    console.log('Requested chat history');
}
let messages = 0, chatHistory = [
    [2, 'Hi guys!'], [0, 'Hello'], [1, 'Hi ❤️'],
    [0, 'How are you?'], [2, 'I\'m okay'], [2, 'and you?'],
    [0, 'I\'m doing math homework'], [0, 'I hate this subject'],
    [1, 'Do you need some help?']
];
function showHistory() {
    for (let msg of chatHistory.reverse()) {
        let now = new Date(new Date().getTime() - 28000 * messages),
            time = (now.toLocaleDateString() + ' ' + now.toLocaleTimeString()).split(':');
        time.splice(2, 1);
        time = time.join(':');
        chatbox.appendBeforeMessage({
            id: ++messages,
            time: time,
            author: {
                id: msg[0],
                name: ['You', 'Sarah', 'Mark'][msg[0]],
                avatar: `assets/avatar-${['1', '2', '1'][msg[0]]}.jpg`
            },
            content: {
                text: msg[1]
            }
        }, msg[0] === 0);
    }
}
setTimeout(showHistory);


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
            name: 'Sarah',
            avatar: 'assets/avatar-2.jpg'
        },
        content: {
            text: text
        }
    }, false);
}

setTimeout(sendRes, 2000, 'Hello!');