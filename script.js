const first_name = document.querySelector('input[name="first_name"]');
const last_name = document.querySelector('input[name="last_name"]');
const email = document.querySelector('input[name="email"]');
const general = document.querySelector('input[id="general"]');
const support = document.querySelector('input[id="support"]');
const message = document.querySelector('textarea[name="message"]');
const submit = document.querySelector('button[type="submit"]');
const fieldset = document.querySelector('fieldset');

const validate = {
    first_name: first_name.value,
    last_name: last_name.value,
    email: email.value,
    general: general.checked,
    support: support.checked,
    message: message.value,

    checkString: (string) => {
        if (string === '') {
            return false;
        } else {
            return true;
        }

        // prevent from XSS / SQL injection
    },

    checkEmail: (email) =>{
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(email).toLowerCase());
    }
}


submit.addEventListener('click', (e) => {
    e.preventDefault();
    console.log(fieldset.value);
});
