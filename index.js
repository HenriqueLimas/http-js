/**
 *
 * 1 - How to make an HTTP request
 *    createClient
 *    open(method, url, true)
 *    setHeaders
 *    withCredentials
 *
 *  2 - handling the server response
 *    onload
 *      200 <= status < 300
 *        success
 *      reject
 *    onerror
 *      reject
 *    onabort
 *      reject
 *
 *  3 - Send
 *    xhr.send(obj)
 *
 *
 *  http(url).get({header, withCredentials});
 *  http(url).post(body, {headers, withCredentials});
 *  http(url).put(body, {headers, withCredentials});
 *  http(url).delete({headers, withCredentials});
 */

/**
 * HTTP function to make AJAX requests using promises
 * @param  {String} url    path to make a request
 * @param  {Object} config configuration file
 * @return {Object}        Object with 4 HTTP methods
 */
function http(url, config) {
  var client;

  config = config || {};
  
  client = config.client || _createClient();
  client.withCredentials = config.withCredentials;

  var promise = new Promise(function(resolve, reject) {
    client.onload = function(e) {
      var client = e.target;
      var status = client.status;
      var response = client.response;

      (_isSuccess(status) ? resolve : reject)(_createResponseObject({
        response: response,
        status: status
      }));
    };

    client.onerror = errorCallback;
    client.onabort = errorCallback;

    /**
     * Callback for errors requests
     * @param  {Event} e Event of the error handler
     * @return {void}
     */
    function errorCallback(e) {
      var client = e.target;
      var status = client.status;
      var response = client.response;

      reject(_createResponseObject({
        response: response,
        status: status
      }));
    }
  });

  /**
   * Function that create the XMLHttpRequest object
   * @private
   * @return {XMLHttpElement} a new client object
   */
  function _createClient() {
    return new XMLHttpRequest();
  }

  /**
   * Function that return if the status is a succces status
   * @private
   * @param  {Number}  status Status request number
   * @return {Boolean}        If is success or not.
   */
  function _isSuccess(status) {
    return status >= 200 && status < 300;
  }

  /**
   * Function that crate the response Object returned in the Promise response
   * @param  {Object} params An object with the response and status value
   * @return {Object}        An object with:
   *                            {Function} json      Function that return the parsed response
   *                            {Any}      response  The response of the request
   *                            {Number}   status    Status of the request
   */
  function _createResponseObject(params) {
    var response = params.response;
    var status = params.status;

    return {
      json: function() {
        return JSON.parse(response);
      },
      data: response,
      status: status
    };
  }

  /**
   * Function to set the header on the client.
   * @param {XMLHttpElement} client  The client object to add the headers
   * @param {Object} headers         Key-value of all the headers
   */
  function _setHeaders(client, headers) {
    for (var key in headers) {
      if (headers.hasOwnProperty(key)) {
        client.setRequestHeader(key, headers[key]);
      }
    }
  }

  /**
   * Function that create a new promise instance with the abort
   * method
   * @param  {Promise} promise        Instance of the promise
   * @param  {XMLHttpElement} client  Client to make the abort
   * @return {Object}                 Promise with the abort method
   */
  function _createReturnedPromise(promise, client) {
    return Object.assign(promise, {
      abort: function() {
        client.abort();
      }
    });
  }

  /**
   * Function that make the request
   * @param  {Object} params Object of parameters:
   *                             {XMLHttpElement} client  Client element
   *                             {String}         method  Method of the request
   *                             {Object}         object with all headers
   *                             {Any}            Data to sendo in the request
   *                             {Promise}        promise instance of the request
   * @return {Promise}        A promise with the abort method.
   */
  function _makeRequest(params) {
    var client = params.client;
    var method = params.method;
    var headers = params.headers;
    var data = params.data || null;
    var promise = params.promise;
    
    client.open(method.toUpperCase(), url, true);
    
    _setHeaders(client, headers);

    client.send(JSON.stringify(data));

    return _createReturnedPromise(promise, client);
  }

  return {
    get: function(params) {
      params = params || {};

      var headers = params.headers;

      return _makeRequest({
        method: 'GET',
        client: client,
        headers: headers,
        promise: promise
      });
    },

    post: function(data, params) {
      params = params || {};

      var headers = params.headers || {};
      headers['Content-type'] = 'application/json';

      return _makeRequest({
        method: 'POST',
        client: client,
        headers: headers,
        data: data,
        promise: promise
      });
    },

    put: function(data, params) {
      params = params || {};

      var headers = params.headers || {};
      headers['Content-type'] = 'application/json';

      return _makeRequest({
        method: 'PUT',
        client: client,
        headers: headers,
        data: data,
        promise: promise
      });
    },

    delete: function(params) {
      params = params || {};

      var headers = params.headers;

      return _makeRequest({
        method: 'DELETE',
        client: client,
        headers: headers,
        promise: promise
      });
    }
  };
}

module.exports = http;
