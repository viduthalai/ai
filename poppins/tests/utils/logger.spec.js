import {logger, requestLogger, errorLogger} from '../../src/utils/logger';

describe('/src/util/logger', function () {
    it('should logger be defined', function () {
        expect(logger).toBeDefined();
    });
    it('should requestLogger be defined', function () {
        expect(requestLogger).toBeDefined();
    });
    it('should errorLogger be defined', function () {
        expect(errorLogger).toBeDefined();
    });
});

