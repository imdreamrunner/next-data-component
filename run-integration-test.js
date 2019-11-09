const child_process = require('child_process');
const shell = require('shelljs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const main = async () => {
  // Install and start application
  shell.cd(`${__dirname}/examples/basic`);
  const pwd = shell.pwd();
  console.log(`Testing at ${pwd}`);

  if (process.env.NO_CACHE || !shell.test('-d', 'node_modules')) {
    console.log('Install dependencies.');
    shell.rm('-rf', 'node_modules');
    const npmInstall = shell.exec(`npm ci`);
    if (npmInstall.code !== 0) {
      throw new Error('unable to install dependencies.');
    }
  }

  // TODO also run test using npm run start
  const app = child_process.execFile('npm', ['run', 'dev']);

  while (true) {
    const curl = shell.exec('curl http://localhost:3000', { silent: true });
    if (curl.stderr.indexOf('Connection refused') >= 0) {
      console.log('waiting for app to be ready');
      await sleep(100);
    } else {
      break;
    }
  }

  // test
  shell.cd(`${__dirname}`);
  shell.exec('npm run integration-test');

  console.log('stopping app for testing');
  app.kill();

  process.exit(0);
};

main().catch(ex => {
  console.warn(ex);
  process.exit(1);
});
