/**
 * Response from Google reCAPTCHA Enterprise assessment API.
 * @see https://cloud.google.com/recaptcha-enterprise/docs/reference/rest/v1/projects.assessments
 */
export type RecaptchaAssessmentResponse = {
  /**
   * Properties of the token being assessed.
   */
  tokenProperties?: {
    /** Whether the provided token is valid. */
    valid: boolean;
    /** The action name provided at token generation. */
    action?: string;
    /** Timestamp when the token was created (RFC 3339 format). */
    createTime?: string;
  };
  /**
   * Risk analysis result for the token.
   */
  riskAnalysis?: {
    /**
     * Risk score from 0.0 to 1.0.
     * - `1.0` — Very likely a legitimate user
     * - `0.0` — Very likely a bot
     */
    score: number;
    /** Reasons contributing to the risk analysis verdict. */
    reasons?: string[];
  };
  /**
   * The event being assessed.
   */
  event?: {
    /** The user response token from reCAPTCHA. */
    token: string;
    /** The site key used to invoke reCAPTCHA. */
    siteKey: string;
    /** The expected action for this assessment. */
    expectedAction: string;
  };
  /**
   * Error details if the assessment failed.
   */
  error?: {
    /** HTTP status code. */
    code: number;
    /** Human-readable error message. */
    message: string;
  };
};

/**
 * Assesses a reCAPTCHA Enterprise token to determine if the user is legitimate.
 *
 * @param options - The assessment options
 * @param options.token - The reCAPTCHA token received from the client
 * @param options.siteKey - Your reCAPTCHA site key from Google Cloud Console
 * @param options.expectedAction - The action name to validate against
 * @param options.api_token - Your Google Cloud API key
 * @param options.projectId - Your Google Cloud Platform project ID
 * @returns A promise resolving to the assessment response
 *
 * @example
 * ```typescript
 * const result = await assessRecaptchaToken({
 *   token: "client-token",
 *   siteKey: "your-site-key",
 *   expectedAction: "login",
 *   api_token: "your-api-key",
 *   projectId: "your-project-id",
 * });
 *
 * if (result.tokenProperties?.valid && (result.riskAnalysis?.score ?? 0) >= 0.5) {
 *   // User is likely legitimate
 * }
 * ```
 */
export default async function assessRecaptchaToken({
  token,
  siteKey,
  expectedAction,
  api_token,
  projectId,
}: {
  token: string;
  siteKey: string;
  expectedAction: string;
  api_token: string;
  projectId: string;
}): Promise<RecaptchaAssessmentResponse> {
  try {
    const res = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${api_token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: {
            token,
            siteKey,
            expectedAction,
          },
        }),
      },
    );

    if (!res.ok) {
      return {
        error: {
          code: res.status,
          message: `HTTP error: ${res.statusText}`,
        },
      };
    }

    const text = await res.text();
    if (!text) {
      return {
        error: {
          code: 500,
          message: "Empty response from reCAPTCHA API",
        },
      };
    }

    try {
      return JSON.parse(text) as RecaptchaAssessmentResponse;
    } catch {
      return {
        error: {
          code: 500,
          message: "Invalid JSON response from reCAPTCHA API",
        },
      };
    }
  } catch (err) {
    return {
      error: {
        code: 500,
        message:
          err instanceof Error
            ? err.message
            : "Failed to assess recaptcha token",
      },
    };
  }
}
