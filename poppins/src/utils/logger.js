/* eslint-disable vars-on-top */
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, json } = format;
import expressWinston from 'express-winston';
import os from 'os';
import process from 'process';
import config from '../config';


//setting required info for all types of logs
const getBaseMeta = () => {
  return {
    appName: config.appName,
    stackName: config.stack,
    environment: config.env,
    host: os.hostname().replace('.use.dom.carezen.net', ''),
    platform: process.platform,
    pid: process.pid
  };
};

const enumerateErrorFormat = format(info => {
  Object.assign(info, getBaseMeta());
  // massage 'exception' and 'os' because loggly is not happy with our inconsistent usage
  info.exception = {value: info.exception};
  info.os = JSON.stringify(info.os);

  // Handle Errors neatly
  if (info.message instanceof Error) {
    info.message = Object.assign({
      message: info.message.message,
      stack: info.message.stack
    }, info.message);
  }
  if (info instanceof Error) {
    return Object.assign({
      message: info.message,
      stack: info.stack
    }, info);
  }
  return info;
});

// define the custom settings for each transport (Request, Error)
const loggerOptions = {
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    enumerateErrorFormat(),
    json()
  ),
  transports: [new transports.Console({
    handleExceptions: true
  })],
  exitOnError: false // not best practice
};

const options = {
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  transports: [new transports.Console()],
  statusLevels: true,
  requestFilter: function (req, propName) {
    if (propName == 'headers') {
      delete req[propName].cookie;
      delete req[propName]['accept-charset'];
    }
    return req[propName];
  },
  responseFilter: function (res, propName) {
    if (propName == 'statusCode') {
      return res[propName].toString();
    }
    return res[propName];
  },
  baseMeta: getBaseMeta()
};


// instantiate a new Winston Logger with the customs settings
var logger = createLogger(loggerOptions);
logger.level = (config.env === 'development') ? 'debug' : 'info';

//instantiate a Express Winston Logger a middleware to log your HTTP requests.
var requestLogger = expressWinston.logger(options);

//Using expressWinston.errorLogger(options) to create a middleware that log the errors of the pipeline.
var errorLogger = expressWinston.errorLogger(options);

// set default log level.
export { logger, requestLogger, errorLogger };
