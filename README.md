# @continuous-auth/client

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/continuousauth/node-client/ci.yaml?branch=main&label=CI&logo=github)](https://github.com/continuousauth/node-client/actions/workflows/ci.yaml)
[![GitHub Workflow Status](https://img.shields.io/badge/CFA-Enabled-success)](https://github.com/continuousauth)
[![npm version](http://img.shields.io/npm/v/@continuous-auth/client.svg)](https://npmjs.org/package/@continuous-auth/client)

This module expects to be run in a [Supported CI Environment](https://docs.continuousauth.dev/usage/circleci).  It infers a lot of variables from environment variables, these config variables are outlined below.

## Config

* `CFA_PROJECT_ID` - The ID of your project on CFA
* `CFA_SECRET` - The secret assoicated with your project on CFA, you get this from the [CFA Dashboard](https://continuousauth.dev)

## API

### `getOtp()`

Returns `Promise<string>`.

This promise eventually resolves with a valid OTP code, please be aware that this code is user provided and therefore may have been entered incorrectly.  You also need to use OTP codes quite quickly as they typically expire within 30 seconds.

### `validateConfiguration()`

Returns `Promise<void>`.

This promise will resolve if your project ID and secret are a valid combination for the current CI provider.  It will be rejected if they are deemed invalid by the CFA service.

## Example

```js
// Publish the package in the CWD with an OTP code from CFA
import { getOtp } from '@continuous-auth/client';
import { spawnSync } from 'child_process';

spawnSync('npm', ['publish', '--otp', await getOtp()])
```
