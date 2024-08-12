import axios from 'axios';

import { PRIMARY_CFA_HOST } from './constants';
import { requestThroughCircleCI } from './circleci';
import { requestThroughGitHubActions } from './github';

const getConfig = () => {
  const CFA_HOST = process.env.CFA_HOST || PRIMARY_CFA_HOST;
  const CFA_SECRET = process.env.CFA_SECRET;

  if (!CFA_SECRET) {
    throw new Error('Required env var "CFA_SECRET" is missing or empty');
  }

  const CFA_PROJECT_ID = process.env.CFA_PROJECT_ID;
  if (!CFA_PROJECT_ID) {
    throw new Error('Requested env var "CFA_PROJECT_ID" is missing or empty');
  }

  return { CFA_HOST, CFA_SECRET, CFA_PROJECT_ID };
};

const getClient = () => {
  const { CFA_HOST, CFA_SECRET } = getConfig();

  return axios.create({
    baseURL: CFA_HOST,
    headers: {
      Authorization: `bearer ${CFA_SECRET}`,
    },
    validateStatus: () => true,
  });
};

export const validateConfiguration = async () => {
  const { CFA_PROJECT_ID } = getConfig();
  const cfaClient = getClient();

  let slug = '';
  if (process.env.CIRCLECI) {
    slug = 'circleci';
  } else if (process.env.GITHUB_ACTIONS) {
    slug = 'github';
  } else {
    throw new Error('Unsupported CI provider, currently we only support CircleCI');
  }

  const response = await cfaClient.post(`/api/request/${CFA_PROJECT_ID}/${slug}/test`, {
    buildNumber: parseInt(process.env.CIRCLE_BUILD_NUM || '-1', 10),
  });
  if (response.status !== 200) {
    console.error(response.data);
    throw new Error(
      'Your configuration for Continuous Auth is invalid, please check your config and try again',
    );
  }
};

export const getOtp = async () => {
  const { CFA_PROJECT_ID } = getConfig();
  const cfaClient = getClient();

  if (process.env.CIRCLECI) {
    const request = await requestThroughCircleCI(cfaClient, CFA_PROJECT_ID);
    return request.response;
  } else if (process.env.GITHUB_ACTIONS) {
    const request = await requestThroughGitHubActions(cfaClient, CFA_PROJECT_ID);
    return request.response;
  } else {
    throw new Error('Unsupported CI provider, currently we only support CircleCI and TravisCI');
  }
};
