import { npmPublish } from './npm/npm-client';


describe('Publish NPM package', () => {

    const childProcess = require('child_process');

    beforeEach(() => {
        spyOn(childProcess, 'spawnSync').and.returnValues({
            status: 0
        });
    });

    it('should call the npm publish command with the right arguments', async () => {

        npmPublish('dist/mosaic', 'latest');

        expect(childProcess.spawnSync).toHaveBeenCalledTimes(1);

        expect(childProcess.spawnSync).toHaveBeenCalledWith(
            'npm',
            ['publish', '--access', 'public', '--tag', 'latest'],
            {
                cwd: 'dist/mosaic',
                shell: true
            }
        );
    });

    // TODO
    xit('should create a .npmrc', async () => {
        process.env.NPM_TOKEN = 'my-token';

    });
});
