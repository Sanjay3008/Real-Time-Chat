# <center>Real-Time-Chat ( https://realtimechat2.herokuapp.com) </center>

This Real Time chat is built using HTML CSS and JavaSCript. Chat Group can be Created using this Platform with password and the Data will be Stored in MongoDB. This app works with the help of Socket.io which will listen on each user and send the messages to server and broadcast to the group members. Email Verification and Password reset Feature is also added in this Chat Site. The Group data are stored in MongoDB. The chat group details are set with TTL(Time to Live) of 1hr for Email Verification. If the Email Not Verified, the details will be automatically deleted in MongoDB to avoid junk. For Sending emails, Nodemailer along with Google Api and Oauth. The Messages are real time and not 
stored. Happy Chatting :))
***
# Modules Used

# 1. BackEnd 

<ins>Server</ins>  

1.Node Js  
2.Express  
3. NPM  

<ins>Chat</ins>  
1. Socket.io --- listen on client and server side

<ins>Encryption</ins>  
1. Brcrypt.js --- Hashing the Passwords

<ins>Token Generation</ins>  
1. crypto --- generate 32/64 bit random characters for token

<ins>Send Email</ins>  
1. Nodemailer  
2. Google-APIs  

<ins>Flash Message</ins>  
1. connect-flash    

<ins>Template</ins>  
1. EJS  

# 2. <ins>Front End</ins>
1. Html  
2. Css  
3. Javascript  
---
# 3. <ins>DataBase</ins>
1. MongoDB - Atlas  
*** 

# Work Flow
1. Create a Chat Group   
2. Verification Email sent to Registered valid for 1Hr  
3. User Verify the Email -- Verification Success  
4. Users can Login to the Group  
5. Other known People Login to the Group to chat  
6. Password - Forget. --------> Reset Password  
7. Link sent to Registered Email ------> Valid for 1hr  
8. Happy Chatting ::))  
 ***
 


