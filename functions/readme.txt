Option 1: Dialogflow Inline Editor (Recommended)
Create Dialogflow Agent
Fulfillment > Enable the Inline EditorA.
Select Deploy
Option 2: Firebase CLI
Create Dialogflow Agent
git clone https://github.com/dialogflow/fulfillment-webhook-nodejs.git
cd to the functions directory
npm install
Install the Firebase CLI by running npm install -g firebase-tools
Login with your Google account, firebase login
Add your project to the sample with $ firebase use <project ID>
In Dialogflow console under Settings ? > General tab > copy Project ID.

Run firebase deploy --only functions:dialogflowFirebaseFulfillment

When successfully deployed, visit the Project Console link > Functions > Dashboard
Copy the link under the events column. For example: https://us-central1-<PROJECTID>.cloudfunctions.net/<FUNCTIONNAME>
Back in Dialogflow Console > Fulfillment > Enable Webhook.
Paste the URL from the Firebase Console’s events column into the URL field > Save.