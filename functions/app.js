//import { isUndefined } from 'util';

'use strict';

const apiai = require('apiai');
const config = require('./config');
const express = require('express');
const crypto = require('crypto');
const moments = require('moments');
const bodyParser = require('body-parser');
const request = require('request');
const weatherService = require('./weather-service');
const knowsupplier1 = require('./working-xml-post-ics');
const app = express();
const uuid = require('uuid');
const getlocation = require('./getlocation');
const getusername1 = require('./getusername1');
//var NodeGeocoder = require('node-geocoder');
var Nominatim = require('node-nominatim2')
var userId1;
var first_name;
var full_name;
var last_name;
var state1;
var state2;
var state3;
var g;
var currentTimeZone;
var oldsender;

// Messenger API parameters
if (!config.FB_PAGE_TOKEN) {
	throw new Error('missing FB_PAGE_TOKEN');
}
if (!config.FB_VERIFY_TOKEN) {
	throw new Error('missing FB_VERIFY_TOKEN');
}
if (!config.API_AI_CLIENT_ACCESS_TOKEN) {
	throw new Error('missing API_AI_CLIENT_ACCESS_TOKEN');
}
if (!config.WEATHER_API_KEY) { //weather api key
	throw new Error('missing WEATHER_API_KEY');
}
if (!config.ADMIN_ID) { //weather api key
    throw new Error('missing ADMIN_ID');
}
if (!config.FB_APP_SECRET) {
	throw new Error('missing FB_APP_SECRET');
}
if (!config.SERVER_URL) { //used for ink to static files
	throw new Error('missing SERVER_URL');
}

console.log('Hello')

app.set('port', (process.env.PORT || 5000))

//verify request came from facebook
app.use(bodyParser.json({
	verify: verifyRequestSignature
}));

//serve static files in the public directory
app.use(express.static('public'));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}))

// Process application/json
app.use(bodyParser.json())

const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
	language: "en",
	requestSource: "fb"
});
const sessionIds = new Map();

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot')
	console.log("c1-request");
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	console.log("c2-request");
	if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error("c3-Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);
	}
})

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook/', function (req, res) {
	var data = req.body;
	console.log("c4-JSON.stringify(data)");
	console.log("c5-" + JSON.stringify(data));

	userId1 = data.entry[0].id;
	//first_name = getusername(userId1);
	//console.log("userId1-"+userId1);


	// Make sure this is a page subscription
	if (data.object == 'page') {
		// Iterate over each entry
		// There may be multiple if batched
		data.entry.forEach(function (pageEntry) {
			var pageID = pageEntry.id;
			var timeOfEvent = pageEntry.time;

			// Iterate over each messaging event
			console.log('pageEntry.messaging.forEach(function (messagingEvent) {');
			pageEntry.messaging.forEach(function (messagingEvent) {
				userId1 = messagingEvent.sender.id;
				console.log('messagingEvent------------'+JSON.stringify(messagingEvent));
				const m = new Date().getHours();
				currentTimeZone = m+5.5;
				
				getGreetingTime (currentTimeZone);
				if (oldsender != userId1)
				{
				getusername(userId1) 
				}
				//getusername1(function(userResponse){
				//	if (!userResponse) {
				//		console.log('No Name for the user %s',userId2);
				//	} else {
				//		console.log('Name for the user %s'+JSON.stringify(userResponse))
						//let reply = `${responseText} ${locationResponse}`;
						//fbService.sendTextMessage(senderID, reply);
					//}
				//}, userId1);
				//first_name = getusername(userId1);
				//console.log("first_name-------------" + first_name);

				if (messagingEvent.optin) {
					console.log("messagingEvent.optin-%s" + messagingEvent.optin);
					receivedAuthentication(messagingEvent);
				} else if (messagingEvent.message) {
					console.log("messagingEvent.message-%s" + messagingEvent.message);
					receivedMessage(messagingEvent);
				} else if (messagingEvent.delivery) {
					console.log("messagingEvent.delivery-%s" + messagingEvent.delivery);
					receivedDeliveryConfirmation(messagingEvent);
				} else if (messagingEvent.postback) {
					console.log("messagingEvent.postback-%s" + messagingEvent.postback);
					receivedPostback(messagingEvent);
				} else if (messagingEvent.read) {
					console.log("messagingEvent.read-%s" + messagingEvent.read);
					receivedMessageRead(messagingEvent);
				} else if (messagingEvent.account_linking) {
					console.log("messagingEvent.account_linking-%s" + messagingEvent.account_linking);
					receivedAccountLink(messagingEvent);
				} else {
					console.log("c6-Webhook received unknown messagingEvent: ", messagingEvent);
				}
			});
		});

		// Assume all went well.
		// You must send back a 200, within 20 seconds
		res.sendStatus(200);
	}
});

function getusername(userId2) {
	console.log("userId1=%s", userId2);
	request({
		uri: 'https://graph.facebook.com/v3.0/' + userId2,
		qs: {
			access_token: config.FB_PAGE_TOKEN
		}

	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {

			var user = JSON.parse(body);

			console.log(" JSON.parse(body)====" + JSON.parse(body));

			if (user.first_name) {
				console.log("c12-FB user: %s %s %s, %s %s %s, %s",
					userId2, user.first_name, user.last_name, user.gender, user.address, user.age_range, user.birthday,
					user.hometown);

				    console.log("c12-FB user: %s %s %s, %s %s %s, %s",
					userId2, user.email, user.verified, user.timezone, user.location, user.birthday);

					full_name = user.first_name + ' ' + user.last_name;
					first_name = user.first_name;

					//get greeting
					const m = new Date().getHours();
					console.log('getHours-%s',m);
					const n = new Date();

					console.log('current_date-%s',n);
					currentTimeZone = m+user.timezone;
					console.log("currentTimeZone"+currentTimeZone);

			} else {
				console.log("c13-Cannot get data for fb user with id",
					userId2);
				return;
			}
		} else {
			console.error(response.error);
		}
	})
};



