// import InputValidator from './inputValidator.js';

// contrlos
const first_name = document.querySelector('input[name="first_name"]');
const last_name = document.querySelector('input[name="last_name"]');
const email = document.querySelector('input[name="email"]');
const query_types = document.querySelectorAll('input[name="query"]');
const message = document.querySelector('textarea[name="message"]');
const consent = document.querySelector('input[name="consent"]');
const submit = document.querySelector('button[type="submit"]');
const toast = document.querySelector('.toast');

// error msgs
const first_name_error = document.querySelector('.error.first_name');
const last_name_error = document.querySelector('.error.last_name');
const email_error = document.querySelector('.error.email');
const query_error = document.querySelector('.error.query');
const message_error = document.querySelector('.error.message');
const consent_error = document.querySelector('.error.consent');

//const inputValidator = new InputValidator();

const regex = /[^a-zA-Z_ ]/g;
const regex_message = /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/g;
const regex_email = /\S+@\S+\.\w{2}[\._-]?\w*$/;

let results = [];

const validate = {
    checkString: (string) => {
        if (!string || regex.test(string)) {
            return false;
        } else {
            return true;
        }
    },

    checkMessage: (string) => {
        if (!string || regex_message.test(string)) {
            return false;
        } else {
            return true;
        }
    },

    checkEmail: (email) =>{
        const result = regex_email.test(email);
        return !!result ? true : false;
    }
}

message.addEventListener('input', (event) => {
  const input = event.target.value;
  const sanitizedInput = sanitize(input);
  event.target.value = sanitizedInput;
});

function sanitize(string) {
  const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match)=>(map[match]));
}


submit.addEventListener('click', (e) => {
    e.preventDefault();

    results.push(validateString(first_name, first_name_error));
    results.push(validateString(last_name, last_name_error));
    results.push(validateEmail(email, email_error));
    results.push(validateMessage(message, message_error));
    results.push(consent.checked);
    consent.checked ? consent_error.style.display = 'none' : consent_error.style.display = 'block';
    let query_flag = false;
    query_types.forEach((query_type) => {
        if (query_type.checked) {
            query_flag = true;
        }
    })
    query_flag ? query_error.style.display = 'none' : query_error.style.display = 'block';
    console.log(results);
    submitForm(results);
});

function validateString(element, error_msg) {
    if(validate.checkString(element.value)){ 
        error_msg.style.display = 'none';
        return true;
    } else{
        error_msg.style.display = 'block';
        return false;
    }
}

function validateMessage(element, error_msg) {
    if(validate.checkMessage(element.value)){ 
        error_msg.style.display = 'none';
        return true;
    } else{
        error_msg.style.display = 'block';
        return false;
    }
}

function validateEmail(element, error_msg) {
    if(validate.checkEmail(element.value)){
         error_msg.style.display = 'none';
         return true;
    }else{
        error_msg.style.display = 'block';
        return false;
    } 
}


function submitForm(results) {
    if(results.indexOf(false) === -1){
        toast.style.display = 'flex';
        first_name.value = '';
        last_name.value = '';
        email.value = '';
        message.value = '';
        consent.checked = false;
        query_types.forEach((query_type) => {
            query_type.checked = false;
        })

        setTimeout(() => {
            toast.style.display = 'none';
        }, 2000);
    }else{
        toast.style.display = 'none';
    }
    results.length = 0;
}

first_name.addEventListener('input', (event) => {
    const input = event.target.value;
    console.log(input)
    event.target.value = input.replace(regex, '');
});

last_name.addEventListener('input', (event) => {
    const input = event.target.value;
    console.log(input)
    event.target.value = input.replace(regex, '');
});

const pattern = /^[a-zA-Z0-9]+$/;
const special_chars = /[-!#$%^&*()+@_=\[\]{}.;':"\\|,<>\/?]+/g;

/*  valid email examples

    a@b.c
    a@b.c.
    a@b.c.d
    j.o.h.n.d.o.e@gmail.com
    very.(),:;<>[]\".VERY.\"very@\ \"very\".unusual"@strange.example.com
    xample-indeed@strange-example.com
    admin@mailserver1 (local domain name with no top-level domain)
    #!$%&'*+-/=?^_`{}|~@example.org
    "()<>[]:,;@\\"!#$%&'-/=?^_`{}| ~.a"@example.org

    AT THIS POINT IM COOKED, ll just stick to the format
*/

email.addEventListener('input', (event) => {
    // TODO
});