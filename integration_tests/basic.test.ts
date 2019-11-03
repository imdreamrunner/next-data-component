import * as killPort from 'kill-port';
import * as Nightmare from 'nightmare';
import * as shell from 'shelljs';

const STARTUP_TIMEOUT = 30000;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('basic javascript next.js app', () => {
  beforeAll(() => {
    shell.cd(`${__dirname}/basic`);
    const pwd = shell.pwd();
    console.log(`Testing at ${pwd}`);

    if (process.env.NO_CACHE || !shell.test('-d', 'node_modules')) {
      console.log('Install dependencies.');
      shell.rm('-rf', 'node_modules');
      const npmInstall = shell.exec(`npm install`);
      expect(npmInstall.code).toBe(0);
    }
  });

  it('works correctly', async () => {
    jest.setTimeout(30000);

    shell.cd(`${__dirname}/basic`);
    const pwd = shell.pwd();
    console.log(`Testing at ${pwd}`);

    const build = shell.exec('npm run build');
    expect(build.code).toBe(0);

    const app = shell.exec('npm run start', { async: true });

    const startTime = Date.now();
    while (true) {
      const curl = shell.exec('curl http://localhost:3000', { silent: true });
      if (curl.stderr.indexOf('Connection refused') >= 0) {
        console.log('Waiting for app to be ready');
        await sleep(100);
      } else {
        break;
      }
      if (Date.now() - startTime > STARTUP_TIMEOUT) {
        app.kill('SIGINT');
        fail('Application is not successfully started.');
      }
    }

    console.log('Next.js app is ready. Start nightmare.');

    const nightmare = Nightmare({
      loadTimeout: 5000,
      executionTimeout: 5000,
      waitTimeout: 5000
    });

    console.log('Server-side rendering test');

    const serverMessage = await nightmare
      .goto('http://localhost:3000')
      .wait('#welcome-message')
      .evaluate(() => {
        const messageDom = document.getElementById('welcome-message');
        return messageDom && messageDom.innerHTML;
      });

    expect(serverMessage).toBe('Hello world from server');

    console.log('Browser rendering test');

    const browserMessage = await nightmare
      .goto('http://localhost:3000/about')
      .wait('#link-to-index')
      .click('#link-to-index')
      .wait('#welcome-message')
      .evaluate(() => {
        const messageDom = document.getElementById('welcome-message');
        return messageDom && messageDom.innerHTML;
      });

    expect(browserMessage).toBe('Hello world from browser');

    await nightmare.end();

    console.log('Killing next.js server. Please ignore the error below.');
    app.kill();
    await killPort(3000, 'tcp');
  });
});