function receivedMessage(event) {

	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	if (!sessionIds.has(senderID)) {
		sessionIds.set(senderID, uuid.v1());
	}
	console.log("c7-Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
	console.log("c8-" + JSON.stringify(message));

	var isEcho = message.is_echo;
	var messageId = message.mid;
	var appId = message.app_id;
	var metadata = message.metadata;

	// You may get a text or attachment but not both
	var messageText = message.text;
	var messageAttachments = message.attachments;
	var quickReply = message.quick_reply;

	if (isEcho) {
		console.log("c31-" + "handleEcho");
		handleEcho(messageId, appId, metadata);
		return;
	} else if (quickReply) {
		console.log("c32-" + "handleQuickReply");
		handleQuickReply(senderID, quickReply, messageId);
		return;
	}

	console.log("messageText-%s", messageText);
	console.log("messageAttachments-%s", messageAttachments);
	if (messageText) {
		console.log("c33-" + "sendToApiAi");
		//send message to api.ai
		sendToApiAi(senderID, messageText);
	} else if (messageAttachments) {
		console.log("c33-" + "handleMessageAttachments");
		handleMessageAttachments(messageAttachments, senderID);
	}
}


function handleMessageAttachments(messageAttachments, senderID) {
	//for now just reply
	sendTextMessage(senderID, "Attachment received. Thank you.");
	console.log("messageAttachments:" + JSON.stringify(messageAttachments));

	var lat=28.5301225;
	var lon=77.2084097;

	//"https://nominatim.openstreetmap.org/reverse?format=xml&lat=28.5301225&lon=77.2084097&zoom=18&addressdetails=1"

	getlocation(function(locationResponse){
		if (!locationResponse) {
			sendTextMessage(senderID,
				`No location available for lat-%s and lon%s`,lat,lon);
		} else {
			let reply = `${responseText} ${locationResponse}`;
			fbService.sendTextMessage(senderID, reply);
		}
	}, lat,lon);
	
	/*var GoogleLocations = require('google-locations');
 
	var locations = new GoogleLocations('AIzaSyBFAApwYlGntwMFUizwdgPkuRaINOYYTR8');
 
	locations.search
	(
		{
			keyword: 'Google', location: [37.42291810, -122.08542120]
		}, function(err, response) 
			{  
				console.log("search: %s", JSON.stringify(response.results));
			}
	);*/

	/*var NodeGeocoder = require('node-geocoder');

	console.log(typeof(NodeGeocoder));

	var options = {
	provider: 'google',
	httpAdapter: 'https', // Default
	apiKey: 'AIzaSyBFAApwYlGntwMFUizwdgPkuRaINOYYTR8', // for Mapquest, OpenCage, Google Premier
	formatter: 'json' // 'gpx', 'string', ...
	};

	var geocoder = new NodeGeocoder(options);

	geocoder.reverse
	(
		{lat:28.5967439, lon:77.3285038}, function(err, res) 
		{
		console.log("res----------"+res);
		console.log("err----------"+err);
		}
	);*/

	/*for(i=100; i<messageAttachments.message.attachments.length; i++)
   
{    
   console.log("Attachment inside: " + JSON.stringify(messageAttachments.message.attachments[i]));     
        
                          var text =             messageAttachments.message.attachments[i].payload.url;

                          //If no URL, then it is a location

                          if(text == undefined || text == "")

                         {
                            text =  "latitude:"
                                      +messageAttachments.message.attachments [i].payload.coordinates.lat
                                      +",longitude:"
                                   +messageAttachments.message.attachments[i].payload.coordinates.long;

						  }
						  sendTextMessage(senderID, "Latitude and Longitude is."+text);
						}*/
		  

}

function handleQuickReply(senderID, quickReply, messageId) {
	var quickReplyPayload = quickReply.payload;
	console.log("c9-Quick reply for message %s with payload %s", messageId, quickReplyPayload);
	//send payload to api.ai
	sendToApiAi(senderID, quickReplyPayload);
}

//https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-echo
function handleEcho(messageId, appId, metadata) {
	// Just logging message echoes to console
	console.log("c10-Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
}

function getGreetingTime (m) {
	g = null; //return g
	
	if(!m || !isDefined(m)) { return; } //if we can't find a valid or filled moment, we return.
	
	var split_afternoon = 12 //24hr time to split the afternoon
	var split_evening = 16 //24hr time to split the evening
	var currentHour = parseFloat(m);

	console.log('currentHour------%s',currentHour)
	
	if(currentHour >= split_afternoon && currentHour <= split_evening) {
		g = "afternoon";
	} else if(currentHour >= split_evening) {
		g = "evening";
	} else {
		g = "morning";
	}
	console.log('g------%s',g)
	return g;
}

function handleApiAiAction(sender, action, responseText, contexts, parameters,resolvedQuery) 
{
	console.log("handleApiAiAction - responseText - %s",JSON.stringify(responseText));
	switch (action) {
		case "suppfaq-compinfo.suppfaq-compinfo-custom":
			console.log('case "suppfaq-compinfo.suppfaq-compinfo-custom":')
			let comment = contexts[0].parameters['comment'];
			let email = contexts[0].parameters['email'];
			if (comment != '' && email != '') {
				sendEmail('Vendor Feedback for American Slice', email, 'schubhm@gmail.com', comment);

				sendTextMessage(sender, "");
				let replies = [
					{
						"content_type": "text",
						"title": "Start all over",
						"payload": "Start all over"
					},
				];
				sendQuickReply(sender, "Your comment/feedback is recorded, we will contact you soon regarding this...", replies);
				console.log('in else of isDefined(action) && action==buyerstartevaluation');
			}
			else if (comment == '' && email == '') {
				sendTextMessage(sender, 'What is your question, comment or request? Please be as detailed as possible.')
			}
			else {
				sendTextMessage(sender, "Please tell your emailID");
			}
			break;

		case "suppfaq-compinfo.suppfaq-compinfo-custom-2":
			console.log('case "suppfaq-compinfo.suppfaq-compinfo-custom-2":%s',JSON.stringify(contexts[0]))
			console.log("context-%s,contexts[0].name-%s,contexts[0].parameters-%s,contexts[0].parameters['timeofdel'] - %s",
				contexts[0], contexts[0].name, contexts[0].parameters, contexts[0].parameters['timeofdel']);
			if (isDefined(contexts[0]) //&&
				//(contexts[0].name == 'suppfaq-compinfo-vendor')
				&& contexts[0].parameters) {

				let timeofdel = (isDefined(contexts[0].parameters['timeofdel'])
					&& contexts[0].parameters['timeofdel'] != '') ? contexts[0].parameters['timeofdel'] : '';
				let preferredcoast = (isDefined(contexts[0].parameters['preferredcoast'])
					&& contexts[0].parameters['preferredcoast'] != '') ? contexts[0].parameters['preferredcoast'] : '';
				let preferredstate = (isDefined(contexts[0].parameters['preferredstate'])
					&& contexts[0].parameters['preferredstate'] != '') ? contexts[0].parameters['preferredstate'] : '';
				let name = (isDefined(contexts[0].parameters['name'])
					&& contexts[0].parameters['name'] != '') ? contexts[0].parameters['name'] : '';
				let pricenegotiation = (isDefined(contexts[0].parameters['pricenegotiation'])
					&& contexts[0].parameters['pricenegotiation'] != '') ? contexts[0].parameters['pricenegotiation'] : '';
				let emailsupp = (isDefined(contexts[0].parameters['email'])
					&& contexts[0].parameters['email'] != '') ? contexts[0].parameters['email'] : '';
				let carrier = (isDefined(contexts[0].parameters['carrier'])
					&& contexts[0].parameters['carrier'] != '') ? contexts[0].parameters['carrier'] : '';
					if (carrier == '' && timeofdel == '' && preferredcoast == '' && preferredstate == '' && name == '' && pricenegotiation == '') {
						setTimeout(function() {
							sendTextMessage(sender,"Can you please tell your company's name");
						}, 1000)
					}
				
				if (carrier == '' && timeofdel == '' && preferredcoast == '' && preferredstate == '' && name != '' && pricenegotiation == '') {
					console.log("1-In if (timeofdel == '' preferredcoast == '' && preferredstate == '' && name!= '' && pricenegotiation == ")
					let replies = [
						{
							"content_type": "text",
							"title": "East Coast",
							"payload": "East Coast"
						},
						{
							"content_type": "text",
							"title": "West Coast",
							"payload": "West Coast"
						}
					];
					sendTextMessage(sender,"Welcome "+name+" We are happy to inform you that we currently serve the East and West Coast of the US.");
					setTimeout(function() {
						sendQuickReply(sender, "You may please choose your preferred delivery location from the following", replies);
					}, 1000)
					
				}

				else if (carrier == '' && timeofdel == '' && preferredcoast != '' && preferredstate == '' && name != '' && pricenegotiation == '') {

					console.log("2-if (timeofdel == '' && preferredstate = '' && name != '' && pricenegotiation == ")
					if (preferredcoast == 'East Coast') {
						var statemsg = "Wow!, I still love one thing about the east coast, it is the seafood, so where in the east coast do you prefer to deliver?";
						state1 = 'New York';
						state2 = 'Virginia';
						state3 = 'North Carolina';
					}
					else if (preferredcoast == 'West Coast') {
						var statemsg = "Wow!, I have heard that the weather is damn near perfect in the west coast, so where in the west coast do you prefer to deliver?";
						state1 = 'San Francisco';
						state2 = 'Oregon';
						state3 = 'Washington';
					}
					else {
						sendTextMessage(sender, "Wrong value selected for coast")
					}
					let replies = [
						{
							"content_type": "text",
							"title": state1,
							"payload": state1
						},
						{
							"content_type": "text",
							"title": state2,
							"payload": state2
						},
						{
							"content_type": "text",
							"title": state3,
							"payload": state3
						}
					];
					//sendQuickReply(sender, responseText, replies);
					sendQuickReply(sender, statemsg, replies);
				}
				else if (carrier == '' && timeofdel == '' && preferredcoast != '' && preferredstate != '' && name != '' && pricenegotiation == '') {
					console.log("3-if (timeofdel == '' && preferredcoast != '' && preferredstate != '' && name != '' && pricenegotiation == ")
					console.log('preferredstate,%s',preferredstate);
					
					let replies = [
						{
							"content_type": "text",
							"title": "Less than 2 Hrs",
							"payload": "< 30 mins"
						},
						{
							"content_type": "text",
							"title": "4 to 6 Hrs",
							"payload": "> 1 hr"
						},
						{
							"content_type": "text",
							"title": "More than 6 hrs",
							"payload": "> 2 hr"
						}

					];			

					var weather = "Bad";

						weatherService(function(weatherResponse){
							if (!weatherResponse) {
								sendTextMessage(sender,
									"No weather forecast available for "+preferredstate);
								console.log("In if (!weatherResponse) {")
							} 
							else {
								//let reply = `${responseText} ${weatherResponse}`;
								weather = `${weatherResponse}`;
								//console.log("493"+JSON.stringify(reply));;
								console.log("In Else of (!weatherResponse) {"+weather)
							}		
						}, preferredstate)
							;
		
						//let reply = {responseText};
						//console.log("499"+JSON.stringify(reply));

						setTimeout(() => {
							sendQuickReply(sender, "Well "+ first_name+", the weather report in "+preferredstate+" says, it is "+ weather+" there. "+ responseText, replies);
						}, 3000); 	}

				else if (carrier == '' && timeofdel != '' && preferredcoast != '' && preferredstate != '' && name != '' && pricenegotiation == '') {
					console.log("4-if (carrier == '' && timeofdel != '' && preferredcoast != '' && preferredstate != '' && name != '' && pricenegotiation == ")

					let replies = [
						{
							"content_type": "text",
							"title": "Yes",
							"payload": "Yes"
						},
						{
							"content_type": "text",
							"title": "No",
							"payload": "No"
						}
					];
					sendQuickReply(sender, responseText, replies);
				}
				else if (carrier != '' && timeofdel != '' && preferredcoast != '' && preferredstate != '' && name != '' && pricenegotiation == '') {
					console.log("4-if (timeofdel != '' && preferredcoast != '' && preferredstate != '' && name != '' && pricenegotiation == ")

					let replies = [
						{
							"content_type": "text",
							"title": "Easy",
							"payload": "Easy"
						},
						{
							"content_type": "text",
							"title": "Moderate",
							"payload": "Moderate"
						},
						{
							"content_type": "text",
							"title": "Rigid",
							"payload": "Rigid"
						}
					];
					sendQuickReply(sender, responseText, replies);
				}
				else if (emailsupp =='' && timeofdel != '' && preferredcoast != '' && preferredstate != '' && name != '' && pricenegotiation != '') {
					console.log("EVALUATE Supplier - %s", emailsupp)
						sendTextMessage(sender, responseText);
				}
				else if (emailsupp !='' && timeofdel != '' && preferredcoast != '' && preferredstate != '' && name != '' && pricenegotiation != '') {
					console.log("EVALUATE Supplier - %s", emailsupp)
					if ((timeofdel == "> 1 hr" || timeofdel == "< 30 mins") && (pricenegotiation=="Easy" || pricenegotiation == "Moderate"))
						{
							let emailContent =
					        'Supplier Evaluation is Complete for '+name+' Please follow the link - https://eevx-test.fa.em3.oraclecloud.com/fscmUI/faces/PrcPosRegisterSupplier?prcBuId=300000028460360 to fill further details, thank you.';
							//sendTextMessage(sender, "You have passed the initial screening, an email is sent to you with a link where you shall complete the registration. fill further details and let me know once you have registered successfully.");
							sendEmail('Supplier Registration Complete for'+name, 'vickey@americanslice.com', emailsupp, emailContent);
						
							let replies = [
								{
									"content_type": "text",
									"title": "Start all over",
									"payload": "Start all over"
								},
								{
									"content_type": "text",
									"title": "Quit Chat",
									"payload": "Quit Chat"
								}
							];
							//sendQuickReply(sender, "Great! Thanks for your time and patience. You have passed the initial screening, an email is sent to you with a link where you shall complete the registration. Please fill further details for getting registered with us as our Vendor.", replies);
						
							setTimeout(function() {
								let buttons = [
									{
										type:"web_url",
										url:"https://eevx-test.fa.em3.oraclecloud.com/fscmUI/faces/PrcPosRegisterSupplier?prcBuId=300000028460360",
										title:"Supplier Registration link"
									},
									{
										type:"postback",
										title:"Start all over",
										payload:"STARTALLOVER"
									}
									,
									{
										type:"web_url",
										url:"https://www.linkedin.com/in/schubhm/",
										title:"Know my creator"
									}
								];
				
								sendButtonMessage(sender, "Great! Thanks for your time and patience. You have passed the initial screening, an email is sent to you with a link where you shall complete the registration. Please fill further details for getting registered with us as our Vendor.", buttons);
							}, 3000)
						
						}
					else
					{
						let replies = [
							{
								"content_type": "text",
								"title": "Start all over",
								"payload": "STARTALLOVER"
							},
							{
								"content_type": "text",
								"title": "Quit Chat",
								"payload": "QUITCHAT"
							}
						];
						//sendQuickReply(sender, "I am Sorry "+first_name+", As per the evaluation of your response, You did not clear the initial screening of the registration process, Thank You for your time and patience", replies);
					
						setTimeout(function() {
							let buttons = [
																/*{
									type:"phone_number",
									title:"Call us",
									payload:"+16505551234",
								},*/
								{
									type:"postback",
									title:"Start all over",
									payload:"STARTALLOVER"
								}
								,
								{
									type:"postback",
									title:"Quit Chat",
									payload:"QUITCHAT"
								},
								{
									type:"web_url",
									url:"https://www.linkedin.com/in/schubhm/",
									title:"Know my creator"
								}
							];
			
							sendButtonMessage(sender, "I am Sorry "+first_name+", As per the evaluation of your response, You did not clear the initial screening of the registration process, Thank You for your time and patience", buttons);
						}, 3000)
					
					}
				}
				else {
					console.log('in Else')
					sendTextMessage(sender, responseText);
				}
			}
			break;
		case "input.welcome":
			console.log('input.welcome, userId = %s', sender);
			//full_name=null;
			//setTimeout(handleMessage.bind(null, null, sender), 1100);
			getusername(sender);
			setTimeout(getusername, 3000);
			console.log('full_name----%s', full_name);
			if (isDefined(full_name)) {
				
				if ((full_name == "Aditya Punjabi") || (full_name == "Schubhm Pandey") || (full_name == "Shubham Pandey")) {
					//first_name = '';
					if (resolvedQuery == "Great")
					{
						let replies = [
							{
								"content_type": "text",
								"title": "Supplier Evaluation",
								"payload": "Supplier Evaluation"
							}, {
								"content_type": "text",
								"title": "Know Supplier",
								"payload": "Query Supplier"
							}, {
								"content_type": "text",
								"title": "RFQ",
								"payload": "RFQ"
							}
						];
						sendQuickReply(sender, " Good to Know that , "+first_name+" , this is Lawson your assistant, how should I help you today?", replies)
					}
					else if (resolvedQuery=="Not Bad")					{
						let replies = [
							{
								"content_type": "text",
								"title": "Supplier Evaluation",
								"payload": "Supplier Evaluation"
							}, {
								"content_type": "text",
								"title": "Know Supplier",
								"payload": "Query Supplier"
							}, {
								"content_type": "text",
								"title": "RFQ",
								"payload": "RFQ"
							}, {
								"content_type": "text",
								"title": "Quit Chat",
								"payload": "Quit Chat"
							}
						];
						//sendQuickReply(sender, responseText, replies)
						sendQuickReply(sender, " Don’t worry, "+first_name+" , I am sure your day will be great. So how should I help you today?", replies);
					}
					else 
					{
						console.log("123456")
						let replies = [
						{
							"content_type": "text",
							"title": "Supplier Evaluation",
							"payload": "Supplier Evaluation"
						}, {
							"content_type": "text",
							"title": "Know Supplier",
							"payload": "Query Supplier"
						}, {
							"content_type": "text",
							"title": "RFQ",
							"payload": "RFQ"
						}
					]
					//sendQuickReply(sender, responseText, replies)
					
					sendQuickReply(sender, "Good "+g+", Lawson is at your service, how should I help you?", replies)
					}
				} 
				else {
					let replies = [
						{
							"content_type": "text",
							"title": "Know Us",
							"payload": "Know about American Slice"
						},
						{
							"content_type": "text",
							"title": "Become a Vendor",
							"payload": "Become a Vendor"
						},
						 {
							"content_type": "text",
							"title": "Send Quotation",
							"payload": "Send Quotation"
						}, 
						{
							"content_type": "text",
							"title": "Quit Chat",
							"payload": "Quit Chat"						}
					];
					if (resolvedQuery == "Great")
					{
						sendQuickReply(sender, "  Good to Know, "+first_name+" , this is Vickey from American Slice, What would you like to do?", replies)
					}
					else if (resolvedQuery == "Not Bad"){
					sendQuickReply(sender, " Don't worry, "+first_name+" , You will have a good day ahead, this is Vickey from American Slice, What would you like to do?", replies)
					}
					else {
						sendQuickReply(sender, "Good "+g+", Vickey from American Slice is at your service, What would you like to do?", replies)
						}
				}
				
				full_name = '';
			}
			else 
			{
				//const m = new Date().getHours();
				//currentTimeZone = m+5.5;
				//getGreetingTime (currentTimeZone);
				console.log("currentTimeZone"+currentTimeZone);
						let replies = [
					{
						"content_type": "text",
						"title": "Great :)",
						"payload": "Great"
					}, {
						"content_type": "text",
						"title": "Not Bad",
						"payload": "Not Bad"
					}
				];
			sendQuickReply(sender, "Good "+g+" , How are you doing today?", replies)
			}
			break;

			case "quitchat":
			console.log("contexts[0].parameters['feedback']"+contexts[0].parameters['feedback'])
			console.log("quitchatquitchatquitchatquitchat");
			if (!isDefined(contexts[0].parameters['feedback']) || contexts[0].parameters['feedback']==''){
			//sendTextMessage(sender,"Thank You "+first_name+ " for your time and patience.");
			//setTimeout(getusername, 3000);
			let replies1 = [
			{
				"content_type": "text",
				"title": "Excellent",
				"payload": "Excellent"
			},
			{
				"content_type": "text",
				"title": "Good",
				"payload": "Good"
			},
			{
				"content_type": "text",
				"title": "Satisfactory",
				"payload": "Satisfactory"
			},
			{
				"content_type": "text",
				"title": "Need Improvement",
				"payload": "Need Improvement"
			},
		];
		sendQuickReply(sender, "Thank You "+first_name+ " for your time and patience. I would appreciate if you can provide a quick feedback on my conversation today.", replies1);
			}
			else if(isDefined(contexts[0].parameters['feedback']) && contexts[0].parameters['feedback']=='Need Improvement')
			{
				sendTextMessage(sender, "Thank You "+first_name+ " for your feedback, You can email us at youritdesk@amerslice.com, In case you want to provide a detailed feedback");		
			}
			else if(isDefined(contexts[0].parameters['feedback']) && (contexts[0].parameters['feedback']=='Good'||contexts[0].parameters['feedback']=='Excellent'||contexts[0].parameters['feedback']=='Satisfactory'))
			{
				sendTextMessage(sender, "Thank You "+first_name+ " for your good feedback, I will be happy to help you in future");
			}
			else 
			{
				sendTextMessage(sender, "Thank You "+first_name+ " for your feedback, Though that was not available in the options, But anyways I have recorded it and will be happy to help you in future");
			}
			break;

		case "knowsupplier":
		//console.log("contexts[0].parameters['suppliername']"+contexts[0].parameters['suppliername'])
		console.log("knowsupplier");
		var suppresp;
		if (isDefined(contexts[0].parameters['suppliername']) || contexts[0].parameters['suppliername']!=''){
			console.log("Calling function knowsupplier");
			/*knowsupplier1(function(knowsupplierresp){
				if (!knowsupplierresp) {
					console.log("In if (!knowsupplierresp) {")
				} 
				else {
					console.log("In Else of (!knowsupplierresp)");
					sendTextMessage(sender, "The Supplier details for "+contexts[0].parameters['suppliername']+" are"+knowsupplier);					
				}		
			}, contexts[0].parameters['suppliername'])
				;*/
			
			knowsupplier1(function(knowsupplierresp){
				if (!knowsupplierresp) {
					console.log("In if (!knowsupplierresp) {")
				} 
				else {
					suppresp = knowsupplierresp;
					console.log("In Else of (!knowsupplierresp)");
                    let replies = [
						{
							"content_type": "text",
							"title": "Start all over",
							"payload": "Start all over"
						},
						{
							"content_type": "text",
							"title": "Know Supplier",
							"payload": "Know Supplier"
						},
						{
							"content_type": "text",
							"title": "Not Right Now",
							"payload": "Not Right Now"
						}
					];
					console.log('in else of isDefined(action) && action==buyerstartevaluation');
					sendQuickReply(sender, suppresp + "What would you want to do next?", replies);
					
					console.log("The Supplier details for "+contexts[0].parameters['suppliername']+" are"+suppresp)			
				}		
			}, contexts[0].parameters['suppliername'])
				;

			//let reply = {responseText};
			//console.log("499"+JSON.stringify(reply));

			
		}
		else
		{
		let replies = [
			{
				"content_type": "text",
				//"title": "JGA",
				"title": "IOP",
				"payload": "IOP"
			},
			{
				"content_type": "text",
				//"title": "US Gas and Electric",
				"title": "ABC",
				"payload": "ABC"
			},
			{
				"content_type": "text",
				//"title": "British Telecom",
				"title": "GDS",
				"payload": "GDS"
			}
		];
		console.log('in else of isDefined(action) && action==buyerstartevaluation');
		sendQuickReply(sender, "Can you please tell me the supplier name."+"\n"+"Some popular Suppliers are-", replies);
	}
		break;
		case "buyerstartevaluation.buyerstartevaluation-yes":
			for (var m = 0; m < contexts[0].parameters.emailid.length; m++) {
				console.log('contexts[0].parameters.emailid-' + contexts[0].parameters.emailid[m]);
				let emailContent =
					'Hello Sir/Mam, As you had shown interest to become our vendor'+
				 	 'You are invited to get further information on https://ancient-fortress-43001.herokuapp.com/, Please chat with our Bot Vickey to know further details';
				let emailID = contexts[0].parameters.emailid[m];

				console.log('sending email to %s', emailID);
				console.log('sending email to %s',contexts[0].parameters.emailid[m]);

				sendEmail('American Slice Vendor Invitation', 'vickey@americaslice.com', emailID, emailContent);
			}

			let replies = [
				{
					"content_type": "text",
					"title": "Start all over",
					"payload": "Start all over"
				},
				{
					"content_type": "text",
					"title": "Not Right Now",
					"payload": "Not Right Now"
				}
			];
			console.log('in else of isDefined(action) && action==buyerstartevaluation');
			sendQuickReply(sender, "Email sent to the suppliers - "+"What would you want to do next?", replies);

			break;

		default:
			//unhandled action, just send back the text
			console.log('handleApiAiAction-default')
			sendTextMessage(sender, responseText);
	}
}

function handleMessage(message, sender) {
	switch (message.type) {
		case 0: //text
			sendTextMessage(sender, message.speech);
			break;
		case 2: //quick replies
			let replies = [];
			for (var b = 0; b < message.replies.length; b++) {
				let reply =
					{
						"content_type": "text",
						"title": message.replies[b],
						"payload": message.replies[b]
					}
				replies.push(reply);
			}
			sendQuickReply(sender, message.title, replies);
			break;
		case 3: //image
			sendImageMessage(sender, message.imageUrl);
			break;
		case 4:
			// custom payload
			var messageData = {
				recipient: {
					id: sender
				},
				message: message.payload.facebook

			};
			console.log("handleMessagehandleMessage");
			callSendAPI(messageData);

			break;
	}
}


function handleCardMessages(messages, sender) {
	console.log("handleCardMessages = " + JSON.stringify(messages))
	let elements = [];
	for (var m = 0; m < messages.length; m++) {
		let message = messages[m];
		let buttons = [];
		for (var b = 0; b < message.buttons.length; b++) {
			let isLink = (message.buttons[b].postback.substring(0, 4) === 'http');
			let button;
			if (isLink) {
				button = {
					"type": "web_url",
					"title": message.buttons[b].text,
					"url": message.buttons[b].postback
				}
			} else {
				button = {
					"type": "postback",
					"title": message.buttons[b].text,
					"payload": message.buttons[b].postback
				}
			}
			buttons.push(button);
		}


		let element = {
			"title": message.title,
			"image_url": message.imageUrl,
			"subtitle": message.subtitle,
			"buttons": buttons
		};
		elements.push(element);
	}
	sendGenericMessage(sender, elements);
}


function handleApiAiResponse(sender, response) {
	let responseText = response.result.fulfillment.speech;
	let responseData = response.result.fulfillment.data;
	let messages = response.result.fulfillment.messages;
	let platform = response.result.fulfillment.platform;
	let action = response.result.action;
	let resolvedQuery = response.result.resolvedQuery;
	let queryText = response.result.queryText;
	let contexts = response.result.contexts;
	let parameters = response.result.parameters;
	let intent = response.result.metadata.intentName;
	if (isDefined(responseText) && responseText != '') {
		console.log('responseText is already defined - %s', responseText);
	}
	else {
		responseText = response.result.fulfillment.messages[0].speech;
		console.log('new responseText - %s', responseText);
	}
	
	//suppfaq-compinfo.suppfaq-compinfo-custom-2
	console.log("response - %s", JSON.stringify(response));
	console.log('responseText = %s', responseText);
	console.log('responseData = %s', responseData);
	console.log('messages = %s', messages);
	console.log('platform = %s', platform);
	console.log('action = %s', action);
	console.log('contexts = %s', contexts);
	console.log('parameters = %s', parameters);
	console.log('intent = %s', intent);

	console.log('handleApiAiResponsehandleApiAiResponse, platform = %s', platform);

	sendTypingOff(sender);

	if (isDefined(action) && action == 'buyerstartevaluation') {
		console.log('buyerstartevaluation, userId = %s', sender);
		getusername(sender);
		console.log('full_name----%s', full_name);
		if ((full_name == "Aditya Punjabi") || (full_name == "Schubhm Pandey") || (full_name == "Shubham Pandey")) {
			//sendToApiAi(sender, "Hi Buyer");
			//sendTextMessage(sender, full_name +", To go forward we need the email id of the vendors, please let me know if you can share email ids")
			console.log('Authorized for buyerstartevaluation');
		}
		else {
			let replies = [
				{
					"content_type": "text",
					"title": "Start all over",
					"payload": "Start all over"
				},
			];
			console.log('in else of isDefined(action) && action==buyerstartevaluation');
			sendQuickReply(sender, "You are not authorized to start the evaluation", replies);
			//sendTextMessage(sender, full_name +", You are not authorized to start the evaluation");
			return;
		}
		console.log('isDefined(action)' + action);
		handleApiAiAction(sender, action, responseText, contexts, parameters,resolvedQuery);
	};


	if (isDefined(action) && action == 'input.unknown') {
		console.log('isDefined(action)-input.unknown-' + action);
		{
			let replies = [
				{
					"content_type": "text",
					"title": "Start all over",
					"payload": "Start all over"
				},
				{
					"content_type": "text",
					"title": "Quit Chat",
					"payload": "Quit Chat"
				}
			];
			console.log('in else of isDefined(action) && action==buyerstartevaluation');
			sendQuickReply(sender, "I am sorry "+first_name+", my programmers are still working on this area. By that time please feel free to write to IT Support – youritdesk@amerslice.com ", replies);
			//sendTextMessage(sender, full_name +", You are not authorized to start the evaluation");
			return;
		}
	}

	else if (isDefined(action) && action == 'input.welcome') {
		console.log('isDefined(action)-input.welcome-' + action);
		handleApiAiAction(sender, action, responseText, contexts, parameters, resolvedQuery);
	}

	else if (isDefined(action) && action == 'knowsupplier') {
		console.log('isDefined(action)-knowsupplier-' + action);
		handleApiAiAction(sender, action, responseText, contexts, parameters, resolvedQuery);
	}

	else if (isDefined(action) && action == 'quitchat') {
		console.log('isDefined(action)-quitchat-' + action);
		handleApiAiAction(sender, action, responseText, contexts, parameters, resolvedQuery);
	}

	else if (isDefined(action) && action == 'buyerstartevaluation.buyerstartevaluation-yes' && contexts[0].parameters['emailid'] && isDefined(contexts[0].parameters['emailid']) && contexts[0].parameters['emailid'] != '') {
		console.log('isDefined(action) - buyerstartevaluation.buyerstartevaluation-yes -' + action);
		console.log('contexts[0].parameters[emailid] -' + contexts[0].parameters['emailid']);
		handleApiAiAction(sender, action, responseText, contexts, parameters,resolvedQuery);
	}

	else if (isDefined(action) && action != 'input.welcome'
		&& action != 'buyerstartevaluation'
		&& action != 'quitchat'
		&& action != 'buyerstartevaluation.buyerstartevaluation-no'
		&& action != 'buyerstartevaluation.buyerstartevaluation-yes'
		&& action != 'suppfaq-compinfo.suppfaq-compinfo-custom.suppfaq-compinfo-franchise-custom'
		&& action != 'suppfaq-compinfo.suppfaq-compinfo-custom.suppfaq-compinfo-franchise-custom-2'
		//&& queryText!="History" && queryText!="Become a Franchise"
		&& intent != "suppfaq-compinfo-history" && intent != "suppfaq-compinfo-franchise")
	//&& contexts[0].lifespanCount != 4) {
	{
		console.log('isDefined(action)' + action)
		handleApiAiAction(sender, action, responseText, contexts, parameters,resolvedQuery);
	}

	else if (isDefined(messages) && (messages.length == 1 && messages[0].type != 0 || messages.length > 1)) {
		console.log('if (isDefined(messages) && (messages.length');
		let timeoutInterval = 1100;
		let previousType;
		let cardTypes = [];
		let timeout = 0;
		for (var i = 0; i < messages.length; i++) {
			console.log('for (var i = 0; i < messages.length; i++) {');

			if (previousType == 1 && (messages[i].type != 1 || i == messages.length - 1)) {
				console.log('if ( previousType == 1 && (messages[i].');
				timeout = (i - 1) * timeoutInterval;
				setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
				cardTypes = [];
				timeout = i * timeoutInterval;
				setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
			} else if (messages[i].type == 1 && i == messages.length - 1) {
				console.log('else if ( messages[i].type == 1 && i == message');
				cardTypes.push(messages[i]);
				timeout = (i - 1) * timeoutInterval;
				setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
				cardTypes = [];
			} else if (messages[i].type == 1) {
				console.log('else if ( messages[i].type == 1 ) {');
				cardTypes.push(messages[i]);
			} else {
				console.log('else {');
				timeout = i * timeoutInterval;
				console.log('timeout==' + timeout);
				setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
			}

			previousType = messages[i].type;

		}
	} else if (responseText == '' && !isDefined(action) && !isDefined(postback)) {
		//api ai could not evaluate input.
		console.log('c11-Unknown query' + response.result.resolvedQuery);
		sendTextMessage(sender, "I'm not sure what you want. Can you be more specific?");
	} else if (isDefined(responseData) && isDefined(responseData.facebook)) {
		try {
			console.log('c12-Response as formatted message' + responseData.facebook);
			sendTextMessage(sender, responseData.facebook);
		} catch (err) {
			sendTextMessage(sender, err.message);
			console.log("handleApiAiResponse-catch (err)");
		}
	} else if (isDefined(responseText)) {
		console.log("else if (isDefined(responseText))");
		sendTextMessage(sender, responseText);
	}
	else {
		console.log("handleApiAiResponse - else");
		sendTextMessage(sender, responseText);
	}
}

function sendToApiAi(sender, text) {

	sendTypingOn(sender);
	let apiaiRequest = apiAiService.textRequest(text, {
		sessionId: sessionIds.get(sender)
	});

	apiaiRequest.on('response', (response) => {
		if (isDefined(response.result)) {
			handleApiAiResponse(sender, response);
		}
	});

	apiaiRequest.on('error', (error) => console.error(error));
	apiaiRequest.end();
}




function sendTextMessage(recipientId, text) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: text
		}
	}
	console.log("sendTextMessagesendTextMessage - %s", JSON.stringify(messageData));
	callSendAPI(
		//JSON.stringify(
		messageData
		//)
	);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId, imageUrl) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "image",
				payload: {
					url: imageUrl
				}
			}
		}
	};
	console.log("sendImageMessagesendImageMessage");
	callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "image",
				payload: {
					url: config.SERVER_URL + "/assets/instagram_logo.gif"
				}
			}
		}
	};
	console.log("sendGifMessagesendGifMessage");
	callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "audio",
				payload: {
					url: config.SERVER_URL + "/assets/sample.mp3"
				}
			}
		}
	};
	console.log("sendAudioMessagesendAudioMessage");
	callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 * example videoName: "/assets/allofus480.mov"
 */
