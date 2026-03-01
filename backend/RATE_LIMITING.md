# Rate Limiting Documentation

## Overview

Rate limiting is implemented using the `express-rate-limit` middleware to protect the API from abuse, prevent brute force attacks, and ensure fair resource usage across all users.

## Configuration

Rate limiting is configured in `src/config/rateLimit.js` with different rules for different endpoint groups.

### Rate Limit Tiers

#### 1. Authentication Limiter
**Location**: `/api/auth/*` (except `/api/auth/me`)
- **Limit**: 5 requests per 15 minutes
- **Purpose**: Prevent brute force attacks on login/register
- **Skip Conditions**: GET /api/auth/me (already authenticated)

```javascript
authLimiter: {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 requests
  skipFailedRequests: false   // Count all attempts
}
```

**Endpoints Protected**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

#### 2. Transaction Limiter
**Location**: `/api/transactions/*`
- **Limit**: 100 requests per hour
- **Purpose**: Standard rate limit for transaction operations

```javascript
transactionLimiter: {
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 100,                    // 100 requests
  skipFailedRequests: false
}
```

**Endpoints Protected**:
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

#### 3. Analytics Limiter
**Location**: `/api/transactions/analytics/*` and `/api/transactions/summary`
- **Limit**: 50 requests per hour
- **Purpose**: Stricter limit for resource-intensive analytics queries

```javascript
analyticsLimiter: {
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 50,                     // 50 requests
  skipFailedRequests: false
}
```

**Endpoints Protected**:
- `GET /api/transactions/summary` - Transaction summary
- `GET /api/transactions/analytics/category-breakdown` - Category breakdown
- `GET /api/transactions/analytics/monthly-trend` - Monthly trends

#### 4. Strict Limiter
**Location**: `/api/users/*` (admin-only operations)
- **Limit**: 10 requests per hour
- **Purpose**: Protect admin operations
- **Skip Conditions**: Count only successful requests

```javascript
strictLimiter: {
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 10,                     // 10 requests
  skipFailedRequests: true     // Only count successes
}
```

