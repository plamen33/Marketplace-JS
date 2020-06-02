class HomeController {
    constructor(homeView, requester, baseServiceUrl, appId) {
        this._homeView = homeView;
        this._requester = requester;
        this._baseServiceUrl = baseServiceUrl; // it has /posts in it already - set in app.js
        // this won't be used, left from Kinvey
        this._appId = appId;
    }

    showGuestPage() {
        // at this place we should call firebase for guest login, as it would be impossible to get username if you have not logged:
        // authorize at Firebase, as guest user:
        let thisClass = this;
        //console.log(thisClass)
        firebase.auth().signInWithEmailAndPassword(this._requester.authorizationServiceFirebase.usln, this._requester.authorizationServiceFirebase.usps)
            .then(response => {
                firebase.auth().currentUser.getIdToken().then(token => {
                    sessionStorage.setItem('getToken', token);
                    //console.log(sessionStorage.getItem('getToken'));
                    //console.log(thisClass)
                    // if needed do something here:
                    processFunction(token, thisClass);
                });
            }).then(function(user){
            console.log("guest login to Firebase")
        }).catch(function(error) {
            console.log('Error logging in Firebase: ', error);
            //console.log(Object.entries(error));
            let errorArray = Object.entries(error);
            console.log("Login failed. Firebase response is: " + errorArray[0][1] + " " + errorArray[1][1]);
            showError("Login failed. Firebase response is: " + errorArray[0][1] + " " + errorArray[1][1]);
        });
        function processFunction(token, thisClass){

            let recentPosts = []; // we will store the recent posts for the sidebar in this array

            let requestUrl = thisClass._baseServiceUrl + ".json?auth=" + token;
            // get is taken from framework.js
            //extract from the Kinvey database all the posts and render them

            thisClass._requester.get(requestUrl,
                function success(data) {  // if we get the data do this: // data is the response data, which an array of posts
                    //console.log(Object.entries(data));
                    let tempArray = Object.entries(data);
                    let dataArray = [];
                    //console.log(Object.entries(data));
                    for (let i = 0; i < tempArray.length; i++) { // The recent post sales array basically holds the 7 most recent posts, if there are that much
                        //we do this check, as in Firebase we do all by ourselves, there might be deleted data in it:
                        if(tempArray[i][1]!= null){
                            dataArray[i] = tempArray[i][1];
                        }
                    }
                    console.log(dataArray);
                    // here we set sale post to appear in descending order: (we could user .reverse here it is much more easier)
                    dataArray.sort(function (elem1, elem2) {
                        let date1 = new Date(elem1.creation_date); //Every Kinvey database object has a member called “_kmd” which holds metadata. ect member from the _kmd member is basically the time of creation of the current element.
                        let date2 = new Date(elem2.creation_date);
                        return date2 - date1; // sort elements by date descending - most recent is on the top
                    });

                    // here we will prepare an array without the service sale post - the first one:
                    let dataArrayWithoutServiceSale = [];
                    for (let i = 0; i < dataArray.length; i++) {
                        // add all sale posts without the first one, which is the service one
                        if(i != dataArray.length-1){
                            dataArrayWithoutServiceSale.push(dataArray[i]);
                        }
                    }

                    for (let i = 0; i < dataArrayWithoutServiceSale.length && i < 7; i++) { // The recent post sales array basically holds the 7 most recent posts, if there are that much
                        if(i != dataArray.length-1){
                            recentPosts.push(dataArrayWithoutServiceSale[i]);
                        }
                    }
                    console.log(dataArrayWithoutServiceSale);
                    // We pass the recentPosts filled up array and the data sorted array from the response to the view
                    thisClass._homeView.showGuestPage(recentPosts, dataArrayWithoutServiceSale); // we have all the data needed, and it is processed, sorted and formatted correctly, we can pass it to the view which will render the page
                },
                function error(data) { // if there is an error show this error message
                    console.log("error reading posts");
                    console.log("There is no Firebase database connection.");
                    console.log("Possible reasons: No internet connection, Firebase is down, Google changed Firebase policy, Firebase Network bandwith is over the monthly limit, etc.");

                    // the section below activates the basic outlook of the Marketplace project when there is no Firebase connection:
                    showPopup('error', "Error loading posts!");
                    showPopup('error', "There is no Firebase database connection!", 12000);
                    showPopup('error', "Possible reasons: No internet connection, Firebase is down, Google changed Firebase policy, Firebase Network bandwith is over the monthly limit, etc.", 12000);

                    // below we prepare hard-coded data to display the site:
                    // you put correct data in it in DB mandatory are creation_date and comments array for this post sale to open in details view
                    let comments = [];
                    comments[0] = {
                        comment_author: "admin@java.com",
                        comment_author: "There is no Firebase connection, due to some reason. Marketplace is unavailable",
                        comment_author: "June 1st 2020, 7:47 PM",
                        comment_id: 0
                    }

                    let post = {
                        creation_date: "2020-05-27T07:27:33.212Z",
                        postId: 0,
                        title: "Test sale, when Firebase DB is down. If you see this, there is no Database connection.",
                        author: "administrator@admin.com",
                        tag: "No DB connection",
                        content: "No connection to Firebase. Marketplace project is working in simple display mode. Most of site sections are unavailable !",
                        date: "June 1st 2020, 7:37 PM",
                        comments: comments
                    }
                    let dataArrayWithoutServiceSale = [];
                    let recentPosts = [];
                    dataArrayWithoutServiceSale[0] = post;
                    recentPosts[0] = post;
                    thisClass._homeView.showGuestPage(recentPosts, dataArrayWithoutServiceSale);
                }
            );
        }
    }
    // show the User page: the same as the above and we just use .showUserPage
    showUserPage() {
        let _that = this; // _that is the HomeController

        let recentPosts = []; // we will store the recent posts for the sidebar in this array

        let token = sessionStorage.getItem('_authToken');
        let requestUrl = this._baseServiceUrl + ".json?auth=" + token;
        // kinvey:
        // let requestUrl = this._baseServiceUrl; //old was: // + "/appdata/" + this._appId + "/posts";

        this._requester.get(requestUrl,
            function success(data) {
                let tempArray = Object.entries(data);
                let dataArray = [];
                for (let i = 0; i < tempArray.length; i++) { // The recent post sales array basically holds the 7 most recent posts, if there are that much
                    if(tempArray[i][1]!= null){
                        dataArray[i] = tempArray[i][1];
                    }
                }
                // here we set sale post to appear in descending order: (we could user .reverse here - it is much more easier)
                dataArray.sort(function (elem1, elem2) {
                    let date1 = new Date(elem1.creation_date);
                    let date2 = new Date(elem2.creation_date);
                    return date2 - date1;
                });

                // here we will prepare an array without the service sale post - the first one:
                let dataArrayWithoutServiceSale = [];
                for (let i = 0; i < dataArray.length; i++) { // The recent post sales array basically holds the 7 most recent posts, if there are that much
                    // add all sale posts without the first one, which is the service one
                    if(i != dataArray.length-1){
                        dataArrayWithoutServiceSale.push(dataArray[i]);
                    }
                }
                console.log(dataArrayWithoutServiceSale);
                for (let i = 0; i < dataArray.length && i < 7; i++) {
                    recentPosts.push(dataArray[i]);
                }
                // We pass the recentPosts filled up array and the data sorted array from the response to the view
                _that._homeView.showUserPage(recentPosts, dataArrayWithoutServiceSale);
            },
            function error(data) {
                showPopup('error', "Error loading sale posts!");
            }
        );
    }
}