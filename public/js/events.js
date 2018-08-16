var smart = FHIR.client({
	serviceUrl: 'https://r3.smarthealthit.org',
	patientId: 'smart-1137192'
});

//patient search
$('#form-patientsearch').on('submit', function(e){
	e.preventDefault();
	var formData = $(this).serializeArray();
	var searchType = formData[0]['value'];
	var patientIdentifier = formData[1]['value'];

	var queryObject = {};
	queryObject[searchType] = patientIdentifier;

	smart.api.search({type: "Patient", query: queryObject})
	.done(function(data){
		$('#search-results ul').html('');

		try{
			data.data.entry.forEach(function(result){
				var resultName = result.resource.name[0];
				$('#search-results ul').append("<li><a data-id='"+ result.resource.id +"' href='#'>" + (resultName.prefix||'') + ' ' + resultName.given + ' ' + resultName.family + "</a></li>");
			});
		}
		catch(e){
			$('#search-results ul').append("<li>No "+ ((searchType=='name')? "name":"ID") +" matches for "+ patientIdentifier +"!</li>");
		}
	});
})

//shows allergies and conditions on patient-result click
$('#search-results').on('click', 'li a', function(e){
	e.preventDefault();

	var that = $(this);
	var patientId = that[0].dataset.id;

	smart.api.search({type: "AllergyIntolerance", query: {patient: patientId}})
	.done(function(data){
		//remove pre-existing allergies. perhaps employ caching to prevent unnecessary repeat requests
		$('.allergies').remove();

		//create ul list element, add li foreach allergy, then finally apend
		var list = $('<ul class="allergies patient-'+ patientId +'"></ul>');
		try{
			data.data.entry.forEach(function(allergy){
				list.append('<li>'+ allergy.resource.code.coding[0].display +'</li>');				
			});
		}
		catch(e){
			list.append('<li>No known allergies</li>');
		}
		that.after(list);
	});

	smart.api.search({type: "Condition", query: {subject: patientId}})
	.done(function(data){
		//remove pre-existing allergies. perhaps employ caching to prevent unnecessary repeat requests
		$('.conditions').remove();

		//create ul list element, add li foreach condition, then finally apend
		var list = $('<ul class="conditions patient-'+ patientId +'"></ul>');
		try{
			data.data.entry.forEach(function(condition){
				list.append('<li>'+ condition.resource.code.coding[0].display +'</li>');				
			});
		}
		catch(e){
			list.append('<li>No known conditions</li>');
		}
		that.after(list);
	});
})

FHIR.oauth2.ready(function(smart){
	console.log('worked!', smart);
});