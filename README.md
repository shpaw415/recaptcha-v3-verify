# recaptcha-v3-verify

A lightweight TypeScript library for verifying Google reCAPTCHA Enterprise tokens on the server side.

**✅ Edge Ready** — Works on Cloudflare Workers, Vercel Edge Functions, Deno Deploy, Bun, and any runtime with the Fetch API.

## Installation

```json
// to your package.json
{
  "dependencies": {
    "recaptcha-v3-verify": "https://github.com/shpaw415/recaptcha-v3-verify.git"
  }
}
```

## Usage

```typescript
import assessRecaptchaToken from "recaptcha-v3-verify";

const response = await assessRecaptchaToken({
  token: "client-recaptcha-token",
  siteKey: "your-site-key",
  expectedAction: "login",
  api_token: "your-google-api-key",
  projectId: "your-gcp-project-id",
});

if (response.tokenProperties?.valid && response.riskAnalysis?.score >= 0.5) {
  // Token is valid and user is likely human
  console.log("Verification successful!");
} else {
  // Token is invalid or user might be a bot
  console.log("Verification failed");
}
```

## Parameters

| Parameter        | Type     | Description                                       |
| ---------------- | -------- | ------------------------------------------------- |
| `token`          | `string` | The reCAPTCHA token received from the client      |
| `siteKey`        | `string` | Your reCAPTCHA site key from Google Cloud Console |
| `expectedAction` | `string` | The action name to validate against               |
| `api_token`      | `string` | Your Google Cloud API key                         |
| `projectId`      | `string` | Your Google Cloud Platform project ID             |

## Response

The function returns a `RecaptchaAssessmentResponse` object:

```typescript
type RecaptchaAssessmentResponse = {
  tokenProperties?: {
    valid: boolean;
    action?: string;
    createTime?: string;
  };
  riskAnalysis?: {
    score: number; // 0.0 (bot) to 1.0 (human)
    reasons?: string[];
  };
  event?: {
    token: string;
    siteKey: string;
    expectedAction: string;
  };
  error?: {
    code: number;
    message: string;
  };
};
```

### Risk Score

The `riskAnalysis.score` ranges from `0.0` to `1.0`:

- **1.0** — Very likely a legitimate user
- **0.0** — Very likely a bot

A score of **0.5** or higher is generally considered safe.

## Requirements

- A Google Cloud Platform project with reCAPTCHA Enterprise API enabled
- A reCAPTCHA Enterprise site key
- A Google Cloud API key with reCAPTCHA Enterprise permissions

## License

MIT
