const users = [];

// Join users to chat

function userJoin(id, username, group_name) {
    var color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    const user = { id, username, group_name, color };
    users.push(user);

    return user;
}

// Get current user

function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {

        return users.splice(index, 1)[0];
    }
}

function getRoomUsers(group_name) {
    return users.filter(user => user.group_name === group_name);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}