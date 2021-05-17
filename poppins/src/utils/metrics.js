/* eslint-disable guard-for-in */
/* eslint-disable vars-on-top */
/* eslint-disable func-names */
import metrics from 'metrics';
import os from 'os';
import config from '../config';
import { logger } from './logger';
import GraphiteReporter from './graphite-reporter-with-dimensions';

const Metrics = (function() {
  var responseTimeMetricName = 'ResponseTime';
  var careEndPointMetricName = 'CareEndPointResponseTime';
  var rtPrefix =  '.Status.';
  var sourceDimension = "sf_source";

  var Report = new metrics.Report;
  var whiteListUrls = ['/assistant/webhook', '/platform/spi/assistant/answer'];

  return {
    init: function() {
      console.log('Setting Metrics configs');
      if (config.metrics.status) {
        this.setGraphiteReporter();
      }
    },
    setGraphiteReporter: function() {
      console.log('Setting Graphite logger');
      /***Logging to Graphite server console***/
      config.metrics.dimensions[sourceDimension] = os.hostname();
      let reporter = new GraphiteReporter(Report, config.metrics.name, config.metrics.host,
        config.metrics.port, config.metrics.dimensions);

      if (config.env === 'development') {
        reporter.on('log', function(level, msg, exc) {
          if (exc) {
            console.log('%s -- %s (%s`)', level, msg, exc);
          } else {
            console.log('%s -- %s', level, msg);
          }
        });
      }

      reporter.start(config.metrics.graphiteReporterTimeOut);
    },

    serverRequestTimerReport: function(duration, req, res, err) {
      let metricName = this.getMetricName(responseTimeMetricName + rtPrefix, req, res, err);
      this.setReport(metricName, duration);

      // console.log(metricName, this.getReport(metricName).meter);
      //console.log('All Metrics', this.getMetrics());
    },
    setCareApiTimerReport: function(duration, req, res, err) {
      let metricName = this.getMetricName(careEndPointMetricName + rtPrefix, req, res, err);
      this.setReport(metricName, duration);
    },
    setReport: function(metricName, duration) {
      let timer = this.getTimer(metricName);
      // convert milliseconds to nanoseconds to remain consistent with other metric tracking
      timer.update(duration * 1000000);
    },
    getMetricName: function(name, req, res, err) {
      let metricName = name + res.statusCode;
      let endPointName = this.convertToMetricNameFormat(req.url);

      // If endpoint name matched in either include list or white list then use it
      if (endPointName !== null) {
        metricName = metricName + '.' + req.method + endPointName;
      }
      logger.debug('metric name = ' + metricName);
      return metricName;
    },
    convertToMetricNameFormat: function(requestPath) {
      let path = requestPath.split('/').join('.');
      if (path[path.length - 1] === '.') {
        path = path.slice(0, -1);
      }
      path =  path.replace('platform.spi.', '');

      //whiteListUrls.indexOf(path) > -1
      logger.debug('Request path = ' + requestPath);
      return path;

    },
    getTimer: function(name, dimensions) {
      logger.debug('getting metric name = ' + name);
      var trackedMetrics = Report.getMetric(name);

      if (!trackedMetrics) {
        trackedMetrics = new metrics.Timer;
        Report.addMetric(name, trackedMetrics);
      }

      return Object.assign(trackedMetrics, dimensions);
    },
    getReport: function(name) {
      let trackedMetrics = Report.getMetric(name);
      logger.debug(trackedMetrics);
      return trackedMetrics;
    },
    getMetricDimensions: function(req, res, err) {
      let dimensions = {
        method: req.method,
        statusCode: res.statusCode,
        url: req.url,
        error: ''
      };

      if (err) {
        dimensions.error = err;
      }
      return dimensions;
    },
    getMetrics: function() {
      var meters = [];
      var timers = [];
      var counters = [];
      var histograms = [];
      var gauges = [];

      var trackedMetrics = Report.trackedMetrics;

      // Flatten metric name to be namespace.name is has a namespace and separate out metrics
      // by type.
      for (var namespace in trackedMetrics) {
        for (var name in trackedMetrics[namespace]) {
          var metric = trackedMetrics[namespace][name];
          if (namespace.length > 0) {
            metric.name = namespace + '.' + name;
          } else {
            metric.name = name;
          }
          if (metric instanceof metrics.Meter) {
            meters.push(metric);
          } else if (metric instanceof metrics.Timer) {
            timers.push(metric);
          } else if (metric instanceof metrics.Counter) {
            counters.push(metric);
          } else if (metric instanceof metrics.Histogram) {
            histograms.push(metric);
          } else if (metric instanceof metrics.Gauge) {
            gauges.push(metric);
          }
        }
      }

      return { meters: meters, timers: timers, counters: counters, histograms: histograms, gauges: gauges };
    }
  };
})();

Metrics.init();

export default Metrics;
