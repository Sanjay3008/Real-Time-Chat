document.querySelector(".create_group").addEventListener("click", () => {
    document.querySelector(".popup").classList.add("active")
})

document.querySelector(".popup .close-btn").addEventListener("click", () => {

    document.querySelector(".popup").classList.remove("active")
})




var form = document.getElementById('join-room');

form.addEventListener('submit', function(e) {

    e.preventDefault();

    var group = document.getElementById('group_name').value;
    var pass = document.getElementById('group_pass').value;

    const data = { group, pass };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    validate(options);
});

async function validate(options) {
    const response = await fetch('/group_password_validate', options);
    const data = await response.json();

    var res = data.MSG;

    var group = document.getElementById('group_name');
    var pass = document.getElementById('group_pass');
    if (res === "Group Found") {
        form.action = "chat.html";
        form.submit();
    } else if (res === "Password Incorrect") {
        pass.value = "";
        alert("Password Incorrect");
    } else {
        group.value = "";
        pass.value = "";
        alert("Group Not Found");
    }

}