# Email Validator API - Technical Spotlight

## Table of Contents
1. API Overview
2. Key Features
3. Use Cases
4. API Endpoints
5. Authentication
6. Request/Response Examples
7. Error Handling
8. Rate Limits & Pricing
9. Integration Guide
10. Support & Contact

---

## 1. API Overview

The Email Validator API provides comprehensive email validation services designed to enhance data quality, reduce bounce rates, and improve email marketing effectiveness. Our advanced validation engine performs multi-layer checks including syntax validation, MX record verification, disposable email detection, and intelligent deliverability scoring.

**Base URL:** `https://arysweb.github.io/email-validator-api/`

**API Version:** v1.0

**Response Format:** JSON

---

## 2. Key Features

### 🔍 Multi-Layer Validation
- **Syntax Validation**: RFC-compliant email format checking using advanced regex patterns
- **MX Record Verification**: Real-time DNS lookup for mail server existence
- **Disposable Email Detection**: 500+ known temporary email services blocked
- **Free Provider Identification**: Distinguish between business and personal email providers
- **Role Address Detection**: Identify generic addresses (admin@, info@, support@)

### 📊 Intelligent Deliverability Scoring
- **0-100 Quality Score**: Instant assessment of email deliverability potential
- **Risk-based Classification**: Valid, Risky, or Invalid categorization
- **Detailed Breakdown**: Transparent scoring factors for informed decisions
- **Typo Suggestions**: Automatic suggestions for common email domain typos

### ⚡ Performance & Reliability
- **Lightning Fast**: Sub-100ms response times
- **Bulk Processing**: Validate up to 50 emails per request
- **99.9% Uptime**: Enterprise-grade reliability
- **Global CDN**: Low-latency responses worldwide

---

## 3. Use Cases

### 🚀 E-commerce & SaaS Applications
- Reduce cart abandonment by catching invalid emails at checkout
- Improve user onboarding with real-time email validation
- Prevent fake account registrations with disposable email detection
- Enhance user data quality during registration

### 📧 Email Marketing Campaigns
- Clean email lists before campaign launches
- Reduce bounce rates and improve sender reputation
- Optimize marketing spend with quality lead validation
- Segment audiences based on email quality

### 🔐 Security & Fraud Prevention
- Block temporary email services used for fraudulent activities
- Validate user inputs during registration processes
- Enhance security with role-based email filtering
- Prevent spam and abuse on platforms

---

## 4. API Endpoints

### 4.1 Single Email Validation

**Endpoint:** `GET /validate`

**Description:** Validate a single email address with comprehensive analysis.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Email address to validate |

**Example Request:**
```
GET /validate?email=john@example.com
```

**Response Schema:**
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

### 4.2 Bulk Email Validation

**Endpoint:** `POST /validate/bulk`

**Description:** Validate multiple email addresses in a single request.

**Request Body:**
```json
{
  "emails": ["user1@example.com", "user2@gmail.com", "fake@mailinator.com"]
}
```

**Response Schema:**
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

### 4.3 Health Check

**Endpoint:** `GET /health`

**Description:** Check API status and version information.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 6. Request/Response Examples

### 6.1 Valid Email Example
**Request:** `GET /validate?email=john.doe@gmail.com`

**Response:**
```json
{
  "email": "john.doe@gmail.com",
  "is_valid": true,
  "score": 85,
  "checks": {
    "syntax_valid": true,
    "mx_found": true,
    "is_disposable": false,
    "is_free_provider": true,
    "is_role_address": false
  },
  "domain": "gmail.com",
  "mx_records": [
    {"exchange": "aspmx.l.google.com", "priority": 1}
  ],
  "suggestion": null
}
```

### 6.2 Invalid Email Example
**Request:** `GET /validate?email=invalid-email`

**Response:**
```json
{
  "email": "invalid-email",
  "is_valid": false,
  "score": 0,
  "checks": {
    "syntax_valid": false,
    "mx_found": false,
    "is_disposable": false,
    "is_free_provider": false,
    "is_role_address": false
  },
  "domain": null,
  "suggestion": null
}
```

### 6.3 Disposable Email Example
**Request:** `GET /validate?email=test@mailinator.com`

