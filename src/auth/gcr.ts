// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
import {auth, GoogleAuthOptions} from 'google-auth-library';

import {DockerAuthResult} from '../credentials-helper';
import {ImageLocation} from '../image-specifier';

// i dont know what the options will be yet
// tslint:disable-next-line:no-any
export const handler =
    async(image: ImageLocation, scope: string, options: GoogleAuthOptions):
        Promise<DockerAuthResult> => {
          // google auth options:
          // https://github.com/googleapis/google-auth-library-nodejs/blob/master/src/auth/googleauth.ts#L58

          // expects GOOGLE_APPLICATION_CREDENTIALS env or options
          const resolvedOptions: GoogleAuthOptions = options || {};
          if (!('scopes' in resolvedOptions)) {
            // Depending on `scope` that describes push and/or pull
            // capabilities, the Google services scope need to be specified to
            // authenticate for reading or reading and writing to the Google
            // Container Registry.
            //
            // Note: `scope` is either `pull` or `pull,push` and specifies
            // reading or reading and writing to a registry respectively.
            resolvedOptions.scopes = scope.indexOf('push') > -1 ?
                'https://www.googleapis.com/auth/devstorage.read_write' :
                'https://www.googleapis.com/auth/devstorage.read_only';
          }
          const client = await auth.getClient(resolvedOptions);
          const token = (await client.getAccessToken()).token || undefined;

          return {Username: '_token', Secret: token, token};
        };