function sendVideoMessage(recipientId, videoName) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "video",
				payload: {
					url: config.SERVER_URL + videoName
				}
			}
		}
	};
	console.log("sendVideoMessagesendVideoMessage");
	callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 * example fileName: fileName"/assets/test.txt"
 */
function sendFileMessage(recipientId, fileName) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "file",
				payload: {
					url: config.SERVER_URL + fileName
				}
			}
		}
	};
	console.log("sendFileMessagesendFileMessage");
	callSendAPI(messageData);
}



/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId, text, buttons) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "template",
				payload: {
					template_type: "button",
					text: text,
					buttons: buttons
				}
			}
		}
	};
	console.log("sendButtonMessagesendButtonMessage");
	callSendAPI(messageData);
}


function sendGenericMessage(recipientId, elements) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "template",
				payload: {
					template_type: "generic",
					elements: elements
				}
			}
		}
	};
	console.log("sendGenericMessagesendGenericMessage");

	console.log("sendGenericMessagesendGenericMessage - " + JSON.stringify(messageData));

	callSendAPI(messageData);
}


function sendReceiptMessage(recipientId, recipient_name, currency, payment_method,
	timestamp, elements, address, summary, adjustments) {
	// Generate a random receipt ID as the API requires a unique ID
	var receiptId = "order" + Math.floor(Math.random() * 1000);

	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "template",
				payload: {
					template_type: "receipt",
					recipient_name: recipient_name,
					order_number: receiptId,
					currency: currency,
					payment_method: payment_method,
					timestamp: timestamp,
					elements: elements,
					address: address,
					summary: summary,
					adjustments: adjustments
				}
			}
		}
	};
	console.log("sendReceiptMessagesendReceiptMessage");
	callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId, text, replies, metadata) {

	console.log("inside sendQuickReply");

	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: text,
			metadata: isDefined(metadata) ? metadata : '',
			quick_replies: replies
		}
	};
	console.log("sendQuickReplysendQuickReply");
	callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {

	var messageData = {
		recipient: {
			id: recipientId
		},
		sender_action: "mark_seen"
	};
	console.log("sendReadReceiptsendReadReceipt");
	callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {


	var messageData = {
		recipient: {
			id: recipientId
		},
		sender_action: "typing_on"
	};
	console.log("sendTypingOnsendTypingOn");
	callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {


	var messageData = {
		recipient: {
			id: recipientId
		},
		sender_action: "typing_off"
	};
	console.log("sendTypingOffsendTypingOff");
	callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: "template",
				payload: {
					template_type: "button",
					text: "Welcome. Link your account.",
					buttons: [{
						type: "account_link",
						url: config.SERVER_URL + "/authorize"
					}]
				}
			}
		}
	};
	console.log("sendAccountLinkingsendAccountLinking");
	callSendAPI(messageData);
}


