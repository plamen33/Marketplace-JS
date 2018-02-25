class PostController {
    constructor(postView, requester, baseUrl, appId) {
        this._postView = postView;
        this._requester = requester;
        this._appId = appId;
        this._baseServiceUrl = baseUrl + "/appdata/" + appId + "/posts/";
    }

    showCreatePostPage(data, isLoggedIn) {  // data parameter is the current user
        this._postView.showCreatePostPage(data, isLoggedIn);
    }

    createPost(requestData) {

        if (requestData.title.length < 3) {
            showPopup('error', "Post title must consist of at least 10 symbols.");
            return;
        }

        if (requestData.content.length < 3) {
            showPopup('error', "Post content must consist of at least 50 symbols.");
            return;
        }

        let requestUrl = this._baseServiceUrl;

        this._requester.post(requestUrl, requestData,
            function success(data) {  // data parameter is the current user
                showPopup('success', "You have successfully created a new sale post.");
                redirectUrl("#/");
            },
            function error(data) {
                showPopup('error', "An error has occurred while attempting to create a new sale post.");
            });
    }



    editPostPage(data){ // Download (get) the article from Kinvey
        let thisClass = this;
        let requestUrl = this._baseServiceUrl + data;
        this._requester.get(requestUrl,
            function success(data){
                //showPopup('info', "You have successfully loaded the selected post!");
                thisClass._postView.showEditPostPage(data);
            },
            function error() {
                showPopup('error', "Error loading this post!");
            }
        );
    }
     //// the admin functionality was added, now only admins can edit everything
    editPost(requestData) { //Upload (put) the Post in Kinvey
        if (requestData.title.length < 10) {
            showPopup('error', "Post title must consist of at least 10 symbols.");
            return;
        }

        if (requestData.content.length < 50) {
            showPopup('error', "Post content must consist of at least 50 symbols.");
            return;
        }
        let requestUrl = this._baseServiceUrl + requestData._id;
        
        let postTitle = requestData.title;
        let postText = requestData.content;
        let postAuthor = requestData.author;
        let date = requestData.date;
        let tagName = requestData.tag;
        let authorUsername = requestData.authUsername;
        let email = requestData.email;
        let phone = requestData.phone;
        let imageLink = requestData.image;
        let price = requestData.price;
        let authToken = requestData.authToken;  // this is only needed if we use a standard PUT request

        let request = {
            title: postTitle,
            content: postText,
            author: postAuthor,
            date: date,
            tag: tagName,
            email: email,
            phone: phone,
            image: imageLink,
            price: price,
            auth_username: authorUsername
        };
      
        this._requester.put(requestUrl, request,
            function success() {
                redirectUrl("#/");
                showPopup("success", "You have successfully edited this sale post.");
            },
            function error() {
                showPopup("error", "You don't have authorization to edit this sale post.");
            });
    }

    deletePost(postId) { //Delete the selected sale post row in Kinvey
        console.log(postId);
        let requestUrl = this._baseServiceUrl + postId;

        let headers = {};
        headers['Authorization'] = "Kinvey " + sessionStorage.getItem('_authToken');
        headers['Content-Type'] = "application/json";
        let requestData = {
            headers: headers
        };
        //console.log(requestData);
        this._requester.delete(requestUrl, requestData,
            function success(response) {
                showPopup("success", "You have successfully deleted this sale");
                redirectUrl("#/home")
            },
            function error(response) {
                showPopup("error", "You don't have authorization to delete this sale post !");
            });
    }
    goHome(){
        redirectUrl("#/")
    }

    getPost() {   // needed when we display the sale post details
        let postid = sessionStorage.getItem('id');
        let requestUrl = this._baseServiceUrl + postid;

        this._requester.get(requestUrl,
            function success(selectedPost) {
                //showPopup('success', "You have loaded this sale post just fine!");
                triggerEvent('loadComments', selectedPost);
            },
            function error() {
                showPopup('error', "Error loading this sale post!");
            });
    }


    showPostDetails(requestDataPost) { // needed when we display the sale post details
        // requestDataPost - is the post itself
        this._postView.showPostDetails(requestDataPost);

        let requestUrl = this._baseServiceUrl + requestDataPost._id;
        let postTitle = requestDataPost.title;
        let postText = requestDataPost.content;
        let postAuthor = requestDataPost.author;
        let date = requestDataPost.date;
        let tagName = requestDataPost.tag;
        let authorUsername = requestDataPost.authUsername;
        let email = requestDataPost.email;
        let phone = requestDataPost.phone;
        let imageLink = requestDataPost.image;
        let price = requestDataPost.price;
        let views = Number(requestDataPost.views) + 1; // increase the view counter
        let authToken = requestDataPost.authToken;  // this is only needed if we use a standard PUT request


        let request = {
            title: postTitle,
            content: postText,
            author: postAuthor,
            date: date,
            tag: tagName,
            email: email,
            phone: phone,
            image: imageLink,
            price: price,
            views: views,
            auth_username: authorUsername
        };

        let urn = this._baseServiceUrl.substring(0, 46) + "forviews";

        let headersOne = {"Authorization": "Basic " + "dXNlcjoxMjM0NQ==", "Content-type": "application/json"};

        $.ajax({
            method: "GET",
            url: urn,
            headers: headersOne,
            success: loadSuccessData,
            error: handleAjaxErrorOne
        });
        function loadSuccessData(data){
            // showPopup("success", "READ DATA FINE");
            let lnx = data[0].data;
            let headers = { "Authorization": "Kinvey " + lnx };

            $.ajax({
                method: 'PUT',
                url: requestUrl,
                headers: headers,
                data: request,
                success: loadViewSuccess,
                error: handleAjaxError
            });
            function loadViewSuccess(request){
               // showPopup("success", "sale post view increased with 1");
            }
            function handleAjaxError(response) {
                // showPopup("error", "Cannot increase the view counter");
            }
        }
        function handleAjaxErrorOne(response) {
            showPopup("error", "I cannot read from DB, while opening sale post details page");
        }
    }
}// end of class PostController
