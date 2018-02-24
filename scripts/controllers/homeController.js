class HomeController {
    constructor(homeView, requester, baseServiceUrl, appId) {
        this._homeView = homeView;
        this._requester = requester;
        this._baseServiceUrl = baseServiceUrl;
        this._appId = appId;
    }

    showGuestPage() {
        let thisClass = this;

        let recentPosts = []; // we will store the recent posts for the sidebar in this array

        let requestUrl = this._baseServiceUrl + "/appdata/" + this._appId + "/posts";
        // get is taken from framework.js
        //extract from the Kinvey database all the posts and render them
        this._requester.get(requestUrl,
            function success(data) {  // if we get the data do this: // data is the response data, which an array of posts
                let currentId = 1;

                data.sort(function (elem1, elem2) {
                    let date1 = new Date(elem1._kmd.ect); //Every Kinvey database object has a member called “_kmd” which holds metadata. ect member from the _kmd member is basically the time of creation of the current element.
                    let date2 = new Date(elem2._kmd.ect);
                    return date2 - date1; // sort elements by date descending - most recent is on the top
                });

                for (let i = 0; i < data.length && i < 7; i++) { // The recent post sales array basically holds the 7 most recent posts, if there are that much
                    data[i].postId = currentId;
                    currentId++;
                    recentPosts.push(data[i]);
                }
                // We pass the recentPosts filled up array and the data sorted array from the response to the view
                thisClass._homeView.showGuestPage(recentPosts, data); // we have all the data needed, and it is processed, sorted and formatted correctly, we can pass it to the view which will render the page
            },
            function error(data) { // if there is an error show this error message
                showPopup('error', "Error loading posts!");
            }
        );
    }
    // show the User page: the same as the above and we just use .showUserPage
    showUserPage() {
        let _that = this; // _that is the HomeController

        let recentPosts = []; // we will store the recent posts for the sidebar in this array

        let requestUrl = this._baseServiceUrl + "/appdata/" + this._appId + "/posts";

        this._requester.get(requestUrl,
            function success(data) {
                let currentId = 1;

                data.sort(function (elem1, elem2) {
                    let date1 = new Date(elem1._kmd.ect);
                    let date2 = new Date(elem2._kmd.ect);
                    return date2 - date1;
                });

                for (let i = 0; i < data.length && i < 7; i++) {
                    data[i].postId = currentId;
                    currentId++;
                    recentPosts.push(data[i]);
                }

                _that._homeView.showUserPage(recentPosts, data);
            },
            function error(data) {
                showPopup('error', "Error loading sale posts!");
            }
        );
    }
}