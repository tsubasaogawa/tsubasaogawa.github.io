/*
* jQuery Flickr Photoset
* https://github.com/hadalin/jquery-flickr-photoset
*
* Copyright 2014, Primož Hadalin
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/MIT
*/

;(function ($, window, document, undefined) {

    'use strict';

    var pluginName = "flickr",
        defaults = {
            apiKey: "",
            photosetId: "",
            errorText: "Error generating gallery.",
            loadingSpeed: 38,
            photosLimit: 50
        },
        apiUrl = 'https://api.flickr.com/services/rest/',
        photos = [];

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = $(element);
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        this._hideSpinner = function() {
            this.element.find('.spinner-wrapper').hide().find('*').hide();
        };

        this._printError = function() {
            this.element.find('.gallery-container').append($("<div></div>", { "class": "col-lg-12 col-lg-offset-1" })
                .append($("<div></div>", { "class": "error-wrapper" })
                    .append($("<span></span>", { "class": "label label-danger error" })
                        .html(this.settings.errorText))));
        };

        this._flickrAnimate = function() {
            this.element.find('.gallery-container img').each($.proxy(function(index, el) {
                var image = el;
                setTimeout(function() {
                    $(image).parent().fadeIn();
                }, this.settings.loadingSpeed * index);
            }, this));
        };
        
        this._printGallery = function(photos) {
            var photoCount = 0;
            var element = this.element.find('.gallery-container');
            $.each(photos, function(key, photo) {
                photoCount++;
                var img = $('<img>', { 'class': 'thumb img-thumbnail img-responsive', src: photo.thumbnail });
                element
                    .append($('<div></div>', { 'class': 'mix category-1 col-lg-2 col-md-2 col-xs-6', 'data-photo': photoCount })// mix col-center' })
                    .append($('<a></a>', { 'class': '', href: photo.href, 'title': photo.title, 'data-gallery': ''})
                        .append(img)));
            });

            element.imagesLoaded()
                .done($.proxy(this._flickrAnimate, this))
                .always($.proxy(this._hideSpinner, this));
        };

        this._flickrPhotoset = function(photoset) {
            var _this = this;
            
            photos[photoset.id] = [];
            $.each(photoset.photo, function(key, photo) {
                // Limit number of photos.
                if(key >= _this.settings.photosLimit) {
                    return false;
                }
                photos[photoset.id][key] = {
                    thumbnail: 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_q.jpg',
                    href: 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_b.jpg',
					title: photo.title
                };
				
                $.ajax({
					dataType: "json",
					url: apiUrl + "?format=json&jsoncallback=?&method=flickr.photos.getExif&api_key=" + _this.settings.apiKey + "&photo_id=" + photo.id,
					context: _this,
					success: function(json) {
						var exif = json.photo.exif;
						var data = new Object();
						for(var i=0; i<exif.length; i++) {
							data[exif[i].tag] = exif[i].raw._content;
						}
                        $("a[href='"+photos[photoset.id][key]['href']+"']")
						.after('<p class="camera_info">'+data['LensModel']+', '
						+data['FocalLength']+' '
						+'('+data['FocalLengthIn35mmFormat']+'), '
						+data['ExposureTime']+' s, '
						+'F'+data['FNumber']+', '
						+'ISO'+data['ISO']+', '
						+'WB:'+data['WhiteBalance']+', '
						+data['ExposureCompensation']+' EV</p>');
					}
				});
            });
            this._printGallery(photos[photoset.id]);
        };

        this._onFlickrResponse = function(response) {
            if(response.stat === "ok") {
                 this._flickrPhotoset(response.photoset);
            }
            else {
                this._hideSpinner();
                this._printError();
            }
        };

        this._flickrRequest = function(method, data) {
            var url = apiUrl + "?format=json&jsoncallback=?&method=" + method + "&api_key=" + this.settings.apiKey;

            $.each(data, function(key, value) {
                url += "&" + key + "=" + value;
            });

            $.ajax({
                dataType: "json",
                url: url,
                context: this,
                success: this._onFlickrResponse
            });
        };

        this._flickrInit = function () {
            this._flickrRequest('flickr.photosets.getPhotos', {
                photoset_id: this.settings.photosetId
            });
        };

        // Init
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            this._flickrInit();
        }
    };

    // Wrapper
    $.fn[pluginName] = function (options) {
        this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });

        // Chain
        return this;
    };

})(jQuery, window, document);