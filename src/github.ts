import { AxiosInstance } from 'axios';

export type CFARequest = {
  id: string;
  proof: string;
  response: string;
};

let retryInterval = 10000;

export const _setRetryIntervalForTesting = (n: number) => (retryInterval = n);

export const requestThroughGitHubActions = async (
  cfaClient: AxiosInstance,
  projectId: string,
): Promise<CFARequest> => {
  const startResponse = await cfaClient.post<CFARequest>(`/api/request/${projectId}/github`, {
    oidcToken: process.env.GITHUB_OIDC_TOKEN,
    buildUrl: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  });

  if (startResponse.status !== 200) {
    throw new Error(
      `Unexpected status when requesting otp on GitHub Actions: ${startResponse.status}`,
    );
  }

  const cfaRequest = startResponse.data;

  const validateResponse = await cfaClient.post(
    `/api/request/${projectId}/github/${cfaRequest.id}/validate`,
  );

  if (validateResponse.status !== 200) {
    throw new Error(
      `Unexpected status code when validating oidc on GitHub Actions: ${validateResponse.status}`,
    );
  }

  let acquireCode = 204;
  while (acquireCode === 204) {
    const acquireResponse = await cfaClient.post<CFARequest>(
      `/api/request/${projectId}/github/${cfaRequest.id}`,
    );
    acquireCode = acquireResponse.status;
    if (acquireCode === 200) return acquireResponse.data;
    // Check again in 10 seconds
    await new Promise(r => setTimeout(r, retryInterval));
  }

  throw new Error(`Unexpected status code while polling the CFA acquire endpoint: ${acquireCode}`);
};
