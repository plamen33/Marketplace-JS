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
        // requestData contains the logging data username(email) and password in form of an object:
        firebase.auth().signInWithEmailAndPassword(requestData.username,requestData.password)
            .then(response => {
                firebase.auth().currentUser.getIdToken().then(token => {
                    showPopup('success', "You have successfully logged in.");
                    console.log(sessionStorage.getItem('getToken'));
                    sessionStorage.setItem('_authToken', token);
                    sessionStorage['username'] = requestData.username;
                    redirectUrl("#/"); // redirect to main page // “#/” is the home route
                });
            }).then(function(user){
            console.log("User logged to Firebase.")
        }).catch(function(error) {
            showPopup('error', "An error has occurred while attempting to login.");
            console.log('Error logging in Firebase: ', error);
            //console.log(Object.entries(error));
            let errorArray = Object.entries(error);
            console.log("Login failed. Firebase response is: " + errorArray[0][1] + " " + errorArray[1][1]);
            showPopup('error', "Login failed. Firebase response is: " + errorArray[0][1] + " " + errorArray[1][1]);
        });

        // kinvey logging process:
        // let requestUrl = this._baseServiceUrl + "login";
        // this._requester.post(requestUrl, requestData,
        //     function success(data) {
        //         showPopup('success', "You have successfully logged in.");
        //         // To save a user session, we use the sessionStorage
        //         sessionStorage['_authToken'] = data._kmd.authtoken;
        //         sessionStorage['username'] = data.username;
        //         sessionStorage['fullname'] = data.fullname;
        //
        //         redirectUrl("#/"); // redirect to main page // “#/” is the home route
        //     },
        //     function error(data) {
        //         showPopup('error', "An error has occurred while attempting to login.");
        //     });
    }
    
    register(requestData) {  // the request data contains username fullname password confirmPassword
        // all the field validations are here:
        if(requestData.username.length < 4) {
            showPopup('error', "Username must consist of at least 5 symbols and be a valid email.");
            return; // stop register after this pop-up
        }
    
        if(requestData.fullname.length < 1) {
            showPopup('error', "Full name must consist of at least 1 symbols.");
            return;
        }
    
        if(requestData.password.length < 3){
            showPopup('error', "Password must consist of at least 6 symbols.");
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
        // we delete fullname for now, as Firebase does not have space for such data and this needs to be developed additionally :
        delete requestData['fullname'];

        firebase.auth().createUserWithEmailAndPassword(requestData.username, requestData.password)
            .then(response => {
                firebase.auth().currentUser.getIdToken().then(token => {
                    // we can set these parameters, if after Registration we automatically login on the site:
                    //sessionStorage.setItem('_authToken', token);
                    // another way to add in sessionStorage
                    // sessionStorage['username'] = response.user.email
                    //sessionStorage.setItem('username', response.user.email);
                    //sessionStorage.setItem('userId', response.user.uid);
                    showPopup('success', `You have successfully registered, now you can login using your credentials.`, 5000);
                });
            }).then(() => {
            redirectUrl("#/login"); //redirectUrl is taken from framework and #/login is the URL for the login page
            // clear register user and password fields:
        }).catch(function(error) {
            console.log('Error creating new user in Firebase: ', error);
            //console.log(Object.entries(error));
            let errorArray = Object.entries(error);
            showPopup('error', "Registration failed. Firebase response is: " + errorArray[0][1] + " " + errorArray[1][1]);
        });

        // old Kinvey registration method:
        // post is taken from framework.js, so we make a POST request(which a REST request)
        // this._requester.post(requestUrl, requestData, function success(data) {
        //         showPopup('success', "You have successfully registered.");
        //         redirectUrl("#/login"); //redirectUrl is taken from framework and #/login is the URL for the login page
        //     },
        //     function error(data) {
        //         showPopup('error', "An error has occurred while attempting to register.");
        //     }
        // );
    }
    
    logout() {
        showPopup('info', "You have successfully logged out.");
        sessionStorage.clear();
        redirectUrl("#/"); // redirect to the main page using the onRoute("#/", function () {... from app.js
    }
}