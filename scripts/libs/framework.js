// this is a custom self-made framework
// this is the old Kinvey requestor - it is not used now:
class Requester {
    constructor(authorizationService) {
        this.authorizationService = authorizationService;
    }
                   //2 and 3 are two functions
    get(url, successCallback, errorCallback) {
        let requestHeaders = this._getHeaders(true);
        this._makeRequest('GET', url, null, requestHeaders, successCallback, errorCallback);
    }

    post(url, data, successCallback, errorCallback) {
        let requestHeaders = this._getHeaders(false);
        this._makeRequest('POST', url, data, requestHeaders, successCallback, errorCallback);
    }

    put(url, data, successCallback, errorCallback) {
        let requestHeaders = this._getHeaders(false);
        this._makeRequest('PUT', url, data, requestHeaders, successCallback, errorCallback);
    }

    delete(url, data, successCallback, errorCallback) {
        let requestHeaders = this._getHeaders(false);
        this._makeRequest('DELETE', url, data, requestHeaders, successCallback, errorCallback);
    }
    // this method makes the query to the database
    _makeRequest(method, url, data, headers, successCallBack, errorCallBack) {
        $.ajax({
            method: method,
            url: url,
            headers: headers,
            data: JSON.stringify(data) || null,
            beforeSend: function () {
                if ($("#loader-modal").length) {   // this is the loader gif like visualisation
                    $("#loader-modal").css("display", "block");
                    $(".wrapper").css("display", "none");
                }
            },
            success: successCallBack,
            error: errorCallBack,
            complete: function () {
                if ($("#loader-modal").length) {
                    $("#loader-modal").css("display", "none");
                    $(".wrapper").css("display", "inline-block");
                }
            }
        });
    }

    _getHeaders(isGuest) {
        let headers = this.authorizationService.getAuthorizationHeaders(isGuest);
        return headers;
    }
}

let _guestCredentials;
let _appCredentials;

// old Kinvey Authorization service - not used now:
class AuthorizationService {
    constructor(baseServiceUrl, appId, appSecret, guestUserCredentials) {
        this.baseServiceUrl = baseServiceUrl;
        this.appId = appId;
        this.appSecret = appSecret;
        _guestCredentials = guestUserCredentials;
        _appCredentials = btoa(appId + ":" + appSecret);
    }

    initAuthorizationType(authType) {
        this.authType = authType;
    }

    getCurrentUser() {
        return sessionStorage['username'];
    }

    isLoggedIn() {
        return this.getCurrentUser() != undefined;
    }
    // depends on the user it logs us this way
    getAuthorizationHeaders(isGuest) {
        let headers = {};

        if (this.isLoggedIn()) {  // if user is logged
            headers = {
                'Authorization': this.authType + ' ' + sessionStorage['_authToken']
            };
        } else if (!this.isLoggedIn() && isGuest) {  // if user is guest
            headers = {
                'Authorization': this.authType + ' ' + _guestCredentials
            };
        } else if (!this.isLoggedIn() && !isGuest) {  // is user is not logged and not a guest
            headers = {
                'Authorization': 'Basic' + ' ' + _appCredentials
            };
        }

        headers['Content-Type'] = 'application/json';

        return headers;
    }
}

// Firebase Authorization service:
class AuthorizationServiceFirebase {
    constructor(baseServiceUrl, usln, usps) {
        this.baseServiceUrl = baseServiceUrl;
        this.usln = usln;
        this.usps = usps;
    }

    getCurrentUser() {
        return sessionStorage['username'];
    }

    isLoggedIn() {
        return this.getCurrentUser() != undefined;
    }
}
// Firebase Requester:
class RequesterFirebase {
    constructor(authorizationServiceFirebase) {
        this.authorizationServiceFirebase = authorizationServiceFirebase;
    }
    //2 and 3 are two functions
    get(url, successCallback, errorCallback) {
        this._makeRequest('GET', url, null, successCallback, errorCallback);
    }

    post(url, data, successCallback, errorCallback) {
        this._makeRequest('POST', url, data, successCallback, errorCallback);
    }

    put(url, data, successCallback, errorCallback) {
        this._makeRequest('PUT', url, data, successCallback, errorCallback);
    }
    // patch is similar to 'PUT', but it updates data in DB only partially, not all the data, but the one we specify in the data variable
    patch(url, data, successCallback, errorCallback) {
        this._makeRequest('PATCH', url, data, successCallback, errorCallback);
    }

    delete(url, data, successCallback, errorCallback) {
        this._makeRequest('DELETE', url, data, successCallback, errorCallback);
    }
    // this method makes the query to the database
    _makeRequest(method, url, data, successCallBack, errorCallBack) {
        $.ajax({
            method: method,
            url: url,
            data: JSON.stringify(data) || null,
            beforeSend: function () {
                if ($("#loader-modal").length) {   // this is the loader gif like visualisation
                    $("#loader-modal").css("display", "block");
                    $(".wrapper").css("display", "none");
                }
            },
            success: successCallBack,
            error: errorCallBack,
            complete: function () {
                if ($("#loader-modal").length) {
                    $("#loader-modal").css("display", "none");
                    $(".wrapper").css("display", "inline-block");
                }
            }
        });
    }
}


// this function shows the pop up windows
function showPopup(type, text, position) {

    function _showSuccessPopup(text, position) {
        if(position == null || position == ""){
            position = 3000;
        }
        noty({
            text: text,
            timeout: position,
            layout: 'top',
            type: 'success'
        });
    }

    function _showInfoPopup(text, position) {
        noty({
            text: text,
            timeout: 2000,
            layout: 'top',
            type: 'information'
        });
    }

    function _showWarningPopup(text, position) {
        noty({
            text: text,
            timeout: 2000,
            layout: 'top',
            type: 'warning'
        });
    }

    function _showErrorPopup(text, position) {
        if(position == null || position == ""){
            position = 3000;
        }
        noty({
            text: text,
            timeout: position,
            layout: 'top',
            type: 'error'
        });
    }

    switch (type) {
        case 'success':
            _showSuccessPopup(text, position);
            break;
        case 'info':
            _showInfoPopup(text, position);
            break;
        case 'warning':
            _showWarningPopup(text, position);
            break;
        case 'error':
            _showErrorPopup(text, position);
            break;
    }
}


// EVENT SERVICES

let _isInstanced = false;
let _router;

function initEventServices() {
    if (_isInstanced) {
        return;
    }

    _router = Sammy(function () {
        //Here we put all pre-initialized functions, event handlers, and so on...

        this.bind('redirectUrl', function (ev, url) {
            this.redirect(url);
        });
    });

    _isInstanced = true;
}

function redirectUrl(url) {
    Sammy(function () {
        this.trigger('redirectUrl', url);
    });
}

function bindEventHandler(event, eventHandler) {
    Sammy(function () {
        this.bind(event, eventHandler);
    });
}

function onRoute(route, routeHandler) {
    Sammy(function () {
        this.get(route, routeHandler);
    });
}

function triggerEvent(event, data) {
    Sammy(function () {
        this.trigger(event, data);
    });
}

function run(rootUrl) {
    _router.run(rootUrl);
}