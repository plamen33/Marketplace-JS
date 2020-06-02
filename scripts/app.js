(function () {

    // Firebase initialization:
    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyAZtJrHNVVA4D5YKnBZ2UH-oWZJQkmqP-s",
        authDomain: "marketplace-c21f5.firebaseapp.com",
        databaseURL: "https://marketplace-c21f5.firebaseio.com",
        projectId: "marketplace-c21f5",
        storageBucket: "marketplace-c21f5.appspot.com",
        messagingSenderId: "173412071754",
        appId: "1:173412071754:web:412409d17d0efb7b0ea9b3"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    let usln = "read@read.com";
    let usps = "readget";
    
    // Create your own kinvey application

    let baseUrl = "https://baas.kinvey.com"; 
    let appKey = "kid_HkqgafcLG";
    let appS = "0f4b7f1a83a24f768ab2b28d2e38e194";
    let _guestCredentials = "02f62093-6ce8-471f-a17a-fc53558166b9.g/sTW6F5EUYWK2EUSxeWJxEguuMyxuZK7wDchYN/NF4=";
       // "2e26d4cf-ce25-4d16-b134-2fa89cf40199.w1togz4f8CilOLBT3Z8fdCR2kKMnDRm/6gQ8NLDVxWs="; // Create a guest user using PostMan/RESTClient/Fiddler and place his authtoken here

    // Create AuthorizationService and Requester
    // The application requires a Requester, to handle the HTTP requests, and an Authorization Service, to handle the authorization and generating of request headers.
    // framework.js provides implementation for both classes.
        // for syntax look in the framework.js:
    let authService = new AuthorizationService(baseUrl, appKey, appS, _guestCredentials);
    // Every API has some authorization type in its session authorization header, that is why we need:
    authService.initAuthorizationType("Kinvey");
    //Requester constructor accepts an AuthorizationService as a parameter, because the requester needs one, in order to generate its request’s headers:
    let requester = new Requester(authService);

    // DEBUG: test link for scenario when there is no Firebase connection due to some reason:
    // const firebaseBaseUrl = 'http://nodatabase.connection.com/';

    const firebaseBaseUrl = 'https://marketplace-c21f5.firebaseio.com/';
    const postsFireBaseUrl = firebaseBaseUrl + 'posts';


    let authServiceFirebase = new AuthorizationServiceFirebase(firebaseBaseUrl, usln, usps);
    let requesterFirebase = new RequesterFirebase(authServiceFirebase);

    // define 2 selectors as preparatory actions, they are hardcoded, used in the views in the constructors
    let selector = ".wrapper"; // usage in index.html
    let mainContentSelector = ".main-content"; // usage in welcome-user.html, welcome-guest.html, form-guest.html, form-user.html

    console.log("DEBUG: initial step enter 0");
    
    // Create HomeView, HomeController, UserView, UserController, PostView and PostController
    let homeView = new HomeView(selector, mainContentSelector);
    let homeController = new HomeController(homeView, requesterFirebase, postsFireBaseUrl, appKey);

    // to be revised, more work here is needed:
    let userView = new UserView(selector, mainContentSelector);
    let userController = new UserController(userView, requesterFirebase, firebaseBaseUrl, appKey);

    let postView = new PostView(selector, mainContentSelector);
    let postController = new PostController(postView, requesterFirebase, firebaseBaseUrl, appKey);

    let commentView = new CommentView(selector,mainContentSelector);
    let commentController = new CommentController(commentView, requesterFirebase, firebaseBaseUrl, appKey);

    let chartView = new ChartView(selector,mainContentSelector);
    let chartController = new ChartController(chartView, requesterFirebase, firebaseBaseUrl, appKey);
    
    initEventServices();
    // onRoute function is provided by the framework

    onRoute("#/", function () {
        console.log("app.js enter main route");
        // Check if user is logged in and if its not show the guest page, otherwise show the user page...
        if(authServiceFirebase.isLoggedIn()){
            homeController.showUserPage();
        } else{
            homeController.showGuestPage();
        }
    });
    onRoute("#/home", function () {
        postController.goHome();
    });

    onRoute("#/post-:id", function () { // “:id” in the route is a variable in the route, it can be extracted by using “this.params”.
        // Create a redirect to one of the recent posts...
        let top = $("#post-" + this.params['id']).position().top; // We extract the post, which is with that id, it’s position, and we scroll the window to that position
        $(window).scrollTop(top); //The id’s were set before, when were rendering the posts in the Home Controller
    });

    onRoute("#/login", function () {
        // Show the login page...
        userController.showLoginPage(authService.isLoggedIn());
    });

    onRoute("#/register", function () {
        // Show the register page...
        userController.showRegisterPage(authService.isLoggedIn())
    });

    onRoute("#/logout", function () {
        // Logout the current user...
        userController.logout();
    });

    onRoute('#/posts/create', function () {
        // we create an object that will store the user username and user fullname:
        let loggedUser = {
            username: sessionStorage['username'],
            //fullname: sessionStorage['fullname']  // not available for the moment for Firebase
        };
        postController.showCreatePostPage(loggedUser, authService.isLoggedIn());
    });

    onRoute('#/post/:id', function () {   // this is when we open the sale details
        let id = this.params['id'];
        // this check is needed when we return back when editing a sale
        if(id.includes("{{")&&id.includes("}}")){
            id = id.substring(2,id.length-2);
        }
        sessionStorage.setItem('id', id);
        //sessionStorage.setItem('id', this.params['id']);
        console.log("id is " +  id);
        postController.getPost();
    });
    onRoute('#/create/comment/', function () {
        commentController.showCreateCommentPage(authService.isLoggedIn());
        //sessionStorage.setItem('id', postId.params['id']);
    });

    onRoute("#/edit/post/", function (postId) {
        console.log("post ID: "+postId.params._id);
        console.log(postId);
        postController.editPostPage(postId.params['id']);
    });
    onRoute('#/delete/post/', function (postData) {
        // console.log(postIdData.params['id']);
        // not sure why we set here id, but it works this way:
        postController.deletePost(postData.params['id'], postData.params['author']);
    });
    onRoute('#/delete/comment/', function (data) {
        // we can extract the ids also using this.params, as below:
        // console.log("comment ID: " + this.params['id']);
        // console.log("post ID is : " + this.params['postId']);

        // data contains the comment ID, which is id  and the postId which is postId:   and commentAuthor which is comment_author
        //                        this is the comment id   this is the postId     this is the comment author:
        commentController.deleteComment(data.params['id'], data.params['postId'], data.params['commentAuthor']);
    });
    onRoute('#/tag/', function (data) {
        let tagName = data.params.tag;

        if(authService.isLoggedIn()){
            postController.sortPostByTag(tagName, true);
        } else{
            postController.sortPostByTag(tagName, false);
        }

    });
    onRoute('#/salesChart', function () {
        chartController.showCreateChart(authService.isLoggedIn());
    });

    bindEventHandler('createComment', function (event, data) {
        //  Create a new comment...
        commentController.createComment(data);
    });

    bindEventHandler('loadComments', function (event, data){  //  this is when we open the sale details
        // Creates a list of all comments
        commentController.loadComments(data);
    });

    bindEventHandler('postCommentList', function (event, data){  // this is when we open the sale details
        // Post a list with all comments/
        postController.showPostDetails(data, authService.isLoggedIn());
    });

    bindEventHandler('login', function (ev, data) {
        // Login the user...
        userController.login(data);
    });

    bindEventHandler('register', function (ev, data) {
        // Register a new user...
        userController.register(data);
    });

    bindEventHandler('createPost', function (ev, data) {
        // Create a new post...
        postController.createPost(data);
    });
    bindEventHandler('editPost', function (ev, data) {
        // Edit a new post...
        postController.editPost(data);
    });
   

    run('#/');
})();
