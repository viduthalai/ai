/* eslint-disable func-names */
import request from 'request';
import moment from 'moment';

import config from '../config';
import { logger } from './logger';
import Metrics from './metrics';

const Api = (function() {
  var options = {
    headers: {
      'X-Care.com-APIKey': config.careApiKey
    },
    json: true
  };
  if (config.env !== 'development') {
    options.proxy = config.careProxyUrl;
  }
  return {
    request: function(req, callback) {
      try {
        options.uri = req.url;
        options.method = req.method || 'GET';
        options.json = req.data || {};
        options.headers['X-Care.com-AccessToken'] = req.data.accessToken;

        const startTime = moment();
        request(options, function(error, res, body) {
          if (res) {
            let metricsReq = { url: res.request.uri.pathname, method: req.method };
            Metrics.setCareApiTimerReport(moment().diff(startTime), metricsReq, res, error);
          }
          let data;
          let statusCode;
          if (error) {
            statusCode = 404;
            data = error;
          } else {
            statusCode = res.statusCode;
            data = body;
          }
          callback(statusCode, data);
        });
      } catch (error) {
        callback(403, error);
      }
    }
  };
})();

export default Api;
