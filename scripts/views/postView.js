class PostView {

    constructor(wrapperSelector, mainContentSelector) {
        this._wrapperSelector = wrapperSelector;
        this._mainContentSelector = mainContentSelector;
    }

    showCreatePostPage(user, isLoggedIn) { // user is the data about the currently logged in user, if there is such, we defined it here in app.js: onRoute('#/posts/create', function () {
        // user contains 2 parameters username and fullname, as it was created this way
        let _that = this;
        let templateUrl = isLoggedIn ? "templates/form-user.html" : "templates/form-guest.html";
        

        $.get(templateUrl, function(template) {
            let renderedWrapper = Mustache.render(template, null);
            $(_that._wrapperSelector).html(renderedWrapper);

            $.get('templates/create-post.html', function (template) {
                var renderedContent = Mustache.render(template, null);
                $(_that._mainContentSelector).html(renderedContent);
                // set the author element to the current user’s username, which for Firebase is the email
                $('#author').val(user.username);
         
                $('#create-new-post-request-button').on('click', function (ev) {
                    // when clicked - we first extract the title, author, content, etc. of the current sale post
                    let title = $('#title').val();
                    let author = $('#author').val();
                    let content = $('#content').val();
                    let email = $('#email').val();
                    let phone = $('#phone').val();
                    let image = $('#image').val();
                    // we use Moment JS to extract the current date, the moment at which the post was created
                    let date = moment().format("MMMM Do YYYY HH:mm:ss");
                    let tag = $('#tag').val();
                    let price = $('#price').val();
                    let views = 0;
                    let postId = 0;
                    let lastCommentId = 0;
                    let commentsArray = ['0'];

                    // Then we create a data object to hold the necessary things for our post, and we trigger an event “createPost” and pass the object with it
                    let data = {
                        title: title,
                        author: author,
                        content: content,
                        date: date,
                        creation_date: new Date(),
                        tag: tag,
                        email: email,
                        phone: phone,
                        image: image,
                        price: price,
                        views: views,
                        comments: commentsArray,
                        auth_username: user.username,
                        last_comment_id: lastCommentId,
                        postId: postId
                    };
                    // triggerEvent triggers createPost method in PostController:
                    triggerEvent('createPost', data);
                });
            });
        });
    }

    showEditPostPage(data) {//Show the sale post which we want to edit; data is the sale post
        //console.log(sessionStorage.getItem('authToken'));
        console.log(data);
        let thisClass = this;
        let templateUrl;
        let authToken = sessionStorage['_authToken'];
        let loggedUser = sessionStorage.getItem("username").toString(); // we get the username of the logged user
        if (authToken != null && authToken != 'undefined') {
            templateUrl = "templates/edit-post.html";
        }
        else {
            showPopup("error", "Please Login.");
            redirectUrl("#/login");
            return;
        }
        // $.get(templateUrl, function (template) {
        //     let navSelector = Mustache.render(template, null);
        //     $(thisClass._wrapperSelector).html(navSelector);
        // });
        //console.log(authToken);
        if(loggedUser == "admin@admin.com"){
            //console.log(loggedUser);
            $.get('templates/edit-post.html', function (template) {

                var renderMainContent = Mustache.render(template, null);
                $(thisClass._mainContentSelector).html(renderMainContent);
                document.getElementById('author').value = data.author;
                document.getElementById('content').value = data.content;
                document.getElementById('title').value = data.title;
                document.getElementById('email').value = data.email;
                document.getElementById('phone').value = data.phone;
                document.getElementById('image').value = data.image;
                document.getElementById('price').value = data.price;
                let authorUserName = data.auth_username;
                let postId = data.postId;
                let postAuthor = data.author;
                let views = data.views;
                let date = data.date;
                console.log(postAuthor);
                let authorToken = authToken;  // the authorization token

                let prevTagValue = data.tag;
                $('#edit-post-request-button').on('click', function (ev) {
                    
                    let tag = $('#tag').val();
                    if(tag == "-------"){
                        tag = prevTagValue;
                    }

                    let data = {
                        "title":  document.getElementById('title').value,
                        "author": postAuthor,
                        "content": document.getElementById('content').value,
                        "date": date,
                        "postId": postId,
                        "tag": tag,
                        "email": document.getElementById('email').value,
                        "phone": document.getElementById('phone').value,
                        "image": document.getElementById('image').value,
                        "price": document.getElementById('price').value,
                        "views": views,
                        "authToken": authorToken,
                        "authUsername": authorUserName
                    };
                    triggerEvent('editPost', data);
                });
                $('#edit-post-cancel-button').on('click', function (ev) {
                    //triggerEvent('goHome', null);
                    triggerEvent('postCommentList', data);
                });
            });
        } else if (loggedUser!=data.auth_username){
            showPopup("error", "You cannot edit other user posts !");
            // triggerEvent('goHome', null);
            triggerEvent('postCommentList', data);
        } else{
            $.get('templates/edit-post.html', function (template) {

                var renderMainContent = Mustache.render(template, null);
                $(thisClass._mainContentSelector).html(renderMainContent);
                $('#author').val(data.author);
                //document.getElementById('author').value = data.author;
                document.getElementById('content').value = data.content;
                document.getElementById('title').value = data.title;
                document.getElementById('email').value = data.email;
                document.getElementById('phone').value = data.phone;
                document.getElementById('image').value = data.image;
                document.getElementById('price').value = data.price;
                let postId = data.postId;
                let authorUserName = data.auth_username;
                let views = data.views;
                let date = data.date;

                let authorToken = authToken;  // the authorization token

                let prevTagValue = data.tag;
                let authorName = data.author;

                $('#edit-post-request-button').on('click', function (ev) {
                    let tag = $('#tag').val();
                    if(tag == "-------"){
                        tag = prevTagValue;
                    }

                    // let date = moment().format("MMMM Do YYYY");
                    let data = {
                        "title":  document.getElementById('title').value,
                        "author": authorName,
                        "content": document.getElementById('content').value,
                        "date": date,
                        "postId": postId,
                        "tag": tag,
                        "email": document.getElementById('email').value,
                        "phone": document.getElementById('phone').value,
                        "image": document.getElementById('image').value,
                        "price": document.getElementById('price').value,
                        "views": views,
                        "authToken": authorToken,
                        "authUsername": authorUserName
                    };
                    
                    triggerEvent('editPost', data);
                });
                $('#edit-post-cancel-button').on('click', function (ev) {
                    // triggerEvent('goHome', null);
                    triggerEvent('postCommentList', data);
                });
            });
        }
    }
    showPostDetails(post, isLoggedIn) { //Show the article which we want to see (incl. all comments)
        let thisClass = this;
        let testArray = post.comments;
        let postData = null;

        // do this check, we will enter here when post is just created and there are no comments, or when the last comment was deleted:
        // this will mask the zero 0 comment, which is present in order for Firebase not to delete comments record inside the post object under posts
        // the zero comment is post.comments = ['0']
        if(testArray.length == 1 && testArray[0] == "0"){
            postData = {
                postDetails: post  // this what we pass to the view
            };
        } else{
            // if there is one comment, which is real or more - show the comments:
            postData = {
                postDetails: post,  // this what we pass to the view
                postComments: post.comments.reverse()   // future implementation
            };
        }


        if(isLoggedIn){
            $.get('templates/details-post.html', function (template) {
                var renderMainContent = Mustache.render(template, postData);
                $(thisClass._mainContentSelector).html(renderMainContent);
            });
        } else{
            $.get('templates/details-post-guest.html', function (template) {
                var renderMainContent = Mustache.render(template, postData);
                $(thisClass._mainContentSelector).html(renderMainContent);
            });
        }
    }
    
    showSortedPost(data, isLoggedIn) {//Sorts sales posts By Tag Name
        let thisClass = this;
        let tagName = data[0].tag;
        let tagArray = [];
        tagArray[0] = { "tagN":tagName};
        //console.log(tagArray);
        //console.log(tagName);
        let postsData = {
            sortedPosts: data,  // sortedPosts is used in the postsByTagName.html
            nameOfTag: tagArray
        };
        if(isLoggedIn){
            $.get('templates/postsByTagName.html', function (template) {
                var renderMainContent = Mustache.render(template, postsData);
                $(thisClass._mainContentSelector).html(renderMainContent);
            });
        } else{
            $.get('templates/postsByTagName-guest.html', function (template) {
                var renderMainContent = Mustache.render(template, postsData);
                $(thisClass._mainContentSelector).html(renderMainContent);
            });
        }

    }
}