import { apiPath } from 'config'

export const SERVER_BASE_URL = apiPath;
export const APP_NAME = `Conduit`;
export const ARTICLE_QUERY_MAP = {
  "tab=feed": `${SERVER_BASE_URL}/articles/feed`,
  "tab=tag": `${SERVER_BASE_URL}/articles/tag`
};
export const DEFAULT_PROFILE_IMAGE = `https://static.productionready.io/images/smiley-cyrus.jpg`;
export const DEFAULT_LIMIT = 10;
