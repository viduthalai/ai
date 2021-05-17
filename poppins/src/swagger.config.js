const swaggerConfig = {
  swagger: '2.0',
  info: {
    version: '1.0.0',
    title: 'Poppins API'
  },
  host: '',
  basePath: '/',
  tags: [
    {
      name: 'Webhook',
      description: 'Assistant call to poppins server'
    }
  ],
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  paths: {
    '/assistant/webhook': {
      post: {
        tags: ['Webhook'],
        description:
          'post call from assitant to poppins to get answer from care.com',
        parameters: [
          {
            name: 'user',
            in: 'body',
            schema: {
              $ref: '#/definitions/Webook'
            }
          }
        ],
        produces: ['application/json'],
        responses: {
          200: {
            description: 'Get fullfillmentText',
            schema: {
              $ref: '#/definitions/Webook'
            }
          }
        }
      }
    }
  },
  definitions: {
    Webook: {
      required: ['responseId', 'queryResult'],
      properties: {
        responseId: {
          type: 'string',
          uniqueItems: true,
          example: '1 cc6caba - 3961 - 44 df - 9 f21 - 0 c2b37058d35'
        },
        queryResult: {
          type: 'object',
          example: {
            queryText: 'feedback',
            action: 'feedback.action',
            parameters: {
              'resort-location': '',
              rating: '',
              comments: ''
            },
            allRequiredParamsPresent: true,
            intent: {
              name:
                'projects / feedbackagent - d0620 / agent / intents / cd434bae - 67 b5 - 4 a10 - 91 ae - c6f8287b97cf',
              displayName: 'Feedback Intent'
            },
            intentDetectionConfidence: 0.36,
            languageCode: 'en'
          }
        },
        originalDetectIntentRequest: {
          type: 'object',
          example: {
            payload: {
              user: {
                accessToken: 'b0513890-e341-4f69-81e6-45962d715760'
              }
            }
          }
        },
        session: {
          type: 'string',
          example:
            'projects / feedbackagent - d0620 / agent / sessions / e15c2b64 - 19 fe - 6 ee3 - d7c9 - 28 c05b61a316'
        }
      }
    }
  }
};

export default swaggerConfig;
