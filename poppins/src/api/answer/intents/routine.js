/* eslint-disable func-names */
import util from 'util';
import config from '../../../config';
import textUtil from '../../../utils/text';
import { constants, Routines } from '../../../api/common/responses';

module.exports = (function () {
  return {
    init: function (agent, context) {
      this.agent = agent;
      this.context = context;

      return this.context.getReply(config.assistantRoutinesEndpoint, function (data) {
        this.data = data;
        var text, responseId = constants.responseIds.RESPONSE_NOT_FOUND;
        var parameters = this.context.query.parameters;
        var routineTime = parameters['routine-time'];
        var number = parameters['number'];
        this.availableRoutines = Object.keys(data.routines);
        if (this.availableRoutines.length === 0){
          // Didn't get any routines
          text = util.format(Routines.NONE_SPECIFIED,
                             data.seekerFirstName);
          this.outputRoutine(text, responseId, true);
        } else {
          // Got routines from the seeker
          if (routineTime){
            // return routine corresponding to routineTime
            [text, responseId] = this.getRoutineText(data.routines, routineTime);
          } else if (number && number[0]){
            // return routine at the given index
            var routineIndex = number[0]-1;
            if(this.availableRoutines.length > routineIndex){
              [text, responseId] = this.getRoutineText(data.routines, this.availableRoutines[routineIndex]);
            } else {
              text = util.format(Routines.NOT_FOUND,
                                 data.seekerFirstName,
                                 `<say-as interpret-as="ordinal">${number[0]}</say-as>`,
                                 textUtil.commaJoiner(this.availableRoutines, " or "),
                                 textUtil.commaJoiner(this.availableRoutines, " or "));
            }
          } else {
            // user's selection wasn't received
            if(this.availableRoutines.length === 1){
              text = Routines.NONE_REQUESTED_SINGLE;
              agent.context.set(Routines.CONTEXTS.followup_single, 1, data);
            } else {
              text = Routines.NONE_REQUESTED_MULTI;
            }
            text = util.format(text,
                               textUtil.commaJoiner(this.availableRoutines, " or "));
          }
          /*
           * If the routine is still not found, invoke the fallback handler
           */
          if(responseId === constants.responseIds.RESPONSE_NOT_FOUND){
            return this.context.updateFailCount(agent, Routines.CONTEXTS.followup,
              this.outputRoutine.bind(this, text, responseId, false)
            );
          } else {
            this.outputRoutine(text, responseId, true);
          }
        }
        return;
      }.bind(this));
    },
    outputRoutine: function (text, responseId, handled) {
      if (!handled) {
        this.context.sendReply(this.agent, text, constants.type.NO_DEFAULT_QUESTION, this.data, responseId);
      } else {
        this.context.resetContext(this.agent);
        this.context.sendReply(this.agent, text, constants.type.ADD_DEFAULT_QUESTION, this.data, responseId);
      }
    },
    getRoutineText: function (routineMap, routine) {
      var foundRoutine = routineMap[routine];
      if(foundRoutine){
        var text = util.format(Routines.FOUND,
                               routine,
                               foundRoutine.text);
        return [text, foundRoutine.responseId];
      }
      var text = util.format(Routines.NOT_FOUND,
                             this.data.seekerFirstName,
                             routine,
                             textUtil.commaJoiner(this.availableRoutines, " or "),
                             textUtil.commaJoiner(this.availableRoutines, " or "));
      return [text, constants.responseIds.RESPONSE_NOT_FOUND];
    },
    routineYes: function (agent, context){
      var data = agent.context.get(Routines.CONTEXTS.followup_single).parameters;
      var routineName = Object.keys(data.routines)[0];
      var routine = data.routines[routineName];
      var text = util.format(Routines.FOUND,
                             routineName,
                             routine.text);
      return context.sendReply(agent, text, constants.type.ADD_DEFAULT_QUESTION, data, routine.responseId);
    },
    setHandlers: function (intentMap, context){
      intentMap.set('Daily Routine', function(agent){
        return this.init(agent, context);
      }.bind(this));
      intentMap.set('Daily Routine - select.number', function(agent){
        return this.init(agent, context);
      }.bind(this));
      intentMap.set('Daily Routine - yes', function(agent){
        return this.routineYes(agent, context);
      }.bind(this));
      intentMap.set('Daily Routine - no', context.noConfirmation);
    }
  };
})();