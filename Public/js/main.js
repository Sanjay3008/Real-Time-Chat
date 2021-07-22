document.querySelector(".create_group .btn-group .createbtn").addEventListener("click", () => {
    document.querySelector(".popup").classList.add("active")
})

document.querySelector(".popup .close-btn").addEventListener("click", () => {

    document.querySelector(".popup").classList.remove("active")
})

document.querySelector(".create_group .btn-group .resetbtn").addEventListener("click", () => {
    document.querySelector(".popup_reset").classList.add("active")
})

document.querySelector(".popup_reset .close-btn-reset").addEventListener("click", () => {

    document.querySelector(".popup_reset").classList.remove("active")
})


const togglePassword = document.querySelector('#eyespan');
const password = document.querySelector('#group_pass');
togglePassword.addEventListener('click', function(e) {
    // toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';

    if (type === 'password') {
        document.getElementById('eyespan').innerHTML = `<i class="fa fa-eye-slash" aria-hidden="true"></i>`


    } else if (type === 'text') {
        console.log('text');
        document.getElementById('eyespan').innerHTML = `<i class="fa fa-eye" aria-hidden="true"></i>`

    }
    password.setAttribute('type', type);

});

var x = $(window).width();

if (x <= 500) {
    document.getElementById('username').placeholder = 'Name';
    document.getElementById('group_name').placeholder = 'Group Name';
    document.getElementById('group_pass').placeholder = 'Group Pass';

    document.getElementById('c_useremail').placeholder = 'Email';
    document.getElementById('c_group_name').placeholder = 'Group Name';
    document.getElementById('c_group_pass').placeholder = 'Group Pass';

    document.getElementById('reset_group_name').placeholder = 'Group Name';
    document.getElementById('reset_useremail').placeholder = 'Admin Pass';
    3
    document.getElementById('reset_group_name_l').innerText = 'Group Name';
    document.getElementById('reset_useremail_l').innerText = 'Admin Email';

} else {
    document.getElementById('username').placeholder = 'Enter Your Name';
    document.getElementById('group_name').placeholder = 'Enter Your Group Name';
    document.getElementById('group_pass').placeholder = 'Enter Your Group Pass';

    document.getElementById('c_useremail').placeholder = 'Enter your Email';
    document.getElementById('c_group_name').placeholder = 'Enter Group Your Name';
    document.getElementById('c_group_pass').placeholder = 'Enter Group Your Pass';

    document.getElementById('reset_group_name').placeholder = 'Enter Group Name';
    document.getElementById('reset_useremail').placeholder = 'Enter Admin Email';

    document.getElementById('reset_group_name_l').innerText = 'Enter Group  Name';
    document.getElementById('reset_useremail_l').innerText = 'Enter Admin Email';

}