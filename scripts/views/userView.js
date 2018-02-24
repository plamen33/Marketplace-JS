class UserView {

    constructor(wrapperSelector, mainContentSelector) {
        this._wrapperSelector = wrapperSelector;
        this._mainContentSelector = mainContentSelector;
    }

    showLoginPage(isLoggedIn) {
        let _that = this;
        let templateUrl = isLoggedIn ? "templates/form-user.html" : "templates/form-guest.html";

        $.get(templateUrl, function(template) {
            //we first get the wrapper, we render it with null data and pass it to the HTML of the element corresponding to the wrapper selector
            let renderedWrapper = Mustache.render(template, null);
            $(_that._wrapperSelector).html(renderedWrapper);
            //We cannot render a form without a wrapper that is why we nest the get request for the login form in the main get request.
            $.get('templates/login.html', function (template) {
                let rendered = Mustache.render(template, null);
                $(_that._mainContentSelector).html(rendered);
                // current template has a button, and we create event handler on click action
                //When a template is loaded it is nothing but HTML code, so we must add handlers such as JS functions and handlers, every time we load the template
                $('#login-request-button').on('click', function (ev) {
                    let username = $('#username').val(); // we use id's as selectors and take their value
                    let password = $('#password').val();

                    let data = {
                        username: username,
                        password: password
                    };
                    // triggerEvent comes from the custom framework.js
                    // It triggers an event by given name and passes to the handler an object - the data
                    triggerEvent('login', data);
                });
            });
        });
    }

    showRegisterPage(isLoggedIn) {
        let _that = this;

        let templateUrl = isLoggedIn ? "templates/form-user.html" : "templates/form-guest.html";

        $.get(templateUrl, function(template) {
            let renderedWrapper = Mustache.render(template, null);
            $(_that._wrapperSelector).html(renderedWrapper);

            $.get('templates/register.html', function (template) {

                let rendered = Mustache.render(template, null)

                $(_that._mainContentSelector).html(rendered);

                $('#register-request-button').on('click', function (ev) {
                    let username = $('#username').val(),
                        password = $('#password').val(),
                        fullname = $('#full-name').val(),
                        confirmPassword = $('#pass-confirm').val();

                    let data = {
                        username: username,
                        password: password,
                        fullname: fullname,
                        confirmPassword: confirmPassword
                    };

                    triggerEvent('register', data);
                });
            });
        });
    }


}