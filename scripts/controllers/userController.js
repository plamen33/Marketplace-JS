class UserController {
    // Every controller has a view, a requester, a base URL and an app key.
    // 1.	The controller asks the view to render a page
    // 2.	The view renders the page and applies an event trigger to it
    // 3.	When the event is triggered the specified operation corresponding to the event, is called in the controller
    // 4.	That operation makes the request and finishes the process

    constructor(userView, requester, baseUrl, appKey) {
        this._userView = userView;
        this._requester = requester;
        this._appId = appKey;
        this._baseServiceUrl = baseUrl + "/user/" + appKey + "/";
    }

    showLoginPage(isLoggedIn) {
        this._userView.showLoginPage(isLoggedIn);
    }
    
    showRegisterPage(isLoggedIn) {
        this._userView.showRegisterPage(isLoggedIn);
    }
    
    login(requestData) {
        let requestUrl = this._baseServiceUrl + "login";
        this._requester.post(requestUrl, requestData,
            function success(data) {
                showPopup('success', "You have successfully logged in.");
                // To save a user session, we use the sessionStorage
                sessionStorage['_authToken'] = data._kmd.authtoken;
                sessionStorage['username'] = data.username;
                sessionStorage['fullname'] = data.fullname;
    
                redirectUrl("#/"); // redirect to main page // “#/” is the home route
            },
            function error(data) {
                showPopup('error', "An error has occurred while attempting to login.");
            });
    }
    
    register(requestData) {  // the request data contains username fullname password confirmPassword
        // all the field validations are here:
        if(requestData.username.length < 4) {
            showPopup('error', "Username must consist of atleast 5 symbols.");
            return; // stop register after this pop-up
        }
    
        if(requestData.fullname.length < 8) {
            showPopup('error', "Full name must consist of atleast 8 symbols.");
            return;
        }
    
        if(requestData.password.length < 3){
            showPopup('error', "Password must consist of atleast 3 symbols.");
            return;
        }
    
        if(requestData.password !== requestData.confirmPassword) {
            showPopup('error', "Passwords do not match.");
            return;
        }
    
        let requestUrl = this._baseServiceUrl;
        // Kinvey will automatically hide the password field but it will not hide any additional fields the client has imported into the request data
        // that is why we have to delete the confirmPassword
        delete requestData['confirmPassword'];  // we delete from the requestData the confirmPassword, as need it only for validation and we do not need to send it to the DB

        // post is taken from framework.js, so we make a POST request(which a REST request)
        this._requester.post(requestUrl, requestData, function success(data) {
                showPopup('success', "You have successfully registered.");
                redirectUrl("#/login"); //redirectUrl is taken from framework and #/login is the URL for the login page
            },
            function error(data) {
                showPopup('error', "An error has occurred while attempting to register.");
            });
    }
    
    logout() {
        sessionStorage.clear();
        redirectUrl("#/"); // redirect to the main page using the onRoute("#/", function () {... from app.js
    }
}