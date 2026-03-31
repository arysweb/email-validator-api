# Email Validator API

A fast, reliable email validation API for RapidAPI. Validates syntax, checks MX records, detects disposable addresses, and scores deliverability.

## Endpoints

### GET /validate
Validate a single email address.

**Query Parameters**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | yes | Email address to validate |

**Example Request**
```
GET /validate?email=john@example.com
```

**Example Response**
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
  "mx_records": [{ "exchange": "mail.example.com", "priority": 10 }],
  "suggestion": null
}
```

**Score Breakdown**
| Check | Score Impact |
|-------|-------------|
| Syntax invalid | -50 |
| No MX records found | -30 |
| Disposable domain | -40 |
| Role address (admin@, info@) | -10 |

---

### POST /validate/bulk
Validate up to 50 emails in one request.

**Request Body**
```json
{
  "emails": ["user1@example.com", "user2@gmail.com", "fake@mailinator.com"]
}
```

**Example Response**
```json
{
  "results": [...],
  "total": 3,
  "valid_count": 2
}
```

---

### GET /health
Returns API status and version.

---

## Pricing Tiers (suggested for RapidAPI)

| Plan | Requests/month | Price |
|------|---------------|-------|
| Free | 100 | $0 |
| Basic | 5,000 | $9/mo |
| Pro | 50,000 | $29/mo |
| Ultra | 500,000 | $99/mo |

---

## Running Locally

```bash
npm install
node index.js
# API running at http://localhost:3000
```

Set `PORT` env variable to change port.

---

## Deploying to Production

Recommended: **Railway**, **Render**, or **Fly.io** — all have free tiers and one-click Node.js deploys.

1. Push code to GitHub
2. Connect repo to Railway/Render
3. Set environment variables if needed
4. Get your public URL → use as RapidAPI base URL

---

## Listing on RapidAPI

1. Go to [rapidapi.com/provider](https://rapidapi.com/provider) and create an account
2. Click **Add New API**
3. Set base URL to your deployed endpoint
4. Define endpoints (`/validate`, `/validate/bulk`)
5. Set pricing tiers
6. Write descriptions with example responses
7. Submit for review (usually approved within 24–48 hours)
