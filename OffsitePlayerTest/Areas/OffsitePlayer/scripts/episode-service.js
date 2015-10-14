'use strict';
mm.module('epiosdeService', ['appConfig'], function(appConfig) {

    var apiUrl = (appConfig) ? appConfig.apiFullUrl : 'http://www.blogtalkradio.com/api';

    function EpisodeService() {}

    EpisodeService.prototype.getEpisodeInfo = function(hostId, episodeId, callback) {
        if (!mm.isFunction(callback)) {
            throw 'callback should be a function';
        }

        var url = apiUrl + '/hosts/' + hostId + '/episodes/' + episodeId + '/info';
        mm.getJSON(url, function(data) {
                data.fileName = data.FullUrl + '.mp3';
                data.embedCode = '<iframe width="100%" height="160" src="http://player.cinchcast.com/?platformId=1&assetType=single&assetId=' + data.id + '" frameborder="0"></iframe>';
                data.shortLink = 'http://tobtr.com/' + data.Id;
                callback(data);
            },
            function onError(err) {
                throw 'Failed request to get episode info. Error: ' + err;
            });
    };

    EpisodeService.prototype.nextEpisodeInfo = function (hostId, episodeId, callback) {
        if (!mm.isFunction(callback)) {
            throw 'callback should be a function';
        }

        var url = apiUrl + '/hosts/' + hostId + '/episodes/' + episodeId + '/next';
        mm.getJSON(url, function (data) {
            data.fileName = data.FullUrl + '.mp3';
            data.embedCode = '<iframe width="100%" height="160" src="http://player.cinchcast.com/?platformId=1&assetType=single&assetId=' + data.id + '" frameborder="0"></iframe>';
            data.shortLink = 'http://tobtr.com/' + data.Id;
            callback(data);
        },
        function onError(err) {
                throw 'Failed request to get next episode info. Error: ' + err;
        });

    };

    return new EpisodeService();
});