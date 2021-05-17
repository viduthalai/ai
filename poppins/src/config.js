const irisHostname = process.env.IRIS_MONOLITH_HOSTNAME || 'localhost';
var hostUrl;
if (irisHostname === 'localhost') {
  hostUrl = 'http://localhost:8080';
} else {
  hostUrl = 'https://' + irisHostname;
}

const config = {
  appName: 'Poppins',
  env: process.env.NODE_ENV || 'development',
  stack: process.env.STACK || 'localhost',
  port: process.env.PORT || '8000',
  careProxyUrl: 'http://proxy:55555',
  metrics: {
    status: 1,
    name: process.env.METRICS_NAME || '',
    port: process.env.METRICS_PORT || 2003,
    host: process.env.METRICS_HOST || 'metricproxy',
    dimensions: {
    	stack: process.env.STACK || 'localhost',
    	service: 'poppins'
    },
    graphiteReporterTimeOut: 2000
  },
  pixelEndpoint: process.env.PIXEL_ENDPOINT || 'https://pixel.uat39.carezen.net/analytics',
  careApiKey: process.env.MY_API_KEY || '2LZ3yj2Iydfn6HxwmwQdxyZzxWRDDzsZpLJLVMlYpzwx',
  assistantWelcomeEndpoint: hostUrl + '/platform/spi/assistant/welcomeIntent',
  assistantAnswerEndpoint: hostUrl +  '/platform/spi/assistant/answer',
  assistantRoutinesEndpoint: hostUrl +  '/platform/spi/assistant/routines',
  assistantEmergencyContactEndpoint: hostUrl + '/platform/spi/assistant/emergencyContact',
  assistantWhereToFindEndpoint: hostUrl + '/platform/spi/assistant/whereToFind'
};

export default config;
