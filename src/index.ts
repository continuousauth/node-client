import axios from 'axios';

import { PRIMARY_CFA_HOST } from './constants';
import { requestThroughCircleCI } from './circleci';
import { requestThroughTravisCI } from './travisci';

export const getOtp = async () => {
  const CFA_HOST = process.env.CFA_HOST || PRIMARY_CFA_HOST;
  const CFA_SECRET = process.env.CFA_SECRET;

  if (!CFA_SECRET) {
    throw new Error('Required env var "CFA_SECRET" is missing or empty');
  }

  const cfaClient = axios.create({
    baseURL: CFA_HOST,
    headers: {
      Authorization: `bearer ${CFA_SECRET}`,
    },
    validateStatus: () => true,
  });

  const projectId = process.env.CFA_PROJECT_ID;
  if (!projectId) {
    throw new Error('Requested env var "CFA_PROJECT_ID" is missing or empty');
  }

  if (process.env.CIRCLECI) {
    const request = await requestThroughCircleCI(cfaClient, projectId);
    return request.response;
  } else if (process.env.TRAVIS) {
    const request = await requestThroughTravisCI(cfaClient, projectId);
    return request.response;
  } else {
    throw new Error('Unsupported CI provider, currently we only support CircleCI');
  }
};
