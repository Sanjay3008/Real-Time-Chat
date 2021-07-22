const togglePassword1 = document.querySelector('#eyespanreset');
const password1 = document.querySelector('#group_pass_reset');
togglePassword1.addEventListener('click', function(e) {
    // toggle the type attribute
    const type = password1.getAttribute('type') === 'password' ? 'text' : 'password';

    if (type === 'password') {
        document.getElementById('eyespanreset').innerHTML = `<i class="fa fa-eye-slash" aria-hidden="true"></i>`


    } else if (type === 'text') {
        document.getElementById('eyespanreset').innerHTML = `<i class="fa fa-eye" aria-hidden="true"></i>`

    }
    password1.setAttribute('type', type);

});


const togglePassword2 = document.querySelector('#eyespanresetconfirm');
const password2 = document.querySelector('#group_pass_reset_confirm');
togglePassword2.addEventListener('click', function(e) {
    // toggle the type attribute
    const type = password2.getAttribute('type') === 'password' ? 'text' : 'password';

    if (type === 'password') {
        document.getElementById('eyespanresetconfirm').innerHTML = `<i class="fa fa-eye-slash" aria-hidden="true"></i>`


    } else if (type === 'text') {
        document.getElementById('eyespanresetconfirm').innerHTML = `<i class="fa fa-eye" aria-hidden="true"></i>`

    }
    password2.setAttribute('type', type);

});


var x = $(window).width();

if (x <= 500) {
    document.getElementById('group_pass_reset').placeholder = 'Password';
    document.getElementById('group_pass_reset_confirm').placeholder = 'Confirm Password';



} else {
    document.getElementById('group_pass_reset').placeholder = 'Enter your Group Password';
    document.getElementById('group_pass_reset_confirm').placeholder = 'Re Enter your Group Password';


}