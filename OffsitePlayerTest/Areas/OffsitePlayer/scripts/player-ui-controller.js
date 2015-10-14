//responsable to setup in DOM sharing stuff like FB, TW. Also Episode stuff
'use strict';
mm.module('playerUI', function () {

    return function(episode) {

        function setEpisodeInfo(episode) {
            var episodeImage = mm.byId('host-image'),
                download = mm.byId('episode-download'),
                episodeAnchor = mm.byId('host-image-link'),
                episodeCategory = mm.byId('episode-category'),
                episodeHost = mm.byId('episode-host'),
                byHost = mm.byId('by-host'),
                episodeTitle = mm.byId('episode-title');
            episodeAnchor.href = episode.FullUrl;
            if (episode.Images && episode.Images.lenght > 0) {
                episodeImage.src = episode.ImagesUrl + episode.Images[0].Name;
            } else {
                episodeImage.src = episode.Host.FullImageUrl;
            }

            mm.text(episodeTitle, episode.Title);
            episodeTitle.href = episode.FullUrl;
            mm.text(episodeHost, episode.Host.DisplayName);
            episodeHost.href = episode.Host.FullUrl;
            episodeCategory.href = episode.Category.Url;
            mm.text(episodeCategory, episode.Category.Description.toUpperCase());
            mm.show(byHost);
            download.href = episode.fileName;
            mm.attr(download, 'download', episode.fileName);
        }

        function setSharingControls() {
            var btnShare = mm.byId('btn-share'),
                share = mm.byId('sharing'),
                btnCloseShare = mm.byId('close-sharing');
            mm.on(btnShare, 'click', function() {
                mm.toggleClass(share, 'open');
            });

            mm.on(btnCloseShare, 'click', function() {
                mm.removeClass(share, 'open');
            });
        }

        function setFacebookShare(episode) {
            var link = 'https://www.facebook.com/dialog/share?';
            link += '&app_id=72364733256';
            link += '&display=popup';
            link += '&href=' + episode.FullUrl;
            link += '&redirect_uri=' + episode.FullUrl;
            mm.byId('fb-link').href = link;
        }

        function setTwitterShare(episode) {
            var link = 'https://twitter.com/intent/tweet?';
            link += 'url=http://tobtr.com/' + episode.Id;
            link += '&text=I\'m listening to "' + episode.Title;
            link += '" by "' + episode.Host.DisplayName;
            mm.byId('tw-link').href = link;
        }

        function setGoogleShare(episode) {
            var link = 'https://plus.google.com/share?';
            link += 'url=http://blogtalkradio.com' + episode.FullUrl;
            mm.byId('ge-link').href = link;
        }

        //init
        setEpisodeInfo(episode);
        setSharingControls();
        setTwitterShare(episode);
        setGoogleShare(episode);
        setFacebookShare(episode);
        mm.byId('share-link').value = episode.shortLink;
        mm.byId('embed-code').value = episode.embedCode;
        mm.byId('mailto-link').href = 'mailto:?subject=Listen to this great podcast from ' + episode.host + '&body=' + episode.url;

    };

});