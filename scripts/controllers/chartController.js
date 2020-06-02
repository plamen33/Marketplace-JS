class ChartController {
    constructor(chartView, requester, baseServiceUrl, appId) {
        this._chartView = chartView;
        this._requester = requester;
        this._baseServiceUrl = baseServiceUrl;
        this._appId = appId;
    }

    showCreateChart(isLoggedIn){
        console.log("enter Chart Controller");
        let token = sessionStorage.getItem('_authToken');
        let thisClass = this;

        let recentPosts = []; // we will store the recent posts for the sidebar in this array

        // let requestUrl = this._baseServiceUrl + "/appdata/" + this._appId + "/posts";  // Kinvey URL

        let requestUrl = this._baseServiceUrl + "posts.json?auth=" + token;
        // get is taken from framework.js
        // extract from the Firebase database all the posts and render them
        this._requester.get(requestUrl,
            function success(data) {  // if we get the data do this: // data is the response data, which an array of posts
                let currentId = 1;
                // sort the posts in descending order, first to be the last sale post:
                data.sort(function (elem1, elem2) {
                    let date1 = new Date(elem1.creation_date);
                    let date2 = new Date(elem2.creation_date);
                    return date2 - date1; // sort elements by date descending - most recent is on the top
                });
                
                for (let i = 0; i < data.length; i++) { 
                    data[i].postId = currentId;
                    currentId++;
                    // to eliminate for sure the service post sale record, with index 0:
                    if(i != data.length-1){
                        recentPosts.push(data[i]);
                    }
                }
                console.log("ChartController recent posts prepared: " + recentPosts);
                // We pass the recentPosts filled up array and the data sorted array from the response to the view
                // thisClass._homeView.showGuestPage(recentPosts, data); // we have all the data needed, and it is processed, sorted and formatted correctly, we can pass it to the view which will render the page
                  thisClass._chartView.showSalesChart(recentPosts);
            },
            function error(data) { // if there is an error show this error message
                showPopup('error', "Error loading posts!");
            }
        );
    }
}


