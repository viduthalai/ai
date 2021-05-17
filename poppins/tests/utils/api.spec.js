import Api from "../../src/utils/api";
import config from "../../src/config";
import { logger } from "../../src/utils/logger";
describe("POST /utils/api", function () {
  var params = {
        json: {
          responseId: "1 cc6caba",
          session:
            "projects / feedbackagent "
        },
        method: "POST"
      };
    
    it("it is defined", function () {
        expect(Api.request).toBeDefined();
    });
    it("Throw an error", function () {
        expect(Api.request(params)).toBeUndefined();
    });
    
});
