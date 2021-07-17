const moment = require('moment');

function formatMessage(username, text_msg, color, align) {
    return {
        name: username,
        text: text_msg,
        color: color,
        time: moment().format('h:mm a')

    }
}

module.exports = formatMessage;