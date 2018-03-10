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

        if (requestData.title.length < 7) {
            showPopup('error', "Post title must consist of at least 7 symbols.");
            return;
        }

        if (requestData.content.length < 10) {
            showPopup('error', "Post content must consist of at least 10 symbols.");
            return;
        }
        if (!this.validateEmail(requestData.email)) {
            showPopup('error', "Please input valid email address");
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



    editPostPage(postId){ // Download (get) the article from Kinvey
        let thisClass = this;

        if(postId == ""){
            postId = sessionStorage.getItem('id'); // this is needed when we edit the sale from the sale post details page
        }
        //console.log(postId);
        // console.log("===>postId:   " + postId);
        let requestUrl = this._baseServiceUrl + postId;
        this._requester.get(requestUrl,
            function success(data){
                // showPopup('info', "You have successfully loaded the selected post!");
                thisClass._postView.showEditPostPage(data);
            },
            function error() {
                showPopup('error', "Error loading this post!");
            }
        );
    }
     //// the admin functionality was added, now only admins can edit everything
    editPost(requestData) { //Upload (put) the Post in Kinvey
        if (requestData.title.length < 7) {
            showPopup('error', "Post title must consist of at least 7 symbols.");
            return;
        }

        if (requestData.content.length < 10) {
            showPopup('error', "Post content must consist of at least 10 symbols.");
            return;
        }

        if (!this.validateEmail(requestData.email)) {
            showPopup('error', "Please input valid email address");
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
        let views = requestData.views;
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
            views: views,
            auth_username: authorUsername
        };
      
        this._requester.put(requestUrl, request,
            function success() {
                triggerEvent('loadComments', request);
                //redirectUrl("#/");
                showPopup("success", "You have successfully edited this sale post.");
            },
            function error() {
                showPopup("error", "You don't have authorization to edit this sale post.");
            });
    }

    deletePost(postId) { //Delete the selected sale post row in Kinvey
        console.log(postId);
        if(postId == ""){
            postId = sessionStorage.getItem('id'); 
        }
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


    showPostDetails(requestDataPost, isLoggedIn) { // needed when we display the sale post details
        // requestDataPost - is the post itself
        //this._postView.showPostDetails(requestDataPost);  // by showing this sale will show the previous views number

        let requestUrl = this._baseServiceUrl + requestDataPost._id;
        let postTitle = requestDataPost.title;
        let postText = requestDataPost.content;
        let postAuthor = requestDataPost.author;
        let date = requestDataPost.date;
        let tagName = requestDataPost.tag;
        let authorUsername = requestDataPost.auth_username;
        let email = requestDataPost.email;
        let phone = requestDataPost.phone;
        let imageLink = requestDataPost.image;
        let price = requestDataPost.price;
        let views = Number(requestDataPost.views) + 1; // increase the view counter
        let authToken = requestDataPost.authToken;  // this is only needed if we use a standard PUT request
        let commentsArray = requestDataPost['commentsList'];

        let request = {
            title: postTitle,
            content: postText,
            author: postAuthor,
            auth_username: authorUsername,
            date: date,
            tag: tagName,
            email: email,
            phone: phone,
            image: imageLink,
            price: price,
            views: views
        };
        request['commentsList'] = commentsArray;

        this._postView.showPostDetails(request, isLoggedIn);

        ///// we show the sale post details page with actual views number:
        let urn = this._baseServiceUrl.substring(0, 46) + "forviews";
        /////

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

    sortPostByTag(tagName, isLoggedIn) { //Sort The article by Tag Name
        let _that = this;
        let postByTag = [];
        let requestUrl = this._baseServiceUrl;
        let sportTag = tagName;
        this._requester.get(requestUrl,
            function success(data) {
                data.sort(function (elem1, elem2) {
                    let date1 = new Date(elem1._kmd.ect);
                    let date2 = new Date(elem2._kmd.ect);
                    return date2 - date1;
                });

                for (let i = 0; i < data.length; i++) {
                    if (data[i].tag == sportTag) {
                        postByTag.push(data[i]);
                    }
                }

                _that._postView.showSortedPost(postByTag, isLoggedIn);
            },
            function error() {
                showPopup('error', "Error loading posts!");
            }
        );
    }

    validateEmail(email) {

        let filter = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        // more simple email validation: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!filter.test(email)) {
            return false;
        } else{
            return true;
        }
    }

}// end of class PostController
