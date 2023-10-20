import { Fetcher } from 'openapi-typescript-fetch'

import platform from 'platform'

import { SESSION_DOMAIN } from '../constants'
import type { components, paths } from './schema.gen'

import { version } from '../../package.json'

const client = Fetcher.for<paths>()

client.configure({
  baseUrl: `https://${SESSION_DOMAIN}`,
  init: {
    headers: {
      package_version: version,
      lang: 'js',
      engine: platform.name || 'unknown',
      lang_version: platform.version || 'unknown',
      system: platform.os?.family || 'unknown',
      publisher: 'e2b',
    },
  },
})

type ClientType = typeof client

export default client
export type { components, paths, ClientType }
