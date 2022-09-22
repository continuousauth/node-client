import { requestThroughCircleCI, _setRetryIntervalForTesting } from '../circleci';
import { AxiosInstance } from 'axios';

describe('getProofThroughCircleCI', () => {
  let mockClient: {
    post: jest.Mock;
  };
  const client = () => mockClient as any as AxiosInstance;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockClient = {
      post: jest.fn(),
    };
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => null);
    _setRetryIntervalForTesting(10);
  });

  afterEach(() => {
    _setRetryIntervalForTesting(10000);
  });

  it('should error out if the start request fails', async () => {
    mockClient.post.mockReturnValue(
      Promise.resolve({
        status: 401,
      }),
    );
    await expect(requestThroughCircleCI(client(), '1')).rejects.toMatchSnapshot();
  });

  it('should log out the provided proof content', async () => {
    mockClient.post.mockReturnValue(
      Promise.resolve({
        status: 200,
        data: {
          proof: 'abcdefg',
        },
      }),
    );
    await requestThroughCircleCI(client(), '1');
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenNthCalledWith(1, '\n\n\nProof:');
    expect(consoleSpy).toHaveBeenNthCalledWith(2, 'abcdefg');
  });

  it('should error out if the validation request fails', async () => {
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        data: {
          proof: 'my_proof',
        },
      }),
    );
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 403,
      }),
    );
    await expect(requestThroughCircleCI(client(), '1')).rejects.toMatchSnapshot();
  });

  it('should error out if the acquire request fails', async () => {
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        data: {
          proof: 'my_proof',
        },
      }),
    );
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
      }),
    );
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 400,
      }),
    );
    await expect(requestThroughCircleCI(client(), '1')).rejects.toMatchSnapshot();
  });

  it('should eventually error out if one of the acquire requests fails', async () => {
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        data: {
          proof: 'my_proof',
        },
      }),
    );
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
      }),
    );
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 204,
      }),
    );
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 400,
      }),
    );
    await expect(requestThroughCircleCI(client(), '1')).rejects.toMatchSnapshot();
  });

  it('should keep trying to acquire until content is available', async () => {
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        data: {
          proof: 'my_proof',
        },
      }),
    );
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
      }),
    );
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 204,
      }),
    );
    mockClient.post.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        data: {
          token: '12345',
        },
      }),
    );
    await expect(requestThroughCircleCI(client(), '1')).resolves.toEqual({ token: '12345' });
  });
});
