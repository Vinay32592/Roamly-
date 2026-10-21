# Roamly — Project Viva & Technical Defense Notes

This guide provides an end-to-end, technical explanation of the **Roamly – Tourist Spot Review Portal**. It is structured to help you understand every architectural decision, data flow, and code component for your college viva and technical project evaluation.

---

## 1. Project Architecture Overview

Roamly is built on the **Traditional Multi-Tier Client-Server Architecture** using standard Vanilla Web Technologies and the Node.js/Express/MongoDB stack:

```
[ Client Browser ]
      │
      │ HTTP/HTTPS (HTML, CSS, Vanilla JS, Local Images)
      ▼
[ Express.js Web & API Server (Node.js) ]
  ├── 1. Security Middleware (Helmet, CORS, Rate Limiters)
  ├── 2. Body & Cookie Parsing (express.json, cookie-parser)
  ├── 3. Static File Server (express.static serves /public)
  ├── 4. Routing Layer (/api/auth, /api/destinations, /api/reviews, /api/users, /api/admin)
  ├── 5. Controller Layer (Business logic & responses)
  └── 6. Centralized Error Handler
      │
      │ Mongoose ODM (Object Data Modeling)
      ▼
[ MongoDB Database (Local / Atlas) ]
  ├── Users Collection (Auth, Roles, Profile)
  ├── Destinations Collection (Tourism data, ratings, text search index)
  └── Reviews Collection (Ratings, comments, helpful votes)
```

### Key Architectural Strengths:
- **Zero Heavy Frontend Frameworks**: Uses native browser DOM APIs and Fetch API. Fast, zero-build-step, zero-bundle-size client.
- **RESTful API Design**: Clean separation between presentation (HTML/CSS/JS) and data (JSON API).
- **Automated Aggregation**: Ratings are computed atomically inside MongoDB via pipeline hooks, guaranteeing data integrity.

---

## 2. What Happens When a User Opens the Homepage?

1. **DNS & Connection**: The browser issues a `GET /` request to `http://localhost:3000/`.
2. **Express Route Handler**: Express matches `app.get('/', ...)` in `src/app.js` and serves `public/index.html`.
3. **Asset Resolution**:
   - The HTML requests `public/css/style.css` (cached and rendered, containing complete layout and responsive rules).
   - The HTML requests scripts `public/js/app.js` (core API & auth) and `public/js/pages.js` (page interactions).
4. **Natural Atmosphere Canvas**:
   - `public/js/pages.js` executes `initNaturalAtmosphere()`, drawing a lightweight 30-frame particle system rendering drifting golden sunlight motes over the panoramic hero banner.
5. **Session Check**:
   - `public/js/app.js` calls `GET /api/auth/me`. If the user has a valid `jwt` cookie, the navbar displays their username and a dropdown; otherwise, it displays "Log In" and "Register".
6. **Featured Spots Fetch**:
   - `public/js/pages.js` issues `GET /api/destinations?featured=true&limit=6` using `fetch()`.
   - Express queries MongoDB `Destination.find({ isFeatured: true }).limit(6)`.
   - The client renders the destination cards into `#featured-grid`. Each card is clickable and navigates to `destination.html?id=<_id>`.

---

## 3. How the Frontend Communicates with Express

All client-server communication uses the standard browser **`window.fetch()`** API wrapped in a clean utility class `api` inside `public/js/app.js`:

```javascript
// Example helper in public/js/app.js
async request(endpoint, options = {}) {
  const url = `${this.baseUrl}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include', // Automatically sends httpOnly JWT cookies
    ...options
  };
  const response = await fetch(url, config);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
```

- **`credentials: 'include'`**: Ensures browser cookies (such as our JWT auth token) are included on every cross-route request without manual token header injection.
- **JSON Payload Exchange**: Every API request and response is standard JSON (`application/json`).

---

## 4. How an API Request Reaches the Database

Tracing an example request: **`GET /api/destinations?category=Mountains&minRating=4`**

1. **Network**: The browser makes an HTTP GET request to `/api/destinations`.
2. **App Middleware**: `src/app.js` passes the request through `helmet()`, `cors()`, `express.json()`, and `cookieParser()`.
3. **Router Matching**: Express matches `app.use('/api/destinations', destinationRoutes)`.
4. **Route Dispatch**: In `src/routes/destinationRoutes.js`, `router.get('/', optionalAuth, getDestinations)` matches.
5. **Controller Execution**: In `src/controllers/destinationController.js`:
   - Extracts `req.query.category` and `req.query.minRating`.
   - Builds a MongoDB query object: `{ category: 'Mountains', averageRating: { $gte: 4 } }`.
   - Calls `await Destination.find(query).sort({ createdAt: -1 }).skip(0).limit(12)`.
6. **Database Engine**: Mongoose executes the query on MongoDB via the established TCP connection.
7. **JSON Response**: Controller sends `res.json({ success: true, count, pagination, data })`.

---

## 5. How a Tourist Destination is Stored and Retrieved

### Mongoose Schema (`src/models/Destination.js`)
```javascript
const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, unique: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Mountains', 'Beaches', 'Historical', 'Nature & Wildlife', 'Spiritual', 'Adventure', 'Hill Stations', 'Heritage', 'Urban']
  },
  description: { type: String, required: true },
  images: [{ type: String }],
  bestTimeToVisit: { type: String },
  entryFee: { type: String },
  visitorTips: [{ type: String }],
  nearbyAttractions: [{ type: String }],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });
