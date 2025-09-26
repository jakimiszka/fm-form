// contrlos
const first_name = document.querySelector('input[name="first_name"]');
const last_name = document.querySelector('input[name="last_name"]');
const full_name = document.querySelectorAll('input[type="text"]');
const email = document.querySelector('input[name="email"]');
const query_types = document.querySelectorAll('input[name="query"]');
const query_general = document.querySelector('label[for="general"]');
const query_support = document.querySelector('label[for="support"]');
const message = document.querySelector('textarea[name="message"]');
const consent = document.querySelector('input[name="consent"]');
const submit = document.querySelector('button[type="submit"]');
const toast = document.querySelector(".toast");

// error msgs
const first_name_error = document.querySelector(".error.first_name");
const last_name_error = document.querySelector(".error.last_name");
const email_error = document.querySelector(".error.email");
const query_error = document.querySelector(".error.query");
const message_error = document.querySelector(".error.message");
const consent_error = document.querySelector(".error.consent");

const regex = /[^AaĄąBbCcĆćDdEeĘęFfGgHhIiJjKkLlŁłMmNnŃńOoÓóPpRrSsŚśTtUuWwYyZzŹźŻżqQxXvV]/g;
const regex_email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

let results = [];

function validateString(element, error_msg, type) {
  if (!element.value) {
    error_msg.innerHTML = "This field is required";
    error_msg.style.display = "block";
    return false;
  } else if (!element.value) {
    if ((element.value.length < 2 || element.value.length > 50) && type === "full_name") {
      error_msg.innerHTML = "This field must be between 2 and 50 characters";
      error_msg.style.display = "block";
      return false;
    } else if (!regex_email.test(element.value) && type === "email") {
      error_msg.innerHTML = "Please enter a valid email address";
      error_msg.style.display = "block";
      return false;
    } else if((element.value.length < 2 || element.value.length > 300) && type === "message"){
      error_msg.innerHTML = "max 300 characters";
      error_msg.style.display = "block";
      return false;
    }
  } else {
    if (type === "message") {
      element.value = sanitizeInput(element.value)
    }
    error_msg.style.display = "none";
    return true;
  }
}

function sanitizeInput(input) {
  if (!input || typeof input !== "string") return "";

  return input
    .trim()
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function submitForm(results) {
  if (results.indexOf(false) === -1) {
    toast.style.display = "flex";
    setTimeout(() => {
      toast.style.display = "none";
      first_name.value = "";
      last_name.value = "";
      email.value = "";
      message.value = "";
      consent.checked = false;
      query_types.forEach((query_type) => {
        query_type.checked = false;
      });
      query_general.classList.remove("selected");
      query_support.classList.remove("selected");
    }, 2000);
  } else {
    toast.style.display = "none";
  }
  results.length = 0;
}

submit.addEventListener("click", (e) => {
  e.preventDefault();
  results.push(validateString(first_name, first_name_error, "full_name"));
  results.push(validateString(last_name, last_name_error, "full_name"));
  results.push(validateString(email, email_error, "email"));
  results.push(validateString(message, message_error, "message"));
  results.push(consent.checked);

  consent.checked ? (consent_error.style.display = "none") : (consent_error.style.display = "block");
  let query_flag = false;
  query_types.forEach((query_type) => {
    if (query_type.checked) {
      query_flag = true;
    }
  });
  query_flag ? (query_error.style.display = "none") : (query_error.style.display = "block");
  submitForm(results);
});

full_name.forEach((name) => {
  name.addEventListener("input", (event) => {
    const input = event.target.value;
    event.target.value = input.replace(regex, "");
    const error_msg = event.target.nextElementSibling;
    validateString(name, error_msg);
  });
});

query_types.forEach((query_type) => {
  query_type.addEventListener("change", (event) => {
    query_types.forEach(() => {
      query_general.classList.remove("selected");
      query_support.classList.remove("selected");
    });
    if (event.target.checked && event.target.id === "general") {
      query_general.classList.add("selected");
    } else {
      query_support.classList.add("selected");
    }
  });
});
