/* eslint-disable guard-for-in */
/* eslint-disable vars-on-top */
/* eslint-disable func-names */
import metrics from 'metrics';
import { logger } from './logger';
import util from 'util';

var GraphiteReporter = metrics.GraphiteReporter,
	Histogram = metrics.Histogram;

// TODO: parameterize this as well
// used to pass the metric type dimension
var metricTypeDim = "metrictype";
// valid metric types
const Gauge = "gauge", Count = "count", Counter = "cumulative_counter";

/**
 * A custom reporter that sends metrics with dimensions to a graphite server on the carbon
 * tcp interface. Extends metrics.GraphiteReporter
 * @param {Report} registry report instance whose metrics to report on.
 * @param {String} prefix A string to prefix on each metric (i.e. app.hostserver)
 * @param {String} host The ip or hostname of the target graphite server.
 * @param {String} port The port graphite is running on, defaults to 2003 if not specified.
 * @param {Object} key-value map of common dimensions for all metrics
 * @constructor
 * @author Alexander Volfson
 */
function GraphiteReporterWithDimensions(registry, prefix, host, port, dimensions) {
	  GraphiteReporterWithDimensions.super_.call(this, registry, prefix, host, port);
	  this.dimensions = dimensions || {};
}

util.inherits(GraphiteReporterWithDimensions, GraphiteReporter);

/**
 * Override start() so that we can keep track of whether the reporter is reconnecting
 * See: https://github.com/mikejihbe/metrics/blob/master/reporting/graphite-reporter.js#L26
 */
var reconnecting = false;
GraphiteReporterWithDimensions.prototype.start = function(intervalInMs) {
	GraphiteReporterWithDimensions.super_.prototype.start.call(this, intervalInMs);
	this.socket.on('error', function(exc) {
		reconnecting = true;
		logger.debug('reconnecting...');
	});
	this.socket.on('connect', function(exc) {
		reconnecting = false;
		logger.debug('connected...');
	});
};

/**
 * Override send to drop the leading '.' if there is no prefix and pass dimensions
 */
GraphiteReporterWithDimensions.prototype.send = function(name, value, timestamp, type) {
	if(reconnecting) {
		return;
	}
	
	// drop the '.' if there is no prefix
	var format = '%s' + (this.prefix ? '.' : '') + '%s%s %s %s\n';
	
	// transform dimensions into commakeys format
	var dimensions = Object.assign( {}, this.dimensions );
	if(type){
		dimensions[metricTypeDim] = type;
	}
	var commakeys = generateCommaKeys(dimensions);
	
	this.socket.write(util.format(format, this.prefix, name, commakeys, value, timestamp));
};

GraphiteReporterWithDimensions.prototype.reportTimer = function(timer, timestamp) {
	GraphiteReporterWithDimensions.super_.prototype.reportTimer.call(this, timer, timestamp);
	var send = this.send.bind(this);
	send(util.format('%s.%s', timer.name, 'count'), timer.count(), timestamp, Counter);
	send(util.format('%s.%s', timer.name, 'mean_rate'), timer.meanRate(), timestamp);
	send(util.format('%s.%s', timer.name, 'm1_rate'), timer.oneMinuteRate(), timestamp);
	send(util.format('%s.%s', timer.name, 'm5_rate'), timer.fiveMinuteRate(), timestamp);
	send(util.format('%s.%s', timer.name, 'm15_rate'), timer.fifteenMinuteRate(), timestamp);

	this.reportHistogram(timer, timestamp);
}

GraphiteReporterWithDimensions.prototype.reportHistogram = function(histogram, timestamp) {
	var send = this.send.bind(this);

	var isHisto = Object.getPrototypeOf(histogram) === Histogram.prototype;
	if (isHisto) {
	  // send count if a histogram, otherwise assume this metric is being
	  // printed as part of another (like a timer).
	  send(util.format('%s.%s', histogram.name, 'count'), histogram.count, timestamp);
	}

	var percentiles = histogram.percentiles([.50,.75,.95,.98,.99,.999]);
	send(util.format('%s.%s', histogram.name, 'min'), isHisto? histogram.min : histogram.min(), timestamp);
	send(util.format('%s.%s', histogram.name, 'mean'), histogram.mean(), timestamp);
	send(util.format('%s.%s', histogram.name, 'max'), isHisto ? histogram.max: histogram.max(), timestamp);
	send(util.format('%s.%s', histogram.name, 'stddev'), histogram.stdDev(), timestamp);
	send(util.format('%s.%s', histogram.name, '50th'), percentiles[.50], timestamp);
	send(util.format('%s.%s', histogram.name, '75th'), percentiles[.75], timestamp);
	send(util.format('%s.%s', histogram.name, '95th'), percentiles[.95], timestamp);
	send(util.format('%s.%s', histogram.name, '98th'), percentiles[.98], timestamp);
	send(util.format('%s.%s', histogram.name, '99th'), percentiles[.99], timestamp);
	send(util.format('%s.%s', histogram.name, '999th'), percentiles[.999], timestamp);
}

/**
 * transform dimensions into commakeys format: [KEY:VALUE,KEY:VALUE]
 * @see https://github.com/signalfx/metricproxy#graphite-dimensions
 */
function generateCommaKeys(dimensions){
	var commakeys = Object.keys(dimensions)
						  .map(key => key+":"+dimensions[key])
						  .join(",");
	if (commakeys){
		commakeys = "[" + commakeys + "]";
	}
	return commakeys;
}

module.exports = GraphiteReporterWithDimensions;