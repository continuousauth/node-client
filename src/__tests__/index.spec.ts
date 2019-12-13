import { getOtp } from '../index';
import { requestThroughCircleCI } from '../circleci';
import { requestThroughTravisCI } from '../travisci';

jest.mock('../circleci');
jest.mock('../travisci');

const mockedRequestThroughCircleCI = requestThroughCircleCI as jest.Mock;
const mockedRequestThroughTravisCI = requestThroughTravisCI as jest.Mock;

describe('@continuous-auth/client', () => {
  let env: NodeJS.ProcessEnv;

  beforeEach(() => {
    env = { ...process.env };
  });
  afterEach(() => {
    process.env = env;
  });

  it('should throw an error when CFA_SECRET is not set', async () => {
    await expect(getOtp()).rejects.toMatchSnapshot();
  });

  it('should throw an error when CFA_PROJECT_ID is not set', async () => {
    process.env.CFA_SECRET = 'test';
    await expect(getOtp()).rejects.toMatchSnapshot();
  });

  it('should throw an error on an unsupported CI platform', async () => {
    process.env.CFA_SECRET = 'test';
    process.env.CFA_PROJECT_ID = '123';
    await expect(getOtp()).rejects.toMatchSnapshot();
  });

  it('should use the circleci provider on circleci', async () => {
    process.env.CFA_SECRET = 'secret';
    process.env.CFA_PROJECT_ID = '123';
    process.env.CIRCLECI = 'true';
    mockedRequestThroughCircleCI.mockReturnValue(Promise.resolve({ response: 'example token' }));
    const token = await getOtp();
    expect(token).toEqual('example token');
  });

  it('should use the travisci provider on travisci', async () => {
    process.env.CFA_SECRET = 'secret';
    process.env.CFA_PROJECT_ID = '123';
    process.env.TRAVIS = 'true';
    mockedRequestThroughTravisCI.mockReturnValue(Promise.resolve({ response: 'travis token' }));
    const token = await getOtp();
    expect(token).toEqual('travis token');
  });
});
