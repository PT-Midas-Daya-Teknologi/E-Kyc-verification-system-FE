/**
 * AWS SDK v3 Credential Resolver
 * Provides temporary AWS credentials to AWS SDK clients
 */

let cachedCredentials = null;

/**
 * Set credentials globally for use by AWS SDK clients
 */
export function setCachedCredentials(credentials) {
  console.log('[credentialResolver] Caching credentials:', {
    hasAccessKeyId: !!credentials?.accessKeyId,
    hasSecretAccessKey: !!credentials?.secretAccessKey,
    hasSessionToken: !!credentials?.sessionToken,
  });
  cachedCredentials = credentials;
}

/**
 * Get the currently cached credentials
 */
export function getCachedCredentials() {
  const exists = !!cachedCredentials;
  const hasAccessKeyId = !!cachedCredentials?.accessKeyId;
  const hasSecretAccessKey = !!cachedCredentials?.secretAccessKey;
  const hasSessionToken = !!cachedCredentials?.sessionToken;
  
  console.log('[credentialResolver] getCachedCredentials() called:', {
    exists,
    hasAccessKeyId,
    hasSecretAccessKey,
    hasSessionToken,
    cachedCredentialsObject: cachedCredentials ? {
      accessKeyId: cachedCredentials.accessKeyId ? `${cachedCredentials.accessKeyId.substring(0, 10)}...` : 'MISSING',
      secretAccessKey: cachedCredentials.secretAccessKey ? '***REDACTED***' : 'MISSING',
      sessionToken: cachedCredentials.sessionToken ? `${cachedCredentials.sessionToken.substring(0, 20)}...` : 'MISSING',
      region: cachedCredentials.region
    } : null
  });
  
  return cachedCredentials;
}

/**
 * Create an AWS SDK v3 compatible credential provider
 * Returns a function that AWS SDK clients can use
 */
/**
 * Create an AWS SDK v3 compatible credential provider
 * Returns a function that AWS SDK clients can use
 */
export function createCredentialProvider() {
  console.log('[credentialResolver] createCredentialProvider() called - returning credential function');
  
  return async () => {
    console.log('[credentialResolver] ⏱️  CREDENTIAL PROVIDER FUNCTION INVOKED BY AMPLIFY');
    
    const creds = getCachedCredentials();
    
    // Validate all required fields
    if (!creds) {
      console.error('[credentialResolver] ❌ No credentials cached at all');
      throw new Error('Credentials not available');
    }
    
    const hasAccessKey = creds.accessKeyId && creds.accessKeyId.trim() !== '';
    const hasSecretKey = creds.secretAccessKey && creds.secretAccessKey.trim() !== '';
    const hasSessionToken = creds.sessionToken && creds.sessionToken.trim() !== '';
    
    console.log('[credentialResolver] Field validation:', {
      hasAccessKey,
      hasSecretKey,
      hasSessionToken,
    });
    
    if (!hasAccessKey || !hasSecretKey || !hasSessionToken) {
      console.error('[credentialResolver] ❌ Missing required credential fields:', {
        hasAccessKey,
        hasSecretKey,
        hasSessionToken,
        credentials: creds
      });
      throw new Error('Credentials not available');
    }

    console.log('[credentialResolver] ✅ Credentials valid, returning to AWS SDK');
    
    return {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
      expiration: undefined, // STS credentials include expiration
    };
  };
}