```

- **Slug Generation**: A `pre('save')` hook automatically generates SEO-friendly slugs using `slugify` (e.g., `"Taj Mahal"` becomes `"taj-mahal"`).
- **Compound Text Index**: `destinationSchema.index({ name: 'text', city: 'text', state: 'text', description: 'text' })` enables fast full-text searching in the search bar.
- **Local Verified Images**: All image URLs refer to local static assets in `/images/destinations/<slug>.jpg`, guaranteeing 100% availability with zero external rate limits or hotlinking issues.

---

## 6. How a Review is Submitted and Saved

1. **User Action**: On `write-review.html`, the user selects star rating (1–5), enters a visit date, title, and detailed review text.
2. **Form Submission**: `public/js/reviews.js` intercepts `submit`, prevents default page reload, and posts to `POST /api/destinations/:id/reviews`.
3. **Route & Auth Guard**:
   - `protect` middleware verifies the JWT token from the `httpOnly` cookie. If not logged in, returns `401 Unauthorized`.
   - `validateReview` middleware checks title length, comment length (min 10 chars), and rating range (1–5).
4. **Duplicate Prevention**:
   - The Review schema enforces a compound unique index: `{ destination: 1, user: 1 }, { unique: true }`.
   - A traveler can only leave one review per tourist spot, preventing review spam.
5. **Database Save**: `Review.create({ destination, user, rating, title, comment, visitDate })`.
6. **Automatic Rating Recalculation**: The post-save hook recalculates destination score immediately.

---

## 7. How the Average Rating is Calculated (Aggregation Pipeline)

Rather than recalculating ratings on the frontend or running manual loops in JavaScript, Roamly utilizes **MongoDB Aggregation Pipelines** embedded in Mongoose static methods:

```javascript
// src/models/Review.js
reviewSchema.statics.calcAverageRating = async function(destinationId) {
  const stats = await this.aggregate([
    { $match: { destination: destinationId } },
    {
      $group: {
        _id: '$destination',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Destination').findByIdAndUpdate(destinationId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount
    });
  } else {
    await mongoose.model('Destination').findByIdAndUpdate(destinationId, {
      averageRating: 0,
      reviewCount: 0
    });
  }
};
```

### Trigger Hooks:
- Triggered automatically on `post('save')` whenever a review is created.
- Triggered automatically on `post('findOneAndDelete')` whenever a review is deleted.
- Guarantees `averageRating` and `reviewCount` on the Destination document are always 100% accurate and consistent.

---

## 8. How Authentication Works

1. **Password Hashing (bcrypt)**:
   - When a user registers, a Mongoose `pre('save')` hook hashes the plain-text password using `bcryptjs` with salt rounds = 12. Plain passwords are never stored.
2. **Token Generation (JWT)**:
   - Upon successful login, the server signs a JSON Web Token:
     ```javascript
     jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
     ```
3. **Secure Cookie Storage**:
   - Sent to the browser as an `httpOnly` cookie:
     ```javascript
     res.cookie('jwt', token, {
       httpOnly: true, // Prevents JavaScript XSS access
       sameSite: 'lax', // CSRF protection
       maxAge: 7 * 24 * 60 * 60 * 1000
     });
     ```
4. **Route Protection Middleware (`src/middleware/auth.js`)**:
   - `protect`: Extracts the token from cookie or `Authorization: Bearer <token>`, decodes it, loads user, and attaches it to `req.user`.
   - `adminOnly`: Rejects requests with `403 Forbidden` if `req.user.role !== 'admin'`.

---

## 9. Why We Chose MongoDB and Express

| Technology | Reason for Choice in Roamly |
|---|---|
| **MongoDB (NoSQL)** | Tourist spots have flexible nested attributes (arrays of tags, visitor tips, nearby attractions, image galleries). MongoDB documents naturally map to JSON. |
| **Mongoose ODM** | Provides strict schema validation, type safety, pre/post hooks, and aggregation pipelines on top of MongoDB. |
| **Node.js + Express** | Non-blocking, event-driven I/O ideal for concurrent API requests. Lightweight, fast routing, and standardized middleware pipeline. |
| **Vanilla HTML/CSS/JS** | Zero compilation step, fast rendering, minimal memory overhead, and clear for college demonstration. |

---

## 10. Purpose of Every Key File in the Project

```text
Roamly/
├── server.js                    # HTTP entry point: loads .env, connects DB, starts server on port 3000
├── package.json                 # Dependencies, project metadata, and npm scripts
├── .env                         # Secrets, DB URI, port, admin credentials (never committed)
├── .env.example                 # Safe environment configuration template for other developers
│
├── src/
│   ├── app.js                   # Express configuration, security headers, routing, static folders
│   ├── config/database.js       # MongoDB Mongoose connection handler
│   ├── models/
│   │   ├── User.js              # User schema, bcrypt hash hook, comparePassword method
│   │   ├── Destination.js       # Tourist spot schema, text index, slug generation
│   │   └── Review.js            # Review schema, compound unique index, calcAverageRating aggregation
│   ├── controllers/
│   │   ├── authController.js    # Register, login, logout, me logic
│   │   ├── destinationController.js # CRUD, category queries, search, filter, pagination
│   │   ├── reviewController.js  # Submit, update, delete review, helpful vote toggling
│   │   ├── userController.js    # User profile management and review list
│   │   └── adminController.js   # Platform stats, user suspension toggle, review moderation
│   ├── routes/                  # Modular REST endpoint routes (/auth, /destinations, /reviews, /users, /admin)
│   └── middleware/
│       ├── auth.js              # JWT authentication and role-based access checks
│       ├── validators.js        # Input validation rules (express-validator)
│       └── errorHandler.js      # Global error catch-all returning structured JSON
│
├── public/                      # Static client assets served directly by Express
│   ├── index.html               # Landing page with hero animation, search, and featured spots
│   ├── explore.html             # Search, category filter, rating filter, pagination
│   ├── destination.html         # Spot detail view with gallery and visitor reviews
│   ├── write-review.html        # Interactive star rating picker & review submission form
│   ├── profile.html             # Traveler profile, my reviews management
│   ├── admin.html               # Administrator dashboard (stats, user status toggle, moderation)
│   ├── login.html / register.html # Sign in & registration forms
│   ├── css/
│   │   ├── style.css            # Custom CSS properties (design tokens), card grid, animations
│   │   └── responsive.css       # Mobile & tablet media queries
│   ├── js/
│   │   ├── api.js               # Reusable API client, toast notifications, star renderer
│   │   ├── auth.js              # Navbar auth state & route guards
│   │   └── home.js / explore.js / destination.js ... # Page-specific client controllers
│   └── images/destinations/     # 38 authentic high-resolution local destination images
│
└── scripts/
    ├── seed.js                  # Canonical database seeder (38 Indian destinations)
    ├── createAdmin.js           # Seeds the administrator account (admin@roamly.com)
    └── seedReviews.js           # Seeds realistic community traveler reviews & recalculates scores
```

---

## 11. Important Technical Decisions to Understand

1. **Why Local Destination Images?**
   - External CDNs (Unsplash, Wikipedia) frequently block hotlinking from `localhost` with HTTP `429 Too Many Requests` or `403 Forbidden`.
   - Storing verified photography locally in `public/images/destinations/` guarantees instant load times, offline availability, and 100% visual accuracy.
2. **Why `httpOnly` Cookies for JWT?**
   - Storing JWTs in `localStorage` makes them vulnerable to Cross-Site Scripting (XSS) attacks.
   - An `httpOnly` cookie cannot be read by client-side JavaScript, protecting session tokens.
3. **Why Compound Unique Index on Reviews?**
   - `{ user: 1, destination: 1 }` guarantees at the database level that a user cannot submit multiple reviews for the same tourist spot.

---

## 12. Typical College Viva Questions & Model Answers

### Q1: What happens if two users try to review the same destination?
> *"Both reviews are saved because they are from different users. However, if the SAME user tries to submit a second review for the same destination, MongoDB rejects it with error code `11000` (Duplicate Key Error) because of our compound unique index `{ user: 1, destination: 1 }` on the Review collection. Our controller catches this and returns a user-friendly message: 'You have already reviewed this destination.' "*

### Q2: How do you prevent SQL Injection and NoSQL Injection?
> *"Because we use Mongoose schemas with explicit types, inputs are cast and sanitized according to schema definitions. Additionally, express-validator sanitizes input strings, and user input is never directly evaluated or concatenated into database queries."*

### Q3: How is password security implemented?
> *"We use `bcryptjs` with salt round factor 12 in a Mongoose `pre('save')` hook. Even if the database was leaked, passwords cannot be reversed. During login, `bcrypt.compare()` compares the plaintext password with the stored hash using a constant-time comparison to prevent timing attacks."*

### Q4: How does the search bar find destinations by city or state?
> *"We defined a compound text index on the Destination model: `{ name: 'text', city: 'text', state: 'text', description: 'text' }`. When a user types in the search box, Express performs a `$text: { $search: query }` search or a regex match across those fields."*

### Q5: How do destination cards navigate without full page reloads?
> *"The cards feature an `onclick="window.location.href='/destination.html?id=${dest._id}'"` event with standard query parameters. On `destination.html`, the client parses `window.location.search` to get the destination ID and fetches detailed spot data and reviews from `/api/destinations/:id`."*

### Q6: What is the purpose of rate limiting in this project?
> *"We use `express-rate-limit` on the `/api/auth` endpoints. It limits clients to 10 requests per 15-minute window for authentication actions, protecting our portal against brute-force password guessing attacks."*