**Response:**
```json
{
  "email": "test@mailinator.com",
  "is_valid": false,
  "score": 60,
  "checks": {
    "syntax_valid": true,
    "mx_found": true,
    "is_disposable": true,
    "is_free_provider": false,
    "is_role_address": false
  },
  "domain": "mailinator.com",
  "suggestion": null
}
```

### 6.4 Typo Suggestion Example
**Request:** `GET /validate?email=user@gmai.com`

**Response:**
```json
{
  "email": "user@gmai.com",
  "is_valid": false,
  "score": 50,
  "checks": {
    "syntax_valid": true,
    "mx_found": false,
    "is_disposable": false,
    "is_free_provider": false,
    "is_role_address": false
  },
  "domain": "gmai.com",
  "suggestion": "user@gmail.com"
}
```

---

## 7. Error Handling

### Error Response Format
All errors return a consistent JSON format:

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "message": "Detailed error message"
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `MISSING_EMAIL` | Email parameter is required | 400 |
| `INVALID_BULK_FORMAT` | Request body must contain emails array | 400 |
| `BULK_LIMIT_EXCEEDED` | Maximum 50 emails per bulk request | 400 |
| `INVALID_EMAIL_FORMAT` | Email format is invalid | 400 |
| `RATE_LIMIT_EXCEEDED` | API rate limit exceeded | 429 |
| `INTERNAL_ERROR` | Internal server error | 500 |

### Error Examples

**Missing Email Parameter:**
```json
{
  "error": "Missing required parameter: email",
  "code": "MISSING_EMAIL",
  "message": "The email parameter is required for single validation"
}
```

**Rate Limit Exceeded:**
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "You have exceeded your monthly request limit"
}
```

---

## 8. Rate Limits & Pricing

### Rate Limits by Plan

| Plan | Requests/Month | Rate Limit | Price |
|------|----------------|------------|-------|
| Free | 100 | 10 requests/hour | $0 |
| Basic | 5,000 | 100 requests/hour | $9/month |
| Pro | 50,000 | 1,000 requests/hour | $29/month |
| Ultra | 500,000 | 10,000 requests/hour | $99/month |

### Response Headers
Rate limit information is included in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## 9. Integration Guide

### JavaScript/Node.js
```javascript
const axios = require('axios');

const validateEmail = async (email) => {
  try {
    const response = await axios.get(
      `https://your-api-domain.com/validate?email=${email}`,
      {
        headers: {
          'X-RapidAPI-Key': 'your_api_key_here'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Validation error:', error.response.data);
  }
};

// Usage
validateEmail('test@example.com').then(result => {
  console.log('Validation result:', result);
});
```

### Python
```python
import requests

def validate_email(email):
    url = f"https://your-api-domain.com/validate?email={email}"
    headers = {
        "X-RapidAPI-Key": "your_api_key_here"
    }
    
    try:
        response = requests.get(url, headers=headers)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

# Usage
result = validate_email("test@example.com")
print(f"Validation result: {result}")
```

### PHP
```php
<?php
function validateEmail($email) {
    $url = "https://your-api-domain.com/validate?email=" . urlencode($email);
    $headers = [
        "X-RapidAPI-Key: your_api_key_here"
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Usage
$result = validateEmail("test@example.com");
print_r($result);
?>
```

## Score Breakdown Reference

### Deliverability Score Calculation

| Check | Score Impact | Description |
|-------|--------------|-------------|
| Base Score | +100 | Starting point for all emails |
| Invalid Syntax | -50 | Email doesn't match RFC standards |
| No MX Records | -30 | Domain has no mail servers |
| Disposable Domain | -40 | Known temporary email service |
| Role Address | -10 | Generic address (admin@, info@) |

### Score Interpretation

| Score Range | Quality | Recommendation |
|-------------|---------|----------------|
| 80-100 | Excellent | Safe to send |
| 60-79 | Good | Acceptable with caution |
| 40-59 | Risky | Review before sending |
| 0-39 | Poor | Do not send |

---

**Document Version:** 1.0   
**API Version:** v1.0  

© 2024 Your Company Name. All rights reserved.