function greetUserText(userId) {
	//first read user firstname
	request({
		uri: 'https://graph.facebook.com/v2.7/' + userId,
		qs: {
			access_token: config.FB_PAGE_TOKEN
		}

	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {

			var user = JSON.parse(body);

			if (user.first_name) {
				console.log("c12-FB user: %s %s %s, %s %s %s, %s",
					userId, user.first_name, user.last_name, user.gender, user.address, user.age_range, user.birthday,
					user.hometown);

				console.log("c12-FB user: %s %s %s, %s %s %s, %s",
					userId, user.email, user.verified, user.timezone, user.location, user.birthday);

				sendTextMessage(userId, "Welcome " + user.first_name + '!');
			} else {
				console.log("c13-Cannot get data for fb user with id",
					userId);
			}
		} else {
			console.error(response.error);
		}

	});
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
	console.log("callSendAPImessageData - " + JSON.stringify(messageData));
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: config.FB_PAGE_TOKEN
		},
		method: 'POST',
		json: messageData
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log("JSON.Stringify(body)===%s", JSON.stringify(body));

			var recipientId = body.recipient_id;
			//console.log("body.recipient_id-%s",body.recipient_id);
			//console.log("body.recipient.id-%s",body.recipient.id);

			if (typeof recipientId != 'undefined' && recipientId) {
				console.log("if (recipientId != undefined)");
			}
			else {
				console.log(" (recipientId = undefined)");
				recipientId = body.recipient.id;
			}

			var messageId = body.message_id;

			if (messageId) {
				console.log("c13-Successfully sent message with id %s to recipient %s",
					messageId, recipientId);
			} else {
				//userId1 = recipientId;
				//greetUserText(recipientId);
				console.log("c14-Successfully called Send API for recipient %s",
					recipientId);
			}
		} else {
			console.log("body = %s", JSON.stringify(body));
			console.log("body.recipient_id-%s", body.recipient_id);
			console.error("c15-Failed calling Send API", response.statusCode, response.statusMessage, body.error);
		}
	});

	//console.log("Commented");
}



