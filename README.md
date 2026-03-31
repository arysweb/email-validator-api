# Email Validator API

A fast, reliable email validation API built with Node.js. Validates syntax, checks MX records, detects disposable addresses, identifies role-based emails, and provides deliverability scoring.

## Features

- ✅ **Syntax Validation** - RFC-compliant email format checking
- ✅ **MX Record Verification** - Real-time DNS lookup for mail server existence
- ✅ **Disposable Email Detection** - 500+ known temporary email services blocked
- ✅ **Free Provider Identification** - Distinguish between business and personal email providers
- ✅ **Role Address Detection** - Identify generic addresses (admin@, info@, support@)
- ✅ **Typo Suggestions** - Automatic suggestions for common email domain typos
- ✅ **Deliverability Scoring** - 0-100 quality score with detailed breakdown
- ✅ **Bulk Validation** - Process up to 50 emails in a single request

## Quick Start

This API is deployed as a static GitHub Pages application. No installation required!

**Live API URL:** `https://arysweb.github.io/email-validator-api/`

Simply make requests to the live endpoint - no setup needed.

## API Endpoints

### 1. Validate Single Email
**GET** `/validate?email={email}`

Validate a single email address with comprehensive analysis.

**Parameters:**
- `email` (string, required) - Email address to validate

**Example Request:**
```bash
curl "https://arysweb.github.io/email-validator-api/validate?email=john@example.com"
```

**Example Response:**
```json
{
  "email": "john@example.com",
  "is_valid": true,
  "score": 90,
  "checks": {
    "syntax_valid": true,
    "mx_found": true,
    "is_disposable": false,
    "is_free_provider": false,
    "is_role_address": false
  },
  "domain": "example.com",
  "mx_records": [
    {"exchange": "mail.example.com", "priority": 10}
  ],
  "suggestion": null
}
```

### 2. Bulk Email Validation
**POST** `https://arysweb.github.io/email-validator-api/validate/bulk`

Validate multiple email addresses in one request (max 50 emails).

**Request Body:**
```json
{
  "emails": [
    "user1@example.com", 
    "user2@gmail.com", 
    "fake@mailinator.com"
  ]
}
```

**Example Response:**
```json
{
  "results": [
    {
      "email": "user1@example.com",
      "is_valid": true,
      "score": 90,
      "checks": {
        "syntax_valid": true,
        "mx_found": true,
        "is_disposable": false,
        "is_free_provider": false,
        "is_role_address": false
      },
      "domain": "example.com"
    }
  ],
  "total": 3,
  "valid_count": 2
}
```

### 3. Health Check
**GET** `https://arysweb.github.io/email-validator-api/health`

Check API status and version information.
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | The validated email (normalized to lowercase) |
| `is_valid` | boolean | Overall validity (syntax + MX + not disposable) |
| `score` | number | Deliverability score (0-100) |
| `checks` | object | Detailed validation results |
| `domain` | string | Email domain (null if syntax invalid) |
| `mx_records` | array | MX record details (first 3 records) |
| `suggestion` | string | Suggested correction for common typos |

### Check Details
| Check | Type | Description |
|-------|------|-------------|
| `syntax_valid` | boolean | Email format is RFC-compliant |
| `mx_found` | boolean | Domain has MX records |
| `is_disposable` | boolean | Known disposable/temporary email service |
| `is_free_provider` | boolean | Free email provider (Gmail, Yahoo, etc.) |
| `is_role_address` | boolean | Generic role-based address |

## Scoring System

The deliverability score starts at 100 and decreases based on issues:

| Issue | Score Penalty |
|-------|----------------|
| Invalid syntax | -50 |
| No MX records | -30 |
| Disposable domain | -40 |
| Role address | -10 |

**Score Ranges:**
- **80-100**: Excellent quality
- **60-79**: Good quality  
- **40-59**: Risky
- **0-39**: Poor quality

## Usage Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

// Single email validation
const validateEmail = async (email) => {
  try {
    const response = await axios.get(`https://arysweb.github.io/email-validator-api/validate?email=${email}`);
    return response.data;
  } catch (error) {
    console.error('Validation error:', error.response.data);
  }
};

// Bulk validation
const validateBulk = async (emails) => {
  try {
    const response = await axios.post('https://arysweb.github.io/email-validator-api/validate/bulk', { emails });
    return response.data;
  } catch (error) {
    console.error('Bulk validation error:', error.response.data);
  }
};

// Usage
validateEmail('test@example.com').then(result => {
  console.log('Valid:', result.is_valid, 'Score:', result.score);
});
```

### Python
```python
import requests

def validate_email(email):
    url = f"https://arysweb.github.io/email-validator-api/validate?email={email}"
    response = requests.get(url)
    return response.json()

def validate_bulk(emails):
    url = "https://arysweb.github.io/email-validator-api/validate/bulk"
    response = requests.post(url, json={"emails": emails})
    return response.json()

# Usage
result = validate_email("test@example.com")
print(f"Valid: {result['is_valid']}, Score: {result['score']}")
```

### cURL
```bash
# Single validation
curl "https://arysweb.github.io/email-validator-api/validate?email=test@example.com"

# Bulk validation
curl -X POST "https://arysweb.github.io/email-validator-api/validate/bulk" \
  -H "Content-Type: application/json" \
  -d '{"emails": ["test1@example.com", "test2@gmail.com"]}'
```

## Common Use Cases

### 1. Form Validation
```javascript
// Real-time email validation in web forms
const validateUserEmail = async (email) => {
  const result = await validateEmail(email);
  if (!result.is_valid) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  if (result.score < 60) {
    return { valid: false, message: 'Email quality is too low' };
  }
  return { valid: true, message: 'Email is valid' };
};
```

### 2. Email List Cleaning
```javascript
// Clean email marketing lists
const cleanEmailList = async (emails) => {
  const results = await validateBulk(emails);
  return results.results.filter(email => email.is_valid && email.score >= 70);
};
```

### 3. User Registration
```javascript
// Prevent disposable email signups
const validateRegistrationEmail = async (email) => {
  const result = await validateEmail(email);
  return result.is_valid && !result.checks.is_disposable;
};
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | `"Missing required parameter: email"` | Email parameter not provided |
| 400 | `"Body must contain an \"emails\" array"` | Bulk request format invalid |
| 400 | `"Maximum 50 emails per bulk request"` | Bulk limit exceeded |

## Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)

### Customization
You can extend the validation by modifying:
- `DISPOSABLE_DOMAINS` - Add/update disposable email domains
- `FREE_PROVIDERS` - Add/update free email providers  
- `roleAddresses` - Add/update role-based email prefixes
- `typoMap` - Add/update common typo corrections

## Deployment

This API is deployed as a static GitHub Pages application.

### GitHub Pages Deployment
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select main branch as source
4. API will be available at: `https://username.github.io/repository-name/`

## Performance

- **Response Time**: < 100ms for single validation
- **Bulk Processing**: ~50ms per email (parallel processing)
- **MX Lookup**: Cached for 5 minutes to improve performance
- **Memory Usage**: < 50MB for typical workloads

## License

ISC License - Feel free to use this in your projects!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Create an issue on GitHub
- Check the existing documentation
- Review the code comments for implementation details
