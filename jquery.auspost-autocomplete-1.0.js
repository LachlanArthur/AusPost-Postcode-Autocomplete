jQuery.fn.ausPostAutocomplete = function(args) {
	
	var searchBox = this;
	var classes = {
		loading: 'loading'
	};
	
	var defaults = {
		apiKey: '',
		yqlTable: ''
	};
	
	var args = $.extend({}, defaults, args);
	
	function locationTokenizer(datum) {
		var locationTokens = Bloodhound.tokenizers.whitespace(datum.location);
		var postcodeTokens = Bloodhound.tokenizers.whitespace(datum.postcode);
		return locationTokens.concat(postcodeTokens);
	}
	
	var locationSource = new Bloodhound({
		datumTokenizer: locationTokenizer,
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		remote: {
			url: (function() {
				
				var ausPostURL  = 'https://auspost.com.au/api/postcode/search.json';
				var ausPostData = {
					q: 'QUERY',
				//	state: 'QLD', // Possibly in a future version
					excludePostBoxFlag: true
				};
				
				var ausPostHeaders = {
					'AUTH-KEY': args.apiKey
				};
				
				var remoteURL = ausPostURL + '?' + $.param(ausPostData);
				
				var yqlData = {
					q: [
						'use "' + args.yqlTable + '" as url.headers;',
						'select * from url.headers',
						'where url = "' + remoteURL + '"',
						'and headers = "' + $.param(ausPostHeaders) + '"'
					].join(' '),
					format: 'json'
				};
				return 'https://query.yahooapis.com/v1/public/yql?' + $.param(yqlData) + '&callback=?';
				
			})(),
			wildcard: 'QUERY',
			transform: function(data) {
				if (data.query.results && data.query.results.localities) {
					var list = data.query.results.localities.locality;
					if (!list.length) {
						list = [list];
					}
					return $.map(list, function(locality) {
						locality.location = locality.location.toLowerCase();
						if (typeof locality.latitude == 'undefined') {
							return null; // This item has no lat/lng, so it is of no use, remove it.
						}
						return locality;
					});
				} else {
					return [];
				}
			},
			replace: function(url, query) {
				// Need to double encode for YQL query
				return url.replace('QUERY', encodeURIComponent(encodeURIComponent(query)));
			},
			dupDetector: function(remoteMatch, localMatch) {
			    return remoteMatch.id === localMatch.id;
			}
		}
	});
	
	$(searchBox).typeahead({
		minLength: 3
	}, {
		name: 'auspost-locations',
		display: 'location',
		templates: {
			notFound: function(data) {
				return '<div><strong>' + data.query + '</strong> was not found.</div>';
			},
			suggestion: function(data) {
				return '<div><strong>' + data.location + '</strong>, ' + data.state + ' ' + data.postcode + '</div>';
			}
		},
		source: locationSource
	}).on({
		'typeahead:asyncrequest': function() {
			$(searchBox).addClass(classes.loading);
		},
		'typeahead:asynccancel': function() {
			$(searchBox).removeClass(classes.loading);
		},
		'typeahead:asyncreceive': function() {
			$(searchBox).removeClass(classes.loading);
		},
		'typeahead:select': function(e, obj) {
			$(searchBox).data({
				location:  obj.location,
				state:     obj.state,
				postcode:  obj.postcode,
				longitude: obj.longitude,
				latitude:  obj.latitude
			});
		}
	});
	
	return this;
}