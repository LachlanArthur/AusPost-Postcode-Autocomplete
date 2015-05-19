# AusPost Postcode Autocomplete

Gives any text input an autocompleted list of Australian suburbs and postcodes using the Australia Post API.

## Usage

	jQuery('#location-search').ausPostAutocomplete({
		apiKey: 'XXX',
		yqlTable: 'http://example.com/url.headers.xml'
	}).on('typeahead:select', function() {
		// The usual typeahead events apply
		console.log($(this).data());
	});

Get an API key here: https://auspost.com.au/forms/pacpcs-registration.html

Requires jQuery and Twitter Typeahead Bundle (including Bloodhound and the jQuery plugin).

Uses a custom YQL table to add the API key header to the request. Upload the table to your site and point the `yqlTable` parameter to the URL.

Puts the selected item data into the jQuery data of the input. Get it with `jQuery(field).data()`.
List of data attributes:
- `location`
- `state`
- `postcode`
- `longitude`
- `latitude`

A `loading` class is added to the input when the query is executing, so you can apply some sort of visual change to indicate to the user that a request is being made.