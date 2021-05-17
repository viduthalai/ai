
import config from '../src/config';
describe('/src/config', function () {

    it('should show Poppins', function () {
        expect(config.appName).toBe('Poppins');
    });

    it('should Env Defined', function () {
        expect(config.env).toBeDefined();
    });
    it('should stack be Defined', function () {
        expect(config.stack).toBeDefined();
    });
    it('should port be Defined', function () {
        expect(config.port).toBeDefined();
    });
    it('should careApiKey be Defined', function () {
        expect(config.env).toBeDefined();
    });
});

