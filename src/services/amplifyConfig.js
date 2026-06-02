import { Amplify } from 'aws-amplify';

/**
 * Minimal Amplify setup when using FaceLivenessDetectorCore + backend STS credentials.
 * Cognito is not required for this flow.
 */
export function configureAmplify() {
  Amplify.configure({});
}
