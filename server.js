// required modules
const express = require('express');
const flash = require('connect-flash');
const path = require('path');
const socketio = require('socket.io');
const body_parser = require('body-parser');




// declaring port
const PORT = 3001 || process.env.PORT;




// predefined methods
const formatMessage = require('./utils/messages');
const formatMember = require('./utils/member')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

// defining express app
const app = express()


/* --------------------------------------- MIDDLEWARES ------------------------------------*/

// defining middleware

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + "/Public"));
app.use(express.cookieParser('keyboard cat'));
app.use(express.session({
    secret: "cookie_secret",
    cookie: { maxAge: 60000 }
}));
app.use(flash());
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json());
app.use(express.json());

// flash middleware



/*- ---------------------------------------------------------------------------------------------*/


/* --------------------------------------- SOCKET.IO ----------------------------------------- */
// initiasing the socket.io and client server interaction
const server = require('http').Server(app);
const io = socketio(server)

io.on("connection", function(socket) {


    // join to a particular Group
    socket.on('joinRoom', ({ username, group_name }) => {

        const user = userJoin(socket.id, username, group_name);

        socket.join(user.group_name);



        // initiliase Greetings
        socket.emit('admin-message', formatMessage('Admin', 'Welcom to Real Chat'));

        // broadcast to all except the user about { New user Joining }
        socket.broadcast.to(user.group_name).emit("admin-message", formatMessage('Admin', `${user.username} has joined the chat`));

        // send details about Group Name and Users
        io.to(user.group_name).emit('roomUsers', {
            group_name: user.group_name,
            users: getRoomUsers(user.group_name),
        })
    });


    // sending and broadcasting the messages

    socket.on('chat-msg', (msg) => {

        const user_c = getCurrentUser(socket.id);
        console.log(user_c);
        socket.broadcast.to(user_c.group_name).emit('other-message', formatMessage(user_c.username, msg, user_c.color));

        socket.emit('own-message', formatMessage(user_c.username, msg, user_c.color));
    });


    // informing about Leaving the Group
    socket.on('disconnect', function() {

        const user = userLeave(socket.id);

        if (user) {
            io.to(user.group_name).emit('admin-message', formatMessage('Admin', `${user.username}  has left the chat`));

            io.to(user.group_name).emit('roomUsers', {
                group_name: user.group_name,
                users: getRoomUsers(user.group_name)
            })
        }

    });
});

/* ----------------------------------------------------------------------------------------------------------- */

/* ---------------------------   MONGO-DB CONNECTION AND DATABASE--------------------------------*/
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://admin-sanjay:qO8bX2EFQNGpgdmB@cluster0.tannl.mongodb.net/Real_Time_chat?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

var nameSchema = new mongoose.Schema({
    email: String,
    group_name: String,
    password: String
});

var Group = mongoose.model("Groups", nameSchema);

var msgs = [];
/*----------------------------------------------------------------------------------------------------*/


/* ------------------------------------------- ROUTES -------------------------------------------------*/

// default home route
app.get("/", function(req, res) {

    res.render('index', {
        GroupMessage: req.flash('Group-Message'),
        Messages: msgs

    })
});

app.post("/leave-group", function(req, res) {

    req.flash('Group-Message', 'You Left The Group');
    msgs.push('Msg inserted');
    res.render('index', {
        GroupMessage: req.flash('Group-Message'),
        Messages: msgs
    })
});

/* --------------------------------------------------------------------------------------------------------*/


/* -------------------------------- POSTS ----------------------------------------------*/


// Create Group Route
app.post("/create-group", async function(req, res) {

    const group = await Group.findOne({ group_name: req.body.group_name });


    var myData = new Group(req.body);

    if (group === null) {
        myData.save()
            .then(item => {
                req.flash('Group-Message', 'Group Created Successfully');
                msgs.push('Msg inserted');
                res.redirect('/');
            })
            .catch(err => {
                req.flash('Group-Message', 'Group Creation Failed. Please Retry again!!!');
                msgs.push('Msg inserted');
                res.redirect('/')
            });
    } else {

        req.flash('Group-Message', 'Group Already Created. Plz Login (or) create another');
        msgs.push('Msg inserted');
        res.redirect('/');
    }





});


// Password Validate Route
app.post('/group_password_validate', async function(req, res) {

    const g_name = req.body.group;

    const g_pass = req.body.pass;


    const group = await Group.findOne({ group_name: g_name }).then(async response => {

        if (response === null) {
            res.json({
                MSG: 'No Group',
            })
        } else {

            if (response.password != g_pass) {
                res.json({
                    MSG: 'Password Incorrect',
                })
            } else {
                res.json({
                    MSG: 'Group Found',
                })
            }

        }
    });





})

/* -------------------------------------------------------------------------------------------------*/

// Server Listening to PORT
server.listen(PORT, function() {
    console.log("Port runnning on 3001")
});