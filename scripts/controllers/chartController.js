class ChartController {
    constructor(chartView, requester, baseServiceUrl, appId) {
        this._chartView = chartView;
        this._requester = requester;
        this._baseServiceUrl = baseServiceUrl;
        this._appId = appId;
    }

    showCreateChart(isLoggedIn){

        let thisClass = this;

        let recentPosts = []; // we will store the recent posts for the sidebar in this array

        let requestUrl = this._baseServiceUrl + "/appdata/" + this._appId + "/posts";
        // get is taken from framework.js
        // extract from the Kinvey database all the posts and render them
        this._requester.get(requestUrl,
            function success(data) {  // if we get the data do this: // data is the response data, which an array of posts
                let currentId = 1;

                data.sort(function (elem1, elem2) {
                    let date1 = new Date(elem1._kmd.ect); 
                    let date2 = new Date(elem2._kmd.ect);
                    return date2 - date1; // sort elements by date descending - most recent is on the top
                });

                for (let i = 0; i < data.length; i++) { 
                    data[i].postId = currentId;
                    currentId++;
                    recentPosts.push(data[i]);
                }
              
                  thisClass._chartView.showSalesChart(recentPosts);
            },
            function error(data) { // if there is an error show this error message
                showPopup('error', "Error loading posts!");
            }
        );
    }
}


