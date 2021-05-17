/* eslint-disable func-names */
import { logger } from '../../utils/logger';
import Assistant from './assistant';

const Answer = (function() {
  let get = function(req, res) {
    let id = req.params.id;
    if (id === 'webhook') {
      Assistant.init(req, res);
    } else {
      let error = id + ' is not a valid param';
      res.status(500).send({
        error: error
      });
      logger.error(new Error(error));
    }
  };
  return { get: get };
})();

export default Answer;
