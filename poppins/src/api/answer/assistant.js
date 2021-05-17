/* eslint-disable consistent-return */
/* eslint-disable func-names */
import Map from 'es6-map';
import { WebhookClient } from 'dialogflow-fulfillment';
import { Text } from 'dialogflow-fulfillment';
import config from '../../config';
import Api from '../../utils/api';
import textUtil from '../../utils/text';
import { logger } from '../../utils/logger';

import {constants, Routines} from '../../api/common/responses';
import RoutineIntent from './intents/routine';
import WhereToFindIntent from './intents/whereToFind';

const Assistant = (function () {
  var context;
  var intentMap;
  return {
    init: function (req, res) {
      let agent = new WebhookClient({ request: req, response: res });
      let data = req.body.queryResult;
      this.res = res;
      this.data= data;
      context = this;
      try {
        this.query = {
          queryText: data.queryText,
          action: data.action,
          parameters: data.parameters,
          intentDetectionConfidence: data.intentDetectionConfidence,
          accessToken: req.body.originalDetectIntentRequest.payload.user.accessToken,
          dialogFlowSessionId: req.body.session
        };
        this.params = {
          data: this.query,
          method: 'POST'
        };
        this.setReply(agent);
      } catch (error) {
        this.handleError(403, 'unknown error', error);
      }
    },
    welcome: function (agent) {
      var text;
      return context.getReply(config.assistantWelcomeEndpoint, function (data) {
        if (data.importantDetails === constants.NOT_FOUND) {
          text = constants.WELCOME_TEXT;
        } else {
          text = constants.WELCOME_TEXT_HAS_NOTE
            .replace(constants.SEEKER_NAME_PLACEHOLDER, data.seekerFirstName);
          agent.context.set(constants.contexts.WELCOME, 1, data);
        }
        // responseId of 0 means the welcome intent was invoked
        context.sendReply(agent, text, constants.type.NO_DEFAULT_QUESTION, data, 0);
      });
    },
    welcomeYes: function (agent) {
      var data = agent.context.get(constants.contexts.WELCOME).parameters;
      var text = constants.IMPORTANT_DETAILS_TEXT
        .replace(constants.IMPORTANT_DETAIL_PLACEHOLDER, data.importantDetails);
      context.sendReply(agent, text, constants.type.ADD_DEFAULT_QUESTION, data);
    },
    noConfirmation: function (agent) {
      var text = constants.FOLLOWUP_QUESTION_CONFIRMATION;
      context.sendReply(agent, text, constants.type.NO_DEFAULT_QUESTION, undefined, constants.responseIds.DECLINE);
    },
    emergencyContact: function (agent) {
      return context.getReply(config.assistantEmergencyContactEndpoint, function (data) {
        var text = constants.ANSWER_NOT_FOUND_FALLBACK;
        var parameters = context.query.parameters;
        var noInputParameters = ( !parameters || (parameters && (parameters['given-name'] === '' && parameters['relationship'] === ''))) ? true : false;
        var hasContact = (typeof data.emergencyContact !== 'undefined' && typeof data.emergencyContact.phone !== 'undefined');
        var responseId = data.quizletQuestionResponseId;
        if(!hasContact){
          // Seeker didnt provide an emergency contact
          text = constants.EMERGENCY_CONTACT_NONE_SPECIFIED;
          context.outputEmergencyContact(agent, text, constants.RESPONSE_ID_NOT_FOUND, data, true);
        }
        else if (noInputParameters){
          context.emergencyContactMatchedResponse(agent,responseId, data);
        }
        else{
          if(data.foundMatch === true){
            context.emergencyContactMatchedResponse(agent, responseId, data);
          }
          else{
            context.setContextWithDataObject(agent, constants.contexts.EMERGENCY_CONTACT_CONTEXT, data);
            var relationshipStr = context.parseOtherRelationshipsString(data, false);
            text = constants.EMERGENCY_CONTACT_RELATIONSHIP_NOT_FOUND
              .replace(constants.RELATIONSHIP_PLACEHOLDER, parameters['relationship'])
              .replace(constants.RELATIONSHIPS_PLACEHOLDER, relationshipStr) // intentionally replacing twice
              .replace(constants.RELATIONSHIPS_PLACEHOLDER, relationshipStr)
              .replace(constants.SEEKER_NAME_PLACEHOLDER, data.seekerFirstName);
            return context.updateFailCount(agent, constants.contexts.EMERGENCY_CONTACT_CONTEXT,
              context.outputEmergencyContact.bind(undefined, agent, text, constants.RESPONSE_ID_NOT_FOUND, data, false));
          }
        }
      });
    },
    parseEmergencyContactText: function(data, text = constants.EMERGENCY_CONTACT_TEXT){
      // format phone number
      var phoneNumber = data.emergencyContact.phone.replace(/\W/g, '');
      phoneNumber = phoneNumber.replace(/(.*)(\d{3})(\d{3})(\d{4})(.*)/, "$1($2) $3-$4 $5");
      text = text.replace(constants.CONTACT_NAME_PLACEHOLDER, data.emergencyContact.name)
                 .replace(constants.RELATIONSHIP_PLACEHOLDER, data.emergencyContact.relationship)
                 .replace(constants.PHONE_NUMBER_PLACEHOLDER, phoneNumber);
      return text;
    },
    emergencyContactMatchedResponse: function(agent, responseId, data){
      text = context.parseEmergencyContactText(data);
      if(data.allEmergencyContacts.length > 1){
        agent.add(text);
        context.setContextWithDataObject(agent, constants.contexts.EMERGENCY_CONTACT_CONTEXT, data);
        var relationshipStr = context.parseOtherRelationshipsString(data, true);
        var text = constants.EMERGENCY_CONTACT_MORE_CONTACTS.replace(constants.RELATIONSHIPS_PLACEHOLDER, relationshipStr);
        context.outputEmergencyContact(agent, text, constants.RESPONSE_ID_NOT_FOUND, data, false);
      }
      else{
        context.outputEmergencyContact(agent, text, constants.RESPONSE_ID_NOT_FOUND, data, true);
      }
    },
    outputEmergencyContact: function(agent, text, responseId, data, handled){
      text = text.replace(constants.SEEKER_NAME_PLACEHOLDER, data.seekerFirstName);
      if(!handled){
        context.sendReply(agent, text, constants.type.NO_DEFAULT_QUESTION, data, responseId);
      } else {
        context.sendReply(agent, text, constants.type.ADD_DEFAULT_QUESTION, data, responseId);
      }
    },
    setContextWithDataObject: function(agent, context, data){
        //set the context
        var contextData = agent.context.get(context);
        agent.context.set(context,3,data);
    },
    parseOtherRelationshipsString: function(data, filterRenderedRecord){
      var relationships = [];
      data.allEmergencyContacts.forEach(function(allEmergencyContacts, i) {
      if(!filterRenderedRecord || allEmergencyContacts.name !== data.emergencyContact.name){
         relationships.push(allEmergencyContacts.relationship);
      }
     });
      relationships = textUtil.commaJoiner(relationships, " or ");
      return relationships;
    },
    emergencyContactMoreFallback: function (agent){
        var data = agent.context.get(constants.contexts.EMERGENCY_CONTACT_CONTEXT).parameters;
        var relationshipStr = context.parseOtherRelationshipsString(data, false);
        var text = constants.EMERGENCY_CONTACT_MORE_FALLBACK.replace(constants.RELATIONSHIPS_PLACEHOLDER, relationshipStr);
        return context.updateFailCount(agent, constants.contexts.EMERGENCY_CONTACT_CONTEXT,
              context.outputEmergencyContact.bind(undefined, agent, text, constants.RESPONSE_ID_NOT_FOUND, data, false));
    },
    emergencyContactRelationship: function (agent){
        var contextData = agent.context.get("emergencycontact-relationship");
        if(contextData){
          var relationshipOriginal = contextData.parameters["relationship.original"];
          if(relationshipOriginal){
            context.query.parameters["relationship"] = relationshipOriginal;
          }
        }
        return context.getReply(config.assistantEmergencyContactEndpoint, function (data) {
        var responseId = data.quizletQuestionResponseId;
        if(data.foundMatch === true){
              var text = context.parseEmergencyContactText(data);
              context.outputEmergencyContact(agent, text, responseId, data, true);
          }
          else{
            return context.emergencyContactMoreFallback(agent);
          }
          return;
      });
    },
    importantNote: function (agent) {
      return context.getReply(config.assistantAnswerEndpoint, function (data) {
        if (data.fulfillmentText === constants.NOT_FOUND) {
          var text = constants.IMPORTANT_NOTE_NOT_FOUND
            .replace(constants.SEEKER_NAME_PLACEHOLDER, data.seekerFirstName);
          context.sendReply(agent, text, constants.type.ADD_DEFAULT_QUESTION, data, constants.responseIds.RESPONSE_NOT_FOUND);
        } else {
          context.sendReply(agent, data.fulfillmentText, constants.type.ADD_DEFAULT_QUESTION, data);
        }
      });
    },
    fallback: function (agent) {
      return context.updateFailCount(agent, constants.contexts.NO_INTENT_CONTEXT, context.outputFallback.bind(undefined, agent));
    },
    outputFallback: function (agent) {
      var contextData = agent.context.get(constants.contexts.NO_INTENT_CONTEXT);
      var failCount = contextData.parameters.failCount;
      var text;
      switch (failCount) {
        case 1:
          text = constants.NO_INTENT_FALLBACK_1;
          break;
        case 2:
          text = constants.NO_INTENT_FALLBACK_2;
          break;
      }
      context.sendReply(agent, text, constants.type.NO_DEFAULT_QUESTION, undefined, constants.responseIds.INTENT_NOT_FOUND);
    },
    exit: function (agent) {
      context.sendReply(agent, constants.EXIT, constants.type.NO_DEFAULT_QUESTION, undefined, constants.responseIds.EXIT);
    },
    sendReply: function (agent, text, type, data, responseId) {
      context.logInvocation(data, responseId);
      if(type === constants.type.CLOSE_MIC) {
        var conv = agent.conv();
        conv.close(text);
        agent.add(conv);
      }
      else {
        agent.add(text);
        if (type === constants.type.ADD_DEFAULT_QUESTION) {
          agent.add(
            new Text({
              'text': constants.FOLLOWUP_QUESTION_TEXT,
              'ssml': '<speak>' + constants.FOLLOWUP_QUESTION_SSML + '</speak>'
            })
          );
          context.resetContext(agent);
        }
      }
    },
    setReply: function (agent) {
      if (!intentMap) {
        logger.debug('Setting intentMap!!!');
        //TODO:Vidu - Intent map is just placeholder for now. will be improved later sprints
        intentMap = new Map();
        intentMap.set('Default Welcome Intent', this.welcome);
        intentMap.set('Default Welcome Intent - yes', this.welcomeYes);
        intentMap.set('Default Welcome Intent - no', this.noConfirmation);
        intentMap.set('Default Fallback Intent', this.fallback);
        intentMap.set('Conversation Exit', this.exit);
        RoutineIntent.setHandlers(intentMap, context);
        intentMap.set('Emergency Contact', this.emergencyContact);
        intentMap.set('Emergency Contact - More No', this.noConfirmation);
        intentMap.set('Emergency Contact - Relationship', this.emergencyContactRelationship);
        intentMap.set('Emergency Contact - More fallback', this.emergencyContactMoreFallback);
        intentMap.set('Important Note', this.importantNote);
        WhereToFindIntent.setHandlers(intentMap, context);
        intentMap.set('Fallback Emergency Contact- Yes', this.fallbackEmergencyContactYes);
        intentMap.set('Fallback Emergency Contact- No', this.fallbackEmergencyContactNo);
      }
        agent.handleRequest(intentMap).catch(function(rej) {
          var errorText = 'Error  while handling request, request body is : ' + JSON.stringify(context.data);
          context.handleError(403, errorText, rej);
        })
    },
    getReply: function (url, callback) {
      if (url) {
        let options = context.params;
        options.url = url;
        return new Promise(resolve => {
          Api.request(options, (statusCode, obj) => {
            if (statusCode === 200 && obj.data) {
              if (callback) {
                resolve(
                  callback(obj.data)
                )
              }
            } else if (statusCode === 1316) {
              return context.handleError(403, 'unexpected error', obj);
            } else {
              return context.handleError(403, 'unknown error', obj);
            }
          });
        });
      }
    },
    updateFailCount: function (agent, contextName, callback) {
      var contextData = agent.context.get(contextName);
      var parameters = {};
      if (contextData) {
        Object.assign(parameters, contextData.parameters);
      }
      var failCount = parameters['failCount'] || 0;
      parameters['failCount'] = failCount + 1;
      agent.context.set(contextName, 1, parameters);
      if (parameters.failCount < 3) {
        if (callback) {
          callback(contextName);
        }
      }
      else {
        return context.maxFailureHandler(agent);
      }
    },
    maxFailureHandler: function (agent) {
      context.resetContext(agent);
      return context.getReply(config.assistantEmergencyContactEndpoint, function (data) {
        if (!data.allEmergencyContacts || data.allEmergencyContacts.length === 0) {
          context.sendReply(agent, constants.MAX_FAILURE_EXIT, constants.type.CLOSE_MIC, data, constants.responseIds.INTENT_NOT_FOUND);
        }
        else {
          var contextData = { 
             'emergencyContact': data.allEmergencyContacts[0], 
             'quizletQuestionResponseId': data.quizletQuestionResponseId,
             'memberId' : data.memberId 
            };
          agent.context.set(constants.contexts.DEFAULT_FALLBACK_EMERGENCY_CONTACT_CONTEXT, 2, contextData);
          context.sendReply(agent, constants.LAST_CHANCE, constants.type.NO_DEFAULT_QUESTION, data, constants.responseIds.INTENT_NOT_FOUND);
        }
      })
    },
    fallbackEmergencyContactYes: function (agent) {
      var data = agent.context.get(constants.contexts.DEFAULT_FALLBACK_EMERGENCY_CONTACT_CONTEXT);
      var text = context.parseEmergencyContactText(data.parameters, constants.LAST_CHANCE_EMERGENCY_CONTACT);
      context.resetContext(agent);
      context.sendReply(agent, text, constants.type.CLOSE_MIC, data.parameters, data.parameters.quizletQuestionResponseId);
    },
    fallbackEmergencyContactNo: function (agent) {
      context.resetContext(agent);
      context.sendReply(agent, constants.LAST_CHANCE_NO, constants.type.CLOSE_MIC, undefined, constants.responseIds.EXIT);
    },
    resetContext: function (agent) {
      for (const context of agent.context) {
        agent.context.delete(context.name);
      }
    },
    logInvocation: function(data, responseId) {
      data = data || {};
      if(typeof responseId !== 'undefined'){
        data.quizletQuestionResponseId = responseId;
      } else
      if(typeof data.quizletQuestionResponseId === 'undefined'){
        data.quizletQuestionResponseId = constants.responseIds.SYSTEM_ERROR;
      }
      Api.request({
        url: config.pixelEndpoint,
        method: 'POST',
        data: {
        appName: "Care.com Google Assistant",
        deviceInfo : { deviceModel:"Google Home" },
        memberInfo: { "memberId": data.memberId || "" },
        logs: [{
          type: "event",
          eventType: "Action",
          isSystemGenerated: false,
          creationTime: new Date(),
          session: context.query.dialogFlowSessionId,
          eventName: "GH_Guide_Session",
          eventAttributes: {
            utterance: this.query.queryText,
            responseId: data.quizletQuestionResponseId,
            questionId: data.quizletQuestionId || ""
          }
        }]
        }
      }, () => {});
    },
    handleError: function (statusCode, errorText, error) {
      context.res.status(statusCode).send({
        error: error
      });
      logger.error(error, {errorText});
    }
  };
})();

export default Assistant;
