
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UploadRequest {
  fileName: string;
  fileContent: string; // base64 encoded
  mimeType: string;
  folderId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileContent, mimeType, folderId }: UploadRequest = await req.json();
    
    console.log('Upload request received:', { fileName, mimeType, folderId });
    
    // Get service account credentials from secrets
    const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
    
    if (!serviceAccountEmail || !serviceAccountKey) {
      console.error('Missing Google Service Account credentials');
      throw new Error('Google Service Account credentials not configured');
    }

    console.log('Service account email:', serviceAccountEmail);

    // Parse the service account key (it should be a JSON string)
    let privateKey: string;
    try {
      if (serviceAccountKey.includes('{')) {
        // It's a JSON string, parse it
        const keyData = JSON.parse(serviceAccountKey);
        privateKey = keyData.private_key;
      } else {
        // It's already just the private key
        privateKey = serviceAccountKey.replace(/\\n/g, '\n');
      }
    } catch (parseError) {
      console.error('Error parsing service account key:', parseError);
      throw new Error('Invalid service account key format');
    }
    
    // Create JWT for Google API authentication
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = {
      alg: 'RS256',
      typ: 'JWT'
    };
    
    const jwtPayload = {
      iss: serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // Encode JWT
    const encoder = new TextEncoder();
    const headerEncoded = btoa(JSON.stringify(jwtHeader)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadEncoded = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const unsignedToken = `${headerEncoded}.${payloadEncoded}`;
    
    // Convert PEM to binary for crypto operations
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = privateKey.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "");
    
    // Decode base64 PEM
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    // Import private key for signing
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );
    
    // Sign the token
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      encoder.encode(unsignedToken)
    );
    
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const jwt = `${unsignedToken}.${signatureBase64}`;
    
    console.log('JWT created successfully');
    
    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Failed to get access token:', tokenData);
      throw new Error('Failed to get access token');
    }
    
    console.log('Access token obtained successfully');
    
    // Convert base64 to blob
    const fileBuffer = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));
    
    // Create multipart form data for file upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;
    
    const metadata = {
      name: fileName,
      parents: [folderId]
    };
    
    let multipartRequestBody = delimiter;
    multipartRequestBody += 'Content-Type: application/json\r\n\r\n';
    multipartRequestBody += JSON.stringify(metadata) + delimiter;
    multipartRequestBody += `Content-Type: ${mimeType}\r\n\r\n`;
    
    const encoder2 = new TextEncoder();
    const metadataBytes = encoder2.encode(multipartRequestBody);
    const combinedArray = new Uint8Array(metadataBytes.length + fileBuffer.length + encoder2.encode(closeDelimiter).length);
    combinedArray.set(metadataBytes);
    combinedArray.set(fileBuffer, metadataBytes.length);
    combinedArray.set(encoder2.encode(closeDelimiter), metadataBytes.length + fileBuffer.length);
    
    console.log('Uploading file to Google Drive...');
    
    // Upload file to Google Drive
    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: combinedArray,
    });
    
    const uploadResult = await uploadResponse.json();
    
    if (!uploadResponse.ok) {
      console.error('Upload failed:', uploadResult);
      throw new Error(`Upload failed: ${uploadResult.error?.message || 'Unknown error'}`);
    }
    
    console.log('File uploaded successfully, making it publicly accessible...');
    
    // Make file publicly accessible
    await fetch(`https://www.googleapis.com/drive/v3/files/${uploadResult.id}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      }),
    });
    
    console.log('File uploaded and made public successfully:', uploadResult);
    
    return new Response(
      JSON.stringify({
        success: true,
        fileId: uploadResult.id,
        fileName: uploadResult.name,
        webViewLink: `https://drive.google.com/file/d/${uploadResult.id}/view`,
        webContentLink: `https://drive.google.com/uc?id=${uploadResult.id}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
