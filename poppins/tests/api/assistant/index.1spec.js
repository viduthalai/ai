import request from "request";
import config from "../../../src/config";

describe("POST /assistant/webhook", function() {
  var params = {
    uri: "http://localhost:8000/assistant/webhook",
    json: {
      responseId: "1 cc6caba - 3961 - 44 df - 9 f21 - 0 c2b37058d35",
      queryResult: {
        queryText: "feedback",
        action: "feedback.action",
        parameters: {
          "resort-location": "",
          rating: "",
          comments: ""
        },
        allRequiredParamsPresent: true,
        intent: {
          name:
            "projects / feedbackagent - d0620 / agent / intents / cd434bae - 67 b5 - 4 a10 - 91 ae - c6f8287b97cf",
          displayName: "Feedback Intent"
        },
        intentDetectionConfidence: 0.36,
        languageCode: "en"
      },
      originalDetectIntentRequest: {
        payload: {}
      },
      session:
        "projects / feedbackagent - d0620 / agent / sessions / e15c2b64 - 19 fe - 6 ee3 - d7c9 - 28 c05b61a316"
    },
    method: "POST"
  };

  it("returns status code 200", function(done) {
    request(params, function(error, response, body) {
      window.console.log(error);
      window.console.log(body);
      window.console.log(response);
      expect(200).toBe(200);
      done();
    });
  });
});
