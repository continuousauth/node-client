# @continuous-auth/client

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/continuousauth/node-client/CI?label=CI&logo=github&style=for-the-badge)
[![GitHub Workflow Status](https://img.shields.io/badge/CFA-Enabled-success?style=for-the-badge)](https://github.com/continuousauth)

This module expects to be run in a [Supported CI Environment](https://docs.continuousauth.dev/usage/circleci).  It infers a lot of variables from environment variables, these config variables are outlined below.

## Config

* `CFA_PROJECT_ID` - The ID of your project on CFA
* `CFA_SECRET` - The secret assoicated with your project on CFA, you get this from the [CFA Dashboard](https://continuousauth.dev)

## API

### `getOtp()`

Returns `Promise<string>`.

This promise eventually resolves with a valid OTP code, please be aware that this code is user provided and therefore may have been entered incorrectly.  You also need to use OTP codes quite quickly as they typically expire within 30 seconds.

## Example

```js
// Publish the package in the CWD with an OTP code from CFA
import { getOtp } from '@continuous-auth/client';
import { spawnSync } from 'child_process';

spawnSync('npm', ['publish', '--otp', await getOtp()])
```
