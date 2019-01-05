// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Dialogflow fulfillment getting started guide:
// https://dialogflow.com/docs/how-tos/getting-started-fulfillment

'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const knowsupplier1 = require('./working-xml-post-ics');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome (agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback (agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase inline editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://dialogflow.com/images/api_home_laptop.svg',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://docs.dialogflow.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }
  
    function allApproval(agent) {
    //const city = agent.parameters['geo-city'];
    //const time = agent.parameters['time'];
    //const gotCity = city.length > 0;
    //const gotTime = time.length > 0;

    /*if(gotCity && gotTime) {
        agent.add(`Nice, you want to fly to ${city} at ${time}.`);
    } else if (gotCity && !gotTime) {
        agent.add('Let me know which time you want to fly');
    } else if (gotTime && !gotCity) {
        agent.add('Let me know which city you want to fly to');
    } else {
        agent.add('Let me know which city and time you want to fly');
    }*/
	//agent.add('PO is approved');
  
  knowsupplier1(function(knowsupplierresp){
				if (!knowsupplierresp) {
					//console.log("In if (!knowsupplierresp) {")
						agent.add('In if (!knowsupplierresp) {');
				} 
				else {
					suppresp = knowsupplierresp;
					//console.log("In Else of (!knowsupplierresp)");
					agent.add('In if (!knowsupplierresp) {');
                    /*let replies = [
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
					];*/
					//console.log('in else of isDefined(action) && action==buyerstartevaluation');
					//sendQuickReply(sender, suppresp + "What would you want to do next?", replies);
					
					//console.log("The Supplier details for "+contexts[0].parameters['suppliername']+" are"+suppresp)			
				}		
			}, //contexts[0].parameters['suppliername'])
			'IOP')
				;
}
  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('AllApproval', allApproval);
  // intentMap.set('<INTENT_NAME_HERE>', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
