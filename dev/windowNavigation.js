/*
 * Window navigation JS package for Bear Framework
 * https://github.com/ivopetkov/window-navigation-js-bearframework-addon
 * Copyright (c) Ivo Petkov
 * Free to use under the MIT license.
 */

/* global clientPackages */

var ivoPetkov = ivoPetkov || {};
ivoPetkov.bearFrameworkAddons = ivoPetkov.bearFrameworkAddons || {};
ivoPetkov.bearFrameworkAddons.windowNavigation = ivoPetkov.bearFrameworkAddons.windowNavigation || (function () {

    var stateDataPropertyName = 'ipwnd';
    var stateIDPropertyName = 'ipwni';

    var changeHandlers = [];

    var addChangeHandler = function (handler) {
        changeHandlers.push(handler);
    };

    var removeChangeHandler = function (handler) {
        changeHandlers = changeHandlers.filter(function (h) {
            return h != handler;
        });
    };

    var dispatchOnChange = async function () {
        //debugCurrentState();
        for (var changeHandler of changeHandlers) {
            await changeHandler();
        }
    };

    var idCounter = 0;

    var updateCurrentStateID = function () {
        idCounter++;
        var id = (new Date()).getTime().toString() + '-' + idCounter;
        setCurrentStateProperty(stateIDPropertyName, id);
        return id;
    };

    var getCurrentStateProperty = function (name) {
        var state = window.history.state;
        if (state !== null && typeof state === 'object' && typeof state[name] !== 'undefined') {
            return state[name];
        }
        return null;
    };

    var setCurrentStateProperty = function (name, value) {
        var state = window.history.state;
        if (state === null) {
            state = {};
        }
        if (typeof state !== 'object') {
            throw new Error('The history.state is not an object!');
        }
        state[name] = value;
        window.history.replaceState(state, null, window.location);
    };

    var disableHashChangeEvent = false;

    window.addEventListener("popstate", async () => { // hashchange
        if (disableHashChangeEvent) {
            return;
        }
        await dispatchOnChange();
    });

    var getID = function () {
        var id = getCurrentStateProperty(stateIDPropertyName);
        if (id === null) {
            return updateCurrentStateID();
        }
        return id;
    };

    var getPath = function () {
        return window.location.pathname;
    };

    var setPath = function (path) {
        if (path === null) {
            path = '';
        }
        window.history.replaceState(window.history.state, null, window.location.origin + path + window.location.search + window.location.hash);
    };

    var getQuery = function () {
        var query = window.location.search;
        return query !== '' ? query.substring(1) : '';
    };

    var getQueryParameter = function (name) {
        var nameToLowercase = name.toLowerCase();
        var parameters = getQuery().split('&');
        for (var i = 0; i < parameters.length; i++) {
            var parts = parameters[i].split('=');
            if (decodeURIComponent(parts[0].toLowerCase()) === nameToLowercase) {
                return decodeURIComponent(parts[1]);
            }
        }
        return null;
    };

    var setQuery = function (query) {
        if (query === null) {
            query = '';
        }
        window.history.replaceState(window.history.state, null, window.location.origin + window.location.pathname + (query.length > 0 ? '?' + query : '') + window.location.hash);
    };

    var setQueryParameter = function (name, value) {
        var nameToLowercase = name.toLowerCase();
        var parameters = getQuery().split('&');
        var newQueryParts = [];
        var foundInOldList = false;
        for (var i = 0; i < parameters.length; i++) {
            var parameter = parameters[i];
            var parts = parameter.split('=');
            if (decodeURIComponent(parts[0].toLowerCase()) === nameToLowercase) {
                if (value !== null) {
                    newQueryParts.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
                }
                foundInOldList = true;
            } else {
                newQueryParts.push(parameter);
            }
        }
        if (!foundInOldList) {
            newQueryParts.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
        }
        setQuery(newQueryParts.join('&'));
    };

    var deleteQueryParameter = function (name) {
        setQueryParameter(name, null);
    };

    var makeQuery = function (parameters) {
        var newQueryParts = [];
        for (var name of parameters) {
            newQueryParts.push(encodeURIComponent(name) + '=' + encodeURIComponent(parameters[name]));
        }
        return newQueryParts.join('&');
    };

    var getHash = function () {
        var hash = window.location.hash;
        return hash !== '' ? hash.substring(1) : '';
    };

    var setHash = function (hash) {
        if (hash === null) {
            hash = '';
        }
        window.history.replaceState(window.history.state, null, window.location.origin + window.location.pathname + window.location.search + (hash.length > 0 ? '#' + hash : ''));
    };

    var setData = function (name, value) {
        var data = getCurrentStateProperty(stateDataPropertyName);
        if (data === null) {
            data = {};
        }
        data[name] = value;
        setCurrentStateProperty(stateDataPropertyName, data);
    };

    var getData = function (name) {
        var data = getCurrentStateProperty(stateDataPropertyName);
        if (data !== null && typeof data[name] !== 'undefined') {
            return data[name];
        }
        return null;
    };

    var getAllData = function () {
        var data = getCurrentStateProperty(stateDataPropertyName);
        if (data !== null) {
            return data;
        }
        return {};
    };

    var goBack = function () {
        return new Promise(function (resolve, reject) {
            var handler = function () {
                resolve();
            };
            window.addEventListener('popstate', function () {
                window.removeEventListener('popstate', handler);
                handler();
            });
            window.history.back();
        });
    };

    var open = async function (path, query, hash, data, reload) {
        var hasChangedPathOrQuery = false;
        var hasChangedData = false;
        if (typeof path === 'undefined' || path === null) {
            path = getPath();
        } else {
            hasChangedPathOrQuery = path !== getPath();
        }
        if (typeof query === 'undefined' || query === null) {
            query = getQuery();
        } else {
            hasChangedPathOrQuery = query !== getQuery();
        }
        if (typeof hash === 'undefined' || hash === null) {
            hash = getHash();
        }
        if (typeof data === 'undefined' || data === null) {
            data = {};
        } else {
            hasChangedData = JSON.stringify(data) !== JSON.stringify(getAllData());
        }
        if (typeof reload === 'undefined') {
            reload = null;
        }
        var location = window.location.origin + path + (query.length > 0 ? '?' + query : '') + (hash.length > 0 ? '#' + hash : '');
        //console.log('open', path, query, hash, data, hasChangedPathOrQuery, hasChangedData, reload, location);
        if (window.location.toString() === location && (reload === null || reload === false) && !hasChangedData) {
            return false;
        }
        if ((hasChangedPathOrQuery && reload !== false) || reload === true) {
            disableHashChangeEvent = true;
            window.location.assign(location);
            if (!hasChangedPathOrQuery) {
                window.location.reload();
            }
        } else {
            window.history.pushState(null, '', location);
            for (var name in data) {
                setData(name, data[name]);
            }
            updateCurrentStateID();
            await dispatchOnChange();
        }
        return true;
    };

    var reload = function () {
        window.location.reload();
    };

    // var debugCurrentState = function () {
    //     console.log('DEBUG WINDOW NAVIGATION', {
    //         location: JSON.stringify([window.location.origin, window.location.pathname, window.location.search, window.location.hash]),
    //         id: getID(),
    //         path: getPath(),
    //         query: getQuery(),
    //         hash: getHash(),
    //         state: JSON.stringify(window.history.state)
    //     });
    // };
    // debugCurrentState();

    return {
        addChangeHandler: addChangeHandler,
        removeChangeHandler: removeChangeHandler,
        getID: getID,
        getPath: getPath,
        setPath: setPath,
        getQuery: getQuery,
        setQuery: setQuery,
        getQueryParameter: getQueryParameter,
        setQueryParameter: setQueryParameter,
        deleteQueryParameter: deleteQueryParameter,
        makeQuery: makeQuery,
        getHash: getHash,
        setHash: setHash,
        getData: getData,
        setData: setData,
        goBack: goBack,
        open: open,
        reload: reload
    }
}());