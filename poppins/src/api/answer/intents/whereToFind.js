/* eslint-disable func-names */
import util from 'util';
import config from '../../../config';
import textUtil from '../../../utils/text';
import { constants, WhereToFind } from '../../../api/common/responses';
const { List } = require('actions-on-google');

module.exports = (function () {
  return {
    init: function (agent, context) {
      this.agent = agent;
      this.context = context;
      
      return this.context.getReply(config.assistantWhereToFindEndpoint, function (data) {
        var text = constants.WHERE_TO_FIND_FALLBACK, responseId = constants.responseIds.RESPONSE_NOT_FOUND;
        var parameters = context.query.parameters;
        var item = parameters['item'];
        var availableItems = data.allWhereToFind;
        if (!availableItems || availableItems.length === 0){
          // Didn't get any items
          text = constants.WHERE_TO_FIND_FALLBACK;
          this.outputWhereToFind(text, responseId, item, {}, [], data);
        }
        else {
          var matchedItem;
          var itemNames = this.extractItemNames(availableItems);
          [matchedItem,text,responseId] = this.getWhereToFindText(availableItems,item,data.quizletQuestionResponseId);
          if(responseId === constants.responseIds.RESPONSE_NOT_FOUND) {
            if(availableItems.length === 1){
              text = constants.WHERE_TO_FIND_NOT_FOUND_SINGLE;
              return this.context.updateFailCount(agent, WhereToFind.CONTEXTS.WHERE_TO_FIND_YES_OR_NO_SINGLE,
                      this.outputWhereToFind.bind(this, text, responseId, item, {}, itemNames, data));
            } else {
              return this.context.updateFailCount(agent, WhereToFind.CONTEXTS.WHERE_TO_FIND_YES_OR_NO,
                this.outputWhereToFind.bind(this, text, responseId, item, {}, itemNames, data));
            }
          }
          else {
            this.outputWhereToFind(text, responseId, item, matchedItem, itemNames, data);
          }
        }
      }.bind(this));
    },
    extractItemNames : function(availableItems) {
      var names=[];
      availableItems.forEach(function(data) {
        names.push(data.item);
      })
      return names;
    },
    outputWhereToFind : function(text, responseId, item, matchedItem, itemNames, data, contextName){
      text = text.replace(constants.SEEKER_NAME_PLACEHOLDER, data.seekerFirstName)
                 .replace(constants.ITEM_PLACEHOLDER, item)
                 .replace(constants.ITEMS_PLACEHOLDER, textUtil.commaJoiner(itemNames, " and "))
                 .replace(constants.NOTE_PLACEHOLDER, ((matchedItem.note)?matchedItem.note:''))
                 .replace(constants.LOCATION_PLACEHOLDER,matchedItem.location);
      if(responseId === constants.responseIds.RESPONSE_NOT_FOUND ){
        var contextData = this.agent.context.get(contextName);
          if(contextData) {    
          var parameters = Object.assign({
                items : data.allWhereToFind,
                memberId : data.memberId,
                quizletQuestionResponseId : data.quizletQuestionResponseId},
                contextData.parameters);
              this.agent.context.set(contextName, 2, parameters);
          }
              this.context.sendReply(this.agent, text, constants.type.NO_DEFAULT_QUESTION,undefined,constants.responseIds.RESPONSE_NOT_FOUND);
      } else {
        this.context.sendReply(this.agent, text, constants.type.ADD_DEFAULT_QUESTION,data,data.quizletQuestionResponseId);
      }
    },
    getWhereToFindText: function (itemsFromSeeker, askedItem, responseId) {
      for(var i=0;i<itemsFromSeeker.length;i++) {
        var itemFromSeeker = itemsFromSeeker[i].item;
        var isItemExist = itemFromSeeker.toUpperCase().includes(askedItem.toUpperCase()) || (askedItem.toUpperCase().includes(itemFromSeeker.toUpperCase()));
        if(isItemExist) {
          return [itemsFromSeeker[i],constants.WHERE_TO_FIND_TEXT,responseId];
        }
      }
      return [undefined,constants.WHERE_TO_FIND_NOT_FOUND,constants.responseIds.RESPONSE_NOT_FOUND];
    },
    whereToFindYes : function(agent, context) {
      var contextData = agent.context.get(WhereToFind.CONTEXTS.WHERE_TO_FIND_YES_OR_NO);
      var avalibleItems = contextData.parameters.items;
      var itemNames = this.extractItemNames(avalibleItems);
      var joinedString = textUtil.commaJoiner(itemNames," and ");
      var text = constants.WHERE_TO_FIND_YES.replace(constants.ITEMS_PLACEHOLDER,joinedString);
      let conv = agent.conv();
      conv.ask(text);      
      conv.ask(new List({
        title: 'Please select item',
        items: this.createItemsListObject(avalibleItems)
      }));
      context.sendReply(agent,conv,constants.type.NO_DEFAULT_QUESTION,contextData,contextData.quizletQuestionResponseId);
    },
    createItemsListObject : function createItemsList(items) {
      var obj = {};
      items.forEach(function(item) {
        var temp={};
        temp[item.item] = {
          title:item.item
       }
        Object.assign(obj,temp);
      })
      //CAREUS-60296, Google not supporting to create the list with only one item
      //TODO : need to check better ways to handle this
      if(items.length===1) {
        var temp = {};
        temp[constants.operators.space] = {
          title : constants.operators.space
        }
        Object.assign(obj,temp);
      }
        return obj;
    },
    whereToFindYesSingle : function(agent, context){
      this.agent = agent;
      this.context = context;
      var data = agent.context.get(WhereToFind.CONTEXTS.WHERE_TO_FIND_YES_OR_NO_SINGLE).parameters;
      var matchedItem = data.items[0];
      return this.outputWhereToFind(constants.WHERE_TO_FIND_TEXT, data.quizletQuestionResponseId, matchedItem.item, matchedItem, [], data);
    },
    selectItem : function(agent, context) {
      var data = agent.context.get(WhereToFind.CONTEXTS.ACTIONS_INTENT_OPTION);
      var askedItem = data.parameters.OPTION;
      var contextData  = agent.context.get(WhereToFind.CONTEXTS.WHERE_TO_FIND_YES_OR_NO);
      var [item, text, responseId] = this.getWhereToFindText(contextData.parameters.items, askedItem, constants.responseIds.RESPONSE_NOT_FOUND);
      text = text.replace(constants.ITEM_PLACEHOLDER,item.item).replace(constants.LOCATION_PLACEHOLDER,item.location).replace(constants.NOTE_PLACEHOLDER,((item.note)?item.note:''));
      context.resetContext(agent);
      context.sendReply(agent,text,constants.type.NO_DEFAULT_QUESTION,contextData,contextData.quizletQuestionResponseId);
    },
    setHandlers: function (intentMap, context){
      intentMap.set('Where do I find', function(agent){
        return this.init(agent, context);
      }.bind(this));
      intentMap.set('Where to find -yes', function(agent){
        return this.whereToFindYes(agent, context);
      }.bind(this));
      intentMap.set('Where to find -no', context.noConfirmation);
      intentMap.set('Where to find - single - yes', function(agent){
        return this.whereToFindYesSingle(agent, context);
      }.bind(this));
      intentMap.set('Where to find - single - no', context.noConfirmation);
      intentMap.set('select item', function(agent){
        return this.selectItem(agent, context);
      }.bind(this));
    }
  }
})();