/* eslint-disable func-names */
import express from 'express';
import moment from 'moment';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.config';
import {logger, requestLogger, errorLogger} from './utils/logger';
import Metrics from './utils/metrics';
import routes from './api';
import config from './config';

const app = express();
let errorMessage;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Capturing express server response time
app.use(function(req, res, next) {
  const startTime = moment();
  res.on('finish', () => {

    //console.log(res)
    if (res.statusMessage !== 'OK') {
      errorMessage = res.statusMessage;
    }
    Metrics.serverRequestTimerReport(moment().diff(startTime), req, res, errorMessage);
    errorMessage = '';
  });
  next();
});


app.use(requestLogger);

//TODO:Vidu enable later
//app.use('/test/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', routes);
app.use(errorLogger);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  errorMessage = err.message;

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // add this line to include winston logging
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});


app.listen(config.port, () => {
  logger.debug('Welcome to Poppins!!!');
  logger.info('Server is running at: ' + config.stack + ':' + config.port);
});
