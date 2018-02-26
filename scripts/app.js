(function () {

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

    // define 2 selectors as preparatory actions, they are hardcoded, used in the views in the constructors
    let selector = ".wrapper"; // usage in index.html
    let mainContentSelector = ".main-content"; // usage in welcome-user.html, welcome-guest.html, form-guest.html, form-user.html

    // Create HomeView, HomeController, UserView, UserController, PostView and PostController
    let homeView = new HomeView(selector, mainContentSelector);
    let homeController = new HomeController(homeView, requester, baseUrl, appKey);

    let userView = new UserView(selector, mainContentSelector);
    let userController = new UserController(userView, requester, baseUrl, appKey);

    let postView = new PostView(selector, mainContentSelector);
    let postController = new PostController(postView, requester, baseUrl, appKey);

    let commentView = new CommentView(selector,mainContentSelector);
    let commentController = new CommentController(commentView, requester, baseUrl, appKey);

    initEventServices();
    // onRoute function is provided by the framework
    onRoute("#/", function () {
        // Check if user is logged in and if its not show the guest page, otherwise show the user page...
        if(authService.isLoggedIn()){
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
            fullname: sessionStorage['fullname']
        }
        postController.showCreatePostPage(loggedUser, authService.isLoggedIn());
    });

    onRoute('#/post/:id', function () {   // this is when we open the sale details
        sessionStorage.setItem('id', this.params['id']);
        postController.getPost();
    });

    bindEventHandler('loadComments', function (event, data){  //  this is when we open the sale details
        // Creates a list of all comments
        commentController.loadComments(data);
    });

    bindEventHandler('postCommentList', function (event, data){  // this is when we open the sale details
        // Post a list with all comments
        postController.showPostDetails(data);
    });
    
    onRoute("#/edit/post/", function (postId) {
        postController.editPostPage(postId.params['id']);
    });
    onRoute('#/delete/post/', function (postId) {
        postController.deletePost(postId.params['id']);
    });
    onRoute('#/tag/', function (data) {
        let tagName = data.params.tag;
        
        if(authService.isLoggedIn()){
            postController.sortPostByTag(tagName, true);
        } else{
            postController.sortPostByTag(tagName, false);
        }

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
