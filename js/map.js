$(function() {
	
	var infowindow = null;
	var userCords;
	
	//Start geolocation
	
	if (navigator.geolocation) {  
	
		function error(err) {
			console.warn('ERROR(' + err.code + '): ' + err.message);
		}
		
		function success(pos){
			userCords = pos.coords;
			
		}
	
		// Get the user's current position
		navigator.geolocation.getCurrentPosition(success, error);
		} else {
			alert('Geolocation is not supported in your browser');
		}
	
	//End Geo location

	//map options
	var mapOptions = {
		zoom: 5,
		center: new google.maps.LatLng(50.34546, 5.383301),
		panControl: false,
		panControlOptions: {
			position: google.maps.ControlPosition.BOTTOM_LEFT
		},
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.LARGE,
			position: google.maps.ControlPosition.RIGHT_CENTER
		},
		scaleControl: false

	};
	
	//Adding infowindow option
	infowindow = new google.maps.InfoWindow({
		content: "holding..."
	});
	
	//Fire up Google maps and place inside the map-canvas div
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	//Grab form data
    $('#form').submit(function() { // bind function to submit event of form
		
		//Define and set meetup api key and url used in api request
		var API_KEY = "2d6974785d53707b6d1577717a762c33";
		var accessURL = "https://api.meetup.com/2/open_events?key=" + API_KEY + "&sign=true&photo-host=public&lat=" + userCords.latitude + "&category=34&lon=" + userCords.longitude + "&page=40&radius=25.0";

		// makes array of the lat and lon of the markers showing
		// creates a new viewpoint bound
		bounds = new google.maps.LatLngBounds();

		//Ajax request
		$.ajax({
			type: "GET",
			contentType: "application/json; charset=utf-8",
			url: accessURL,
			dataType: "jsonp",
			success: function(data){
				// loop over json data returned
				$.each(data.results, function(i, val){

					var venueObject = val.venue;
					if(venueObject && venueObject.lat !== 0){

						// google maps marker options
						var marker = new google.maps.Marker({
							position: {lat: val.venue.lat, lng: val.venue.lon},
							title: val.name,
							map: map,
							animation: google.maps.Animation.DROP
						});

						// builds content html to display in info w
						var contentString = "<div class='marker-description'>" +
												"<h2>" + val.venue.name + "</h2>" +
												"<h3>" + val.venue.address_1 + " <span>" + val.venue.city + "</span></h3>" +
												"<p>" + val.description + "</p>" +
												"<a href='" + val.event_url + "'target='_blank'>" + val.event_url + "</a>" +
											"</div>";

						// google maps info window setings
						var infowindow = new google.maps.InfoWindow({
							content: contentString
						});

						// on marker click, display content string
						marker.addListener('click', function(){
							infowindow.open(map, marker);
						});

						// adds lat and lon coords from each marker
						var loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
						// extends bounds of map seen on screen to the farest markers
						bounds.extend(loc);

					} else {
						return;
					}

				});

				// markers auto zoom - fit bounds to the map
				map.fitBounds(bounds);
				// auto center map	
				map.panToBounds(bounds);

			} // end of success function

		}); // end of ajax request

        return false; //Important: prevents the form from submitting

    }); // end of event listener

}); // end of outer functions