**Endpoints Protected**:
- `GET /api/users` - List all users (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

#### 5. Global Limiter
**Location**: All routes (fallback)
- **Limit**: 100 requests per 15 minutes
- **Purpose**: Catch-all rate limiting
- **Skip Conditions**: `/api/docs` routes

```javascript
globalLimiter: {
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,                    // 100 requests
  skip: (req) => req.path.includes('/api/docs')
}
```

## Response Headers

When rate limiting is active, responses include these headers:

```
RateLimit-Limit: 100
RateLimit-Remaining: 45
RateLimit-Reset: 1677652800
```

### Header Meanings

| Header | Meaning |
|--------|---------|
| `RateLimit-Limit` | Maximum requests allowed per window |
| `RateLimit-Remaining` | Requests remaining in current window |
| `RateLimit-Reset` | Unix timestamp when limit resets |

## Rate Limit Responses

### Success Response (within limit)
```http
HTTP/1.1 200 OK
Content-Type: application/json
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1677652800

{
  "data": {...}
}
```

### Rate Limited Response (exceeded)
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 1677652800

{
  "error": "Too many authentication attempts",
  "message": "Please try again after 15 minutes"
}
```

## Implementation Details

### Route-Level Application

Different limiters are applied at the route level:

```javascript
// authRoutes.js
import { authLimiter } from '../config/rateLimit.js';

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
```

### Middleware Stack Order

Rate limiters should be applied:
1. **Before authentication** for public endpoints (auth)
2. **After authentication** for protected endpoints (transactions, users)
3. **After global middleware** but before route handlers

```javascript
// Correct order
app.use(globalLimiter);           // Apply to all routes first
router.use(authenticate);          // Authenticate
router.use(transactionLimiter);   // Then rate limit
router.get('/', getTransactions); // Finally handle
```

## Configuration Options

### Common Options

```javascript
rateLimit({
  windowMs: 15 * 60 * 1000,     // Time window in milliseconds
  max: 5,                         // Max requests per window
  message: "Too many requests",   // Error message
  statusCode: 429,                // HTTP status code
  standardHeaders: true,          // Return RateLimit-* headers
  legacyHeaders: false,           // Disable X-RateLimit-* headers
  skipFailedRequests: false,      // Count all requests
  skip: (req) => false,           // Skip certain requests
  keyGenerator: (req, res) => req.ip // How to identify clients
})
```

### Custom Message Example

```javascript
{
  message: {
    error: "Too many requests",
    message: "You have exceeded the rate limit. Please try again later.",
    retryAfter: "3600"
  }
}
```

## Client Behavior

### What Happens When Rate Limited?

1. Client receives **429 Too Many Requests** response
2. Response includes **RateLimit-Reset** timestamp
3. Client should **wait and retry** after reset time
4. Some clients may implement exponential backoff

### Recommended Client Implementation

```javascript
// JavaScript/Node.js example
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('RateLimit-Reset');
      const waitTime = (retryAfter * 1000) - Date.now();
      
      console.log(`Rate limited. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Retry after waiting
      return makeRequest(url, options);
    }
    
    return response;
  } catch (error) {
    console.error('Request failed:', error);
  }
}
```

## Monitoring and Debugging

### Check Rate Limit Status

```bash
# Make request and check headers
curl -i http://localhost:5000/api/transactions \
  -H "Authorization: Bearer <token>"

# Look for RateLimit-* headers in response
```

### View Rate Limit Logs

Rate limiting info is logged with each request in development mode:

```
GET /api/auth/login
RateLimit-Remaining: 4 (auth limiter)
RateLimit-Limit: 5
```

### Redis Store (Future Enhancement)

For distributed systems, consider using Redis for rate limit storage:

```javascript
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

const client = redis.createClient();

const limiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'rl:' // rate limit prefix
  }),
  windowMs: 15 * 60 * 1000,
  max: 5
});
```

## Customization

### Adjust Limits

To change rate limits, edit `src/config/rateLimit.js`:

```javascript
// Increase transaction limit to 200 per hour
export const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200  // Changed from 100
});
```

### Add New Limiter

```javascript
// Create new limiter
export const customLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,  // 30 minutes
  max: 20,
  message: {
    error: 'Custom limit exceeded',
    message: 'Please wait before retrying'
  }
});

// Apply in routes
import { customLimiter } from '../config/rateLimit.js';
router.post('/custom', customLimiter, controller);
```

### Skip Rate Limiting for Specific IPs

```javascript
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: (req, res) => {
    // Skip for internal IPs
    return req.ip === '127.0.0.1' || req.ip === '::1';
  }
});
```

## Testing Rate Limits

### Manual Testing

```bash
# Test auth limiter (5 requests per 15 min)
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
  echo "\n---"
done
# 6th request will get 429
```

### Automated Testing Script

```javascript
// test-rate-limit.js
async function testRateLimit() {
  const endpoint = 'http://localhost:5000/api/auth/login';
  const payload = { username: 'test', password: 'test' };
  
  for (let i = 0; i < 6; i++) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log(`Request ${i+1}:`);
    console.log(`Status: ${response.status}`);
    console.log(`Remaining: ${response.headers.get('RateLimit-Remaining')}`);
  }
}

testRateLimit();
```

## Performance Considerations

### Memory Usage

In-memory rate limiting stores grow with the number of unique IPs. For high-traffic APIs, consider:
- Redis for distributed rate limiting
- Cleanup of old entries
- Proper IP identification (proxy awareness)

### Proxy Configuration

If behind a proxy (nginx, CloudFlare), configure IP trust:

```javascript
app.set('trust proxy', 1); // Trust first proxy
// or
app.set('trust proxy', ['127.0.0.1', '192.168.0.0/16']);
```

## Troubleshooting

### All Requests Getting Rate Limited

**Solution**: Check global limiter settings and ensure skip conditions are correct

### Rate Limits Not Working

**Solution**: Verify middleware order - rate limiters must come after body parser but before routes

### Seeing Lots of 429 Errors

**Options**:
1. Increase limits in `rateLimit.js`
2. Implement client-side retry logic
3. Use caching to reduce request frequency

## Best Practices

1. **Monitor Rate Limit Headers**: Always check `RateLimit-Remaining`
2. **Implement Backoff**: Use exponential backoff when rate limited
3. **Cache Results**: Cache frequently accessed data
4. **Batch Operations**: Combine multiple operations when possible
5. **Use Webhooks** (future): Switch from polling to event-driven
6. **Document Limits**: Always communicate limits to API users
7. **Test Limits**: Test behavior at limit boundaries
8. **Log Violations**: Monitor who's hitting rate limits frequently

## Security Considerations

- **DDoS Protection**: Rate limits help prevent denial-of-service attacks
- **Brute Force Protection**: Strict limits on auth endpoints prevent password guessing
- **Resource Protection**: Limits on heavy operations prevent resource exhaustion
- **Fair Usage**: Ensure all users get fair API access

## Future Enhancements

- [ ] Redis-backed rate limiting for distributed systems
- [ ] Per-user rate limits (higher for premium users)
- [ ] Dynamic rate limits based on server load
- [ ] Rate limit alerts and monitoring
- [ ] Whitelist/blacklist IP management
- [ ] GraphQL-aware rate limiting
- [ ] Cost-based rate limiting (API quota system)

---

For more information, see the [express-rate-limit documentation](https://github.com/nfriedly/express-rate-limit).
