// required modules
const express = require('express');
const flash = require('connect-flash');
const path = require('path');
const socketio = require('socket.io');
const body_parser = require('body-parser');
const session = require('express-session');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const passport = require('passport');


require('dotenv').config();


const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

async function sendMail(to_user, reset_link, group) {
    try {

        return res;

    } catch (error) {
        return error
    }
}



// declaring port
const PORT = process.env.PORT || 3001;




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
app.use(flash());
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json());
app.use(express.json());
app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'woot',
    resave: false,
    saveUninitialized: false
}));

app.use(function(req, res, next) {

    if (!req.user)
        res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

// passport middleware



/* ----------------------------------------------------------------------------------------------------------- */

/* ---------------------------   MONGO-DB CONNECTION AND DATABASE--------------------------------*/
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://admin-sanjay:" + process.env.DB_PASS + "@cluster0.tannl.mongodb.net/Real_Time_chat?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

var nameSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },
    group_name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    expireDate: Date,
    emailVerified: String,
    emailVerificationToken: String,
    emailVerificationTokenExpireDate: Date
});

//nameSchema.index({ emailVerificationTokenExpireDate: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { emailVerified: 'no' } });

//nameSchema.index({ "expire_at": 1 }, { expireAfterSeconds: 60 });

const Group = mongoose.model("Groups", nameSchema);

var msgs = [];
/*----------------------------------------------------------------------------------------------------*/





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
    res.header('Cache-Control', 'no-cache');
    req.logout();
    req.session.destroy(function() {});
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

    res.redirect('/')
});

app.post("/join-room", async function(req, res) {

    console.log(req.get('host'));
    var userjoin = req.body.username;
    var groupjoin = req.body.group_name.toLowerCase();
    var grouppass = req.body.group_pass;

    const group = await Group.findOne({ group_name: groupjoin }).then(async response => {

        if (response === null) {
            req.flash('Group-Message', 'Group Not Found');
            msgs.push('Msg inserted');
            res.redirect('/')
        } else {

            if (response.emailVerified === 'no' || !(response.emailVerificationToken === null) || !(response.emailVerificationTokenExpireDate === null)) {
                req.flash('Group-Message', 'Group Email Not Registered. Please register via sent link if valid');
                msgs.push('Msg inserted');
                res.redirect('/')
            } else {
                bcrypt.compare(grouppass, response.password, function(err, matched) {
                    if (err) {
                        console.log(err);
                    }
                    if (!matched) {
                        req.flash('Group-Message', 'Group Found. Password Incorrect');
                        msgs.push('Msg inserted');
                        res.redirect('/')
                    } else {
                        res.render('chat', { user: userjoin, group: groupjoin });
                    }

                });
            }


        }
    });
});

app.post('/password-reset', async function(req, res) {

    var email = req.body.email;
    var group = req.body.group_name.toLowerCase();

    const group_res = await Group.findOne({ group_name: group, email: email }).then(async Group => {

        if (Group == null) {
            req.flash('Group-Message', 'Group Not Found / Not Registered');
            msgs.push('Msg inserted');
            res.redirect('/')
        } else {
            crypto.randomBytes(32, (err, buffer) => {
                if (err) {
                    console.log(err)
                }
                const token = buffer.toString('hex');
                Group.resetToken = token;
                var n = new Date();
                n.setHours(n.getHours + 1);
                n.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })

                Group.expireDate = n;

                Group.save().then(async(saved) => {
                    if (saved) {
                        const link = "http://" + req.get('host').toString() + "/password-reset/" + group + "/" + token;

                        const accessToken = await oAuth2Client.getAccessToken();
                        console.log(accessToken);

                        const transport = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                type: 'OAuth2',
                                user: 'sanroxy30@gmail.com',
                                clientId: process.env.CLIENT_ID,
                                clientSecret: process.env.CLIENT_SECRET,
                                refreshToken: process.env.REFRESH_TOKEN,
                                accessToken: process.env.accessToken
                            }
                        })

                        const mailOptions = {
                            from: 'sanroxy30@gmail.com',
                            to: email,
                            subject: 'Password Reset for your chat group',
                            text: `Hello ${group}! We arethere to help you. It is Real Chat and not a spam`,
                            html: `
                                <p> You have requested Password Reset for Real Time Chat ${group}</p>
                                <h5>Click on this <a href=${link}>Link</a> to reset Password</h5>
                                <p>The Password Reset Link will be valid till ${n}`

                        }

                        const result = await transport.sendMail(mailOptions);

                        console.log(result);
                        req.flash('Group-Message', 'Password Reset Link sent Successfully');
                        msgs.push('Msg inserted');
                        res.redirect('/');

                    } else {
                        console.log("ERROR");
                    }
                })


            })
        }

    });
})



