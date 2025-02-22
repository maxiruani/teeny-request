/*!
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from 'assert';
import * as http from 'http';
import * as https from 'https';
import * as sinon from 'sinon';
import {getAgent} from '../src/agents';

// tslint:disable-next-line variable-name
const HttpProxyAgent = require('http-proxy-agent');
// tslint:disable-next-line variable-name
const HttpsProxyAgent = require('https-proxy-agent');

describe('agents', () => {
  const httpUri = 'http://example.com';
  const httpsUri = 'https://example.com';
  const sandbox = sinon.createSandbox();

  afterEach(() => sandbox.restore());

  describe('getAgent', () => {
    const defaultOptions = {uri: httpUri};

    it('should return undefined by default', () => {
      const agent = getAgent(httpUri, defaultOptions);
      assert.strictEqual(agent, undefined);
    });

    describe('proxy', () => {
      const envVars = [
        'http_proxy',
        'https_proxy',
        'HTTP_PROXY',
        'HTTPS_PROXY',
      ];

      describe('http', () => {
        const uri = httpUri;
        const proxy = 'http://hello.there:8080';

        it('should respect the proxy option', () => {
          const options = Object.assign({proxy}, defaultOptions);
          const agent = getAgent(uri, options);
          assert(agent instanceof HttpProxyAgent);
        });

        envVars.forEach(envVar => {
          it(`should respect the ${envVar} env var`, () => {
            process.env[envVar] = proxy;
            const agent = getAgent(uri, defaultOptions);
            assert(agent instanceof HttpProxyAgent);
            delete process.env[envVar];
          });
        });
      });

      describe('https', () => {
        const uri = httpsUri;
        const proxy = 'https://hello.there:8080';

        it('should respect the proxy option', () => {
          const options = Object.assign({proxy}, defaultOptions);
          const agent = getAgent(uri, options);
          assert(agent instanceof HttpsProxyAgent);
        });

        envVars.forEach(envVar => {
          it(`should respect the ${envVar} env var`, () => {
            process.env[envVar] = proxy;
            const agent = getAgent(uri, defaultOptions);
            assert(agent instanceof HttpsProxyAgent);
            delete process.env[envVar];
          });
        });
      });
    });

    describe('forever', () => {
      describe('http', () => {
        const uri = httpUri;
        const options = Object.assign({forever: true}, defaultOptions);

        it('should return an http Agent', () => {
          const agent = getAgent(uri, options)!;
          assert(agent instanceof http.Agent);
        });

        it('should cache the agent', () => {
          const agent1 = getAgent(uri, options);
          const agent2 = getAgent(uri, options);
          assert.strictEqual(agent1, agent2);
        });
      });

      describe('https', () => {
        const uri = httpUri;
        const options = Object.assign({forever: true}, defaultOptions);

        it('should return an http Agent', () => {
          const agent = getAgent(uri, options)!;
          assert(agent instanceof http.Agent);
        });

        it('should cache the agent', () => {
          const agent1 = getAgent(uri, options);
          const agent2 = getAgent(uri, options);
          assert.strictEqual(agent1, agent2);
        });
      });
    });
  });
});
