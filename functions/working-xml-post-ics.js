var request = require("request");
var utf8 = require('utf8');
'use strict';
module.exports = function(callback, suppliername)
{
var abc = 
'<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:pub="http://xmlns.oracle.com/oxp/service/PublicReportService">'+
'<soap:Header/>'+
'<soap:Body>'+
'<pub:runReport>'+
'<pub:reportRequest>'+
'<pub:parameterNameValues>'+
'<!--Zero or more repetitions:-->'+
'<pub:item>'+
 '<pub:name>party</pub:name>'+
 '<pub:values>'+
 '<pub:item>'+suppliername+'</pub:item>'+
 '</pub:values>'+
'</pub:item>'+
'</pub:parameterNameValues>'+
'<pub:reportAbsolutePath>/Custom/shubham/shubham/SUPPREP3.xdo</pub:reportAbsolutePath>' +
'<pub:sizeOfDataChunkDownload>-1</pub:sizeOfDataChunkDownload>'+
'</pub:reportRequest>'+
'</pub:runReport>'+
'</soap:Body>'+
'</soap:Envelope>';

request.post({
    url:"https://eevx-test.fa.em3.oraclecloud.com/xmlpserver/services/ExternalReportWSSService",
    //path: "/xmlpserver/services/ExternalReportWSSService",
    port: 443,
    method:"POST",
    headers:{
        'Authorization': 'Basic VGVzdDIucHJjOldlbGNvbWUxMjM=',
        'Content-Type': 'application/soap+xml',
    },
     body: abc
},
function(error, response, body){
    console.log(JSON.stringify(response));
    console.log(JSON.stringify(body));
    console.log("@@@@@@@@@@@@@@@@@@@@@@@");

let data = JSON.stringify(body);//'c3RhY2thYnVzZS5jb20='; 
console.log(JSON.stringify('2')); 
let buff = new Buffer(data, 'base64');  
console.log(JSON.stringify('3')); 
let text = buff.toString('ascii');
console.log(JSON.stringify('1'));

console.log(data + ' converted from Base64 to ASCII is ' + text);  
console.log("asdasdasd");

//data = "'"+data.substring(1, data.length-1)+"'";
//data = data.toString().replace("\ufeff", "");
data = body;
console.log(data);
var xmldoc = require('xmldoc');
var results = new xmldoc.XmlDocument(data);
console.log("@@@@@@@@@@@@@@@@@"+results)
var child = results.childNamed("env:Body")
console.log("*********************************"+child)
var results2 = new xmldoc.XmlDocument(child);
console.log("@@@@@@@@@@@@@@@@@2"+results2)
var child2 = results2.childNamed("ns2:runReportResponse")
console.log("*********************************"+child2)
var results3 = new xmldoc.XmlDocument(child2);
console.log("@@@@@@@@@@@@@@@@@2"+results3)
var child3 = results3.childNamed("ns2:runReportReturn")
console.log("*********************************"+child3)
var results4 = new xmldoc.XmlDocument(child3);
console.log("@@@@@@@@@@@@@@@@@2"+results4)
var child4 = results4.childNamed("ns2:reportBytes")
console.log("*********************************"+child4)
var authorIsProper = child4.val;
console.log("*********************************"+authorIsProper)

var xml2js = require('xml2js');
//var xml = '<env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope"> <env:Header/> <env:Body> <ns2:runReportResponse xmlns:ns2="http://xmlns.oracle.com/oxp/service/PublicReportService"> <ns2:runReportReturn> <ns2:reportBytes>PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCEtLUdlbmVyYXRlZCBieSBP cmFjbGUgQkkgUHVibGlzaGVyIDExLjEuMS45LjAgLURhdGFlbmdpbmUsIGRhdGFtb2RlbDpfQ3Vz dG9tX3NodWJoYW1fU1VQUFJFUERTX3hkbSAtLT4KPERBVEFfRFM+PFBfVkVORE9SX0lEPjMwMDAw MDA0NzQxNDUwMzwvUF9WRU5ET1JfSUQ+CjxHXzE+CjxWRU5ET1JfSUQ+MzAwMDAwMDQ3NDE0NTAz PC9WRU5ET1JfSUQ+PFJFVklFV19UWVBFPk5PTkU8L1JFVklFV19UWVBFPjxPQkpFQ1RfVkVSU0lP Tl9OVU1CRVI+MTMxPC9PQkpFQ1RfVkVSU0lPTl9OVU1CRVI+PFNFR01FTlQxPjEyNTI8L1NFR01F TlQxPjxQQVJUWV9JRD4zMDAwMDAwNDc0MTQ1MDE8L1BBUlRZX0lEPjxDUkVBVElPTl9TT1VSQ0U+ TUFOVUFMPC9DUkVBVElPTl9TT1VSQ0U+PEVOQUJMRURfRkxBRz5ZPC9FTkFCTEVEX0ZMQUc+PFNV TU1BUllfRkxBRz5ZPC9TVU1NQVJZX0ZMQUc+PFRZUEVfMTA5OT5NSVNDMzwvVFlQRV8xMDk5PjxJ TkNPTUVfVEFYX0lEX0ZMQUc+WTwvSU5DT01FX1RBWF9JRF9GTEFHPjxPUkdBTklaQVRJT05fVFlQ RV9MT09LVVBfQ09ERT5DT1JQT1JBVElPTjwvT1JHQU5JWkFUSU9OX1RZUEVfTE9PS1VQX0NPREU+ PFRBWFBBWUVSX0NPVU5UUlk+VVM8L1RBWFBBWUVSX0NPVU5UUlk+PFNUQVRFX1JFUE9SVEFCTEVf RkxBRz5ZPC9TVEFURV9SRVBPUlRBQkxFX0ZMQUc+PEZFREVSQUxfUkVQT1JUQUJMRV9GTEFHPlk8 L0ZFREVSQUxfUkVQT1JUQUJMRV9GTEFHPjxBTExPV19BV1RfRkxBRz5ZPC9BTExPV19BV1RfRkxB Rz48QVdUX0dST1VQX0lEPjEwMDAwMDMxMDIyMzAyMjwvQVdUX0dST1VQX0lEPjxMQVNUX1VQREFU RV9EQVRFPjIwMTgtMDYtMjJUMTY6Mzg6MTUuNTkwKzAwOjAwPC9MQVNUX1VQREFURV9EQVRFPjxM QVNUX1VQREFURURfQlk+Q0FMVklOLlJPVEg8L0xBU1RfVVBEQVRFRF9CWT48TEFTVF9VUERBVEVf TE9HSU4+NkYzREU5RkE1MTg5N0QwNEUwNTMwMUZGRTcwQTFCMTA8L0xBU1RfVVBEQVRFX0xPR0lO PjxDUkVBVElPTl9EQVRFPjIwMTMtMTEtMDdUMjA6MTQ6MzYuNDI4KzAwOjAwPC9DUkVBVElPTl9E QVRFPjxDUkVBVEVEX0JZPkNBTFZJTi5ST1RIPC9DUkVBVEVEX0JZPjxBVFRSSUJVVEVfTlVNQkVS MT43NTwvQVRUUklCVVRFX05VTUJFUjE+PEJVU0lORVNTX1JFTEFUSU9OU0hJUD5TUEVORF9BVVRI T1JJWkVEPC9CVVNJTkVTU19SRUxBVElPTlNISVA+PE5JX05VTUJFUl9GTEFHPk48L05JX05VTUJF Ul9GTEFHPjxTVVBQTElFUl9MT0NLRURfRkxBRz5OPC9TVVBQTElFUl9MT0NLRURfRkxBRz4KPC9H XzE+CjwvREFUQV9EUz4=</ns2:reportBytes> <ns2:reportContentType>text/xml</ns2:reportContentType> <ns2:reportFileID xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/> <ns2:reportLocale xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/> <ns2:metaDataList xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/> </ns2:runReportReturn> </ns2:runReportResponse> </env:Body> </env:Envelope>'
//xml = xml.replace(/(\r\n|\n|\r)/gm,"");
//xml = xml.replace('"', '')

var xml = data;

var extractedData = "";

var callback_text = "";

var parser = new xml2js.Parser();
parser.parseString(xml, function(err,result){
  //Extract the value from the data element
  //console.log("Note that you can't use value here if parseString is async; extractedData=", JSON.stringify(extractedData));
  extractedData = result['env:Envelope']['env:Body'][0]['ns2:runReportResponse'][0]['ns2:runReportReturn'][0]['ns2:reportBytes'][0];
  console.log(result);
let data = extractedData;
let buff = new Buffer(data, 'base64');  
let text = buff.toString('ascii');

console.log('"' + data + '" converted from Base64 to ASCII is "' + text + '"');  

//console.log(error);
var extractedData = "";
var parser = new xml2js.Parser();
parser.parseString(text, function(err,result){
  //Extract the value from the data element
  console.log("Note that you can't use value here if parseString is async; extractedData=", JSON.stringify(extractedData));
  //console.log("Result is "+result['DATA_DS']['G_1'][0]['PARTY_NAME']);
  if(isDefined(result['DATA_DS']['G_1']))
  {
  if(isDefined(result['DATA_DS']['G_1'][0]['PARTY_NAME']))
  {
    console.log("if(isDefined(result['DATA_DS']['G_1'][0]['PARTY_NAME']))");
  if(!isDefined(result['DATA_DS']['G_1'][0]['SEGMENT1']) && isDefined(result['DATA_DS']['G_1'][0]['CREATION_DATE']))
  {
    callback("Name - " + suppliername
    + " , Vendor Number - , Registration Status - Registered ,     Creation Status - Not Created , Time of Registration - "
    + result['DATA_DS']['G_1'][0]['CREATION_DATE'])
  }

  else if(isDefined(result['DATA_DS']['G_1'][0]['SEGMENT1']) && isDefined(result['DATA_DS']['G_1'][0]['CREATION_DATE']))
  {
    callback("Name - " + suppliername
    + " , Vendor Number - , Registration Status - Registered ,     Creation Status - Created , Time of Registration - "
    + result['DATA_DS']['G_1'][0]['CREATION_DATE'])
  }

  else if(isDefined(result['DATA_DS']['G_1'][0]['SEGMENT1']))
  {

    callback_text = "\n"+ "Name - "+suppliername+"\n"+"Vendor Number - "+(result['DATA_DS']['G_1'][0]['SEGMENT1'] || '')+   "\n"+
  "Address - "+(result['DATA_DS']['G_1'][0]['ADDRESS'] || '')+  "\n"+
  "Type - "+(result['DATA_DS']['G_1'][0]['PARTY_TYPE'] || '')+   "\n"

  if (isDefined(result['DATA_DS']['G_1'][0]['PO_NUM']))
  {
    callback_text = callback_text + "The last PO raised to "+suppliername+ " was PO#"+(result['DATA_DS']['G_1'][0]['PO_NUM'] || 'N/A')+" on "+
    (result['DATA_DS']['G_1'][0]['PO_DATE'] || 'N/A')+ " for an amount $"+
    (result['DATA_DS']['G_1'][0]['AMOUNT_RELEASED'] || '0')+"..."
  }
  else
  {
    callback_text = callback_text + "- No Purchase Orders avaialble for "+suppliername+". ";
  }

  callback(
    callback_text
  )
//  "Last PO Amt. - $"+(result['DATA_DS']['G_1'][0]['AMOUNT_RELEASED'] || '0')+   "\n"+
//  "Last PO Date - "+(result['DATA_DS']['G_1'][0]['PO_DATE'] || 'No PO raised')+   "\n")
  ;
  }
}}
else
{
  callback("The Supplier with Name "+suppliername+" is currently not registered/created with us.");
}


  
  //console.log("Note that you can't use value here if parseString is async; extractedData=", JSON.stringify(extractedData));
  //extractedData = result['DATA_DS']['G_1'][0]['AMOUNT_RELEASED'];
  
  //console.log("Note that you can't use value here if parseString is async; extractedData=", JSON.stringify(extractedData));
});

/*console.log("1");
xml2js.parseString(text, { attrkey: '@',  xmlns: true }, function(err, json) {
    var xml2 = xmlbuilder.create(json,
       {version: '1.0', encoding: 'UTF-8', standalone: true}
    ).end({pretty: true, standalone: true})
    //console.log(xml2);
    //if (err)
      //console.log ('error', err.message, err.stack)
    //else
      //console.log ('result', result)
});*/

});
}
)
}
;

function isDefined(obj) {
	if (typeof obj == 'undefined') {
		return false;
	}

	if (!obj) {
		return false;
	}

	return obj != null;
}