/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 * 
 */
function receivedPostback(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfPostback = event.timestamp;

	// The 'payload' param is a developer-defined field which is set in a postback 
	// button for Structured Messages. 
	var payload = event.postback.payload;

	switch (payload) {
		case 'FUN_NEWS':
			sendFunNewsSubscribe(senderID);
			break;
		case 'GET_STARTED':
			greetUserText(senderID);
			break;
		case 'STARTALLOVER':
			//get feedback with new jobs
			sendToApiAi(senderID, "Start all over");
			break;
		case 'QUITCHAT':
			//get feedback with new jobs
			sendToApiAi(senderID, "Quit Chat");
			break;
		case 'CHAT':
			//user wants to chat
			sendTextMessage(senderID, "I love chatting too. Do you have any other questions for me?");
			break;
		default:
			//unindentified payload
			sendTextMessage(senderID, "I'm not sure what you want. Can you be more specific?");
			break;

	}

	console.log("c16-Received postback for user %d and page %d with payload '%s' " +
		"at %d", senderID, recipientID, payload, timeOfPostback);

}


/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 * 
 */
function receivedMessageRead(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;

	// All messages before watermark (a timestamp) or sequence have been seen.
	var watermark = event.read.watermark;
	var sequenceNumber = event.read.seq;

	console.log("c17-Received message read event for watermark %d and sequence " +
		"number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 * 
 */
function receivedAccountLink(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;

	var status = event.account_linking.status;
	var authCode = event.account_linking.authorization_code;

	console.log("c18-Received account link event with for user %d with status %s " +
		"and auth code %s ", senderID, status, authCode);
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var delivery = event.delivery;
	var messageIDs = delivery.mids;
	var watermark = delivery.watermark;
	var sequenceNumber = delivery.seq;

	if (messageIDs) {
		messageIDs.forEach(function (messageID) {
			console.log("c19-Received delivery confirmation for message ID: %s",
				messageID);
		});
	}

	console.log("c20-All message before %d were delivered.", watermark);
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfAuth = event.timestamp;

	// The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
	// The developer can set this to an arbitrary value to associate the 
	// authentication callback with the 'Send to Messenger' click event. This is
	// a way to do account linking when the user clicks the 'Send to Messenger' 
	// plugin.
	var passThroughParam = event.optin.ref;

	console.log("c21-Received authentication for user %d and page %d with pass " +
		"through param '%s' at %d", senderID, recipientID, passThroughParam,
		timeOfAuth);

	// When an authentication is received, we'll send a message back to the sender
	// to let them know it was successful.
	sendTextMessage(senderID, "Authentication successful");
}

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
	var signature = req.headers["x-hub-signature"];

	if (!signature) {
		throw new Error('Couldn\'t validate the signature.');
	} else {
		var elements = signature.split('=');
		var method = elements[0];
		var signatureHash = elements[1];

		var expectedHash = crypto.createHmac('sha1', config.FB_APP_SECRET)
			.update(buf)
			.digest('hex');

		console.log("c22-expectedHash--------" + expectedHash);
		console.log("c23-FB_APP_SECRET--------" + config.FB_APP_SECRET);

		console.log("c24-signatureHash-------" + signatureHash);

		if (signatureHash != expectedHash) {
			throw new Error("Couldn't validate the request signature.");
			console.log("c25-Error not thrown");
		}
	}
}

function sendEmail(subject, fromEmail, toemail, content) {
	console.log("Inside sendEmail");
	var helper = require('sendgrid').mail;
	console.log("1");
	var fromEmail = new helper.Email(fromEmail); //change my email address
	console.log("2");
	var toEmail = new helper.Email(toemail); //change my email address
	console.log("3");
	var subject = subject;
	console.log("4");
	var content = new helper.Content('text/html', content);
	console.log("5");
	var mail = new helper.Mail(fromEmail, subject, toEmail, content);

	console.log('fromEmail-%s, subject-%s, toEmail-%s, content-%s', JSON.stringify(fromEmail), JSON.stringify(subject), JSON.stringify(toEmail), JSON.stringify(content))

	console.log("helper-" + helper);
	console.log("subject-" + subject)



	var sg = require('sendgrid')('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');
	//var sg = require('sendgrid')('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');
	var request = sg.emptyRequest({
		method: 'POST',
		path: '/v3/mail/send',
		body: mail.toJSON()
	});

	sg.API(request, function (error, response) {
		if (error) {
			console.log('c26-Error response received');
		}
		console.log("c27-" + response.statusCode);
		console.log("c28-" + JSON.stringify(response.body));
		console.log("c29-" + JSON.stringify(response.headers));
	});
}

function isDefined(obj) {
	if (typeof obj == 'undefined') {
		return false;
	}

	if (!obj) {
		return false;
	}

	return obj != null;
}

// Spin up the server
app.listen(app.get('port'), function () {
	console.log('c30-running on port', app.get('port'))
})