app.get('/password-reset/:groupName/:token', async function(req, res) {

    const token = req.params.token;

    const group = req.params.groupName;


    const group_reset = await Group.findOne({ group_name: group, resetToken: token }).then(async Group => {


        if (Group === null || Group.resetToken != token) {
            req.flash('Group-Message', 'Invalid Request!!');
            msgs.push('Msg inserted');
            res.redirect('/');
        } else if (new Date() < Group.expireDate) {
            req.flash('Group-Message', '')
            res.render('reset_password', {
                GroupMessage: req.flash('Group-Message'),
                Messages: msgs
            })

        } else {
            req.flash('Group-Message', 'Password Update Link Expired!!!');
            msgs.push('Msg inserted');
            res.redirect('/');

        }


    });




})

app.get('/email-verify/:groupName/:token', async function(req, res) {

    var GROUP_NAME = req.params.groupName;
    var TOKEN = req.params.token;

    const group_email_verify = await Group.findOne({ group_name: GROUP_NAME, emailVerificationToken: TOKEN }).then(Group => {

        if (Group === null) {
            req.flash('Group-Message', 'Invalid Request!!!');
            msgs.push('Msg inserted');
            res.redirect('/');
        } else {
            if (Group.emailVerificationTokenExpireDate >= new Date()) {
                Group.emailVerificationToken = null;
                Group.emailVerified = "yes";
                Group.emailVerificationTokenExpireDate = null;



                Group.save().then(saved => {
                        if (saved) {
                            req.flash('Group-Message', 'Email Registered Successfully. Please Login to continue!!!');
                            msgs.push('Msg inserted');
                            res.redirect('/');
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        req.flash('Group-Message', 'Email Verification Failed. Please Contact owner');
                        msgs.push('Msg inserted');
                        res.redirect('/');
                    });

            } else {
                req.flash('Group-Message', 'Email Verification Link Expired. Please Register Your Group Again');
                msgs.push('Msg inserted');
                res.redirect('/');
            }
        }


    });




})

/* --------------------------------------------------------------------------------------------------------*/


/* -------------------------------- POSTS ----------------------------------------------*/


// Create Group Route
app.post("/create-group", async function(req, res) {

    const group = await Group.findOne({ group_name: req.body.group_name.toLowerCase() });

    console.log(group)
    if (group === null) {

        var myData = new Group(req.body);

        myData.group_name = myData.group_name.toLowerCase();
        myData.resetToken = null;
        myData.expireDate = null;


        bcrypt.genSalt(parseInt(process.env.BC_SALT, 10), function(err, salt) {
            if (err) {
                console.log(err);
            } else {
                bcrypt.hash(myData.password, salt, function(err, hash) {
                    if (err) {
                        console.log(err);
                    } else {
                        myData.password = hash;
                        myData.emailVerified = "no";

                        console.log(myData.password);

                        crypto.randomBytes(32, (err, buffer) => {
                            if (err) {
                                console.log(err);
                            }

                            const email_token = buffer.toString('hex');
                            myData.emailVerificationToken = email_token;
                            var n = new Date();
                            n.setMinutes(n.getMinutes() + 2);
                            n.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
                            myData.emailVerificationTokenExpireDate = n;

                            const group_name = myData.group_name;
                            const reg_email = myData.email;
                            myData.save()
                                .then(async(item) => {

                                    if (item) {
                                        const link = "http://" + req.get('host').toString() + "/email-verify/" + group_name + "/" + email_token;

                                        const accessToken = await oAuth2Client.getAccessToken();
                                        console.log(accessToken);

                                        const transport = nodemailer.createTransport({
                                            service: 'gmail',
                                            auth: {
                                                type: 'OAuth2',
                                                user: 'sanroxy30@gmail.com',
                                                clientId: process.env.CLIENT_ID,
                                                clientSecret: process.env.CLIENT_SECRET,
                                                refreshToken: process.env.REFRESH_TOKEN,
                                                accessToken: process.env.accessToken
                                            }
                                        })

                                        const mailOptions = {
                                            from: 'sanroxy30@gmail.com',
                                            to: reg_email,
                                            subject: `Email Verification for the Group ${group_name} by Real Time Chat`,
                                            html: `
                                <p> You have registered for Real Time Chat group named ${group_name}. We have sent the registration confirmation Mail. Please confirm to use Real Time Chat</p>
                                <h3>Click on this <a href=${link}><u>Email Verify Link </u></a> to Verify Email</h3>
                                <p>The Email Verification Link will be valid till ${n}`

                                        }

                                        const result = await transport.sendMail(mailOptions);

                                        console.log(result);
                                        req.flash('Group-Message', 'Email Verification Link sent Successfully!!!');
                                        msgs.push('Msg inserted');
                                        res.redirect('/');
                                    } else {
                                        req.flash('Group-Message', 'Group Creation Failed. Please Retry again!!!');
                                        msgs.push('Msg inserted');
                                        res.redirect('/')
                                    }
                                })
                                .catch((err) => {
                                    console.log(err)
                                    req.flash('Group-Message', 'Group Creation Failed. Please Retry again!!!');
                                    msgs.push('Msg inserted');
                                    res.redirect('/')
                                });



                        });

                    }
                });
            }
        })


    } else {

        if (group.emailVerificationTokenExpireDate === null) {
            req.flash('Group-Message', 'Group Already Created. Plz Login');
            msgs.push('Msg inserted');
            res.redirect('/');
        } else if (group.emailVerificationTokenExpireDate > new Date()) {
            req.flash('Group-Message', 'Group Already Created and Verification Link sent to Provided Email');
            msgs.push('Msg inserted');
            res.redirect('/');
        }

    }





});


app.post('/reset-password-post', async function(req, res) {

    var g_name = req.body.group_name.toLowerCase();
    var pass = req.body.group_pass;
    var confirm_pass = req.body.group_confirm_pass;

    console.log(pass);
    console.log(confirm_pass);

    const group_find = await Group.findOne({ group_name: g_name }).then(async Group => {

        console.log(Group)
        var d = new Date();
        d.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
        if (pass === confirm_pass && (d <= Group.expireDate)) {
            Group.resetToken = null;
            Group.expireDate = null;



            bcrypt.genSalt(parseInt(process.env.BC_SALT, 10), function(err, salt) {
                if (err) {
                    console.log(err);
                } else {
                    bcrypt.hash(pass, salt, function(err, hash) {
                        if (err) {
                            console.log(err);
                        } else {
                            Group.password = hash;


                            Group.save().then(result => {
                                if (result) {
                                    req.flash('Group-Message', 'Password Updated Successfully. Plz Login to chat!!');
                                    msgs.push('Msg inserted');
                                    res.redirect('/')
                                } else {
                                    req.flash('Group-Message', 'Password Update Failed. Plz Try Again')
                                    msgs.push('Msg inserted');
                                    res.render('reset_password', {
                                        GroupMessage: req.flash('Group-Message'),
                                        Messages: msgs
                                    });
                                }
                            })
                        }
                    });
                }
            })




        } else {
            console.log(Group)
            var d = new Date();
            d.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
            if (pass !== confirm_pass && (d <= Group.expireDate)) {
                req.flash('Group-Message', 'Password Mismatch!!!');
                msgs.push('Msg inserted');
                res.render('reset_password', {
                    GroupMessage: req.flash('Group-Message'),
                    Messages: msgs
                });
            }
        }

    });

});



/* -------------------------------------------------------------------------------------------------*/

// Server Listening to PORT
server.listen(PORT, function() {
    console.log("Port runnning on 3001")
});