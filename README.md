# Roamly — Tourist Spot Review Portal

A complete, full-stack web application for discovering Indian tourist destinations, reading authentic visitor reviews, rating attractions, and sharing travel experiences.

---

## 📌 Problem Statement

Travelers exploring tourist destinations in India often face scattered, unverified, or commercially biased information across disjointed blogs and social media. Finding trustworthy visitor feedback, authentic photographs, best visiting seasons, entrance details, and honest traveler ratings in one cohesive platform is difficult. Roamly solves this by providing a unified, community-driven review portal with genuine photography, structured destination details, and verified traveler feedback.

---

## 🎯 Objectives

1. **Curated Tourism Discovery**: Provide structured profiles for 38 iconic Indian tourist spots across 8 diverse categories.
2. **Transparent Traveler Reviews**: Allow authenticated visitors to submit detailed reviews with 1–5 star ratings, travel dates, and titles.
3. **Automated Rating Intelligence**: Dynamically aggregate average destination ratings and review counts via database pipeline hooks.
4. **Authentic Visual Representation**: Ensure 100% verified, local photographic representations of monuments, beaches, wildlife, and natural landscapes.
5. **Role-Based Moderation**: Empower platform administrators with moderation tools to maintain community trust and data integrity.

---

## 🌟 Key Features

- **Destination Discovery**: Browse 38 curated iconic Indian destinations across categories (Mountains, Beaches, Historical, Spiritual, Nature & Wildlife, Hill Stations, Adventure, Heritage).
- **Interactive Destination Cards**: Entire card surfaces are clickable with smooth micro-interaction hover lift, navigating directly to the spot details.
- **Natural Animated Hero Atmosphere**: Realistic cinematic panoramic drift with living atmospheric mist and floating sunlight particles on the landing page.
- **Accurate & Verified Photography**: 100% verified authentic local photography for all 38 destinations (including the genuine crescent Om Beach for Gokarna, Great Indian Rhinoceros for Kaziranga, Bengal Tigers for Jim Corbett, Charminar, Borra Caves, Taj Mahal, Golden Temple, Qutub Minar, etc.).
- **Search & Filtering**: Search destinations by name, city, or state. Filter by category, minimum rating, and sort by rating, review count, newest, or alphabetically.
- **Genuine Visitor Reviews**: Detailed reviews with star ratings (1–5), review titles, comprehensive comments, visit dates, and helpful vote counts.
- **Helpful Voting System**: Logged-in users can upvote helpful reviews with interactive toggling.
- **Rating Aggregation**: Automatic calculation of average destination ratings and 5-star distributions using MongoDB aggregation pipeline hooks.
- **User Authentication**: Secure JWT-based authentication stored in `httpOnly` cookies with bcrypt password hashing (12 rounds) and rate-limited endpoints.
- **User Profile Dashboard**: View submitted reviews, update name and username, edit or delete past reviews.
- **Admin Dashboard**: Comprehensive management console to view platform statistics, create/edit/delete destinations, moderate reviews, and activate/suspend user accounts.
- **Clean & Responsive UI**: Handcrafted responsive design with CSS custom property design tokens, accessible semantic HTML5, SVG icons, and smooth micro-interactions.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js (v18+) |
| **Backend Framework** | Express 5.x |
| **Database** | MongoDB with Mongoose 9.x |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` + `cookie-parser` |
| **Security & Validation** | `helmet`, `cors`, `express-rate-limit`, `express-validator` |
| **Frontend** | Semantic HTML5, Vanilla JavaScript (ES6+ Modules), Vanilla CSS (Custom Properties) |

---

## 📁 Project Structure

```text
Roamly/
├── .env                  # Environment configuration
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies and scripts (start, dev, seed)
├── server.js             # Server entry point with MongoDB connection
├── scripts/
│   └── seed.js           # Seeds 38 Indian destinations, admin user & reviews
├── src/
│   ├── app.js            # Express app configuration, security & static serving
│   ├── models.js         # Mongoose schemas (User, Destination, Review) & hooks
│   ├── middleware.js     # JWT auth, error handler & validation rules
│   └── routes.js         # Unified REST API router (/auth, /destinations, /reviews, etc.)
└── public/
    ├── css/
    │   └── style.css     # Unified styles & responsive breakpoints
    ├── js/
    │   ├── app.js        # Core API client, auth session, toast & UI helpers
    │   └── pages.js      # Page views & interactions (Home, Explore, Reviews, Admin)
    ├── images/destinations/ # 38 optimized Indian destination images
    └── *.html            # Clean semantic HTML pages
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js** v18.0.0 or higher
- **MongoDB** running locally on port `27017` (or a MongoDB Atlas connection string)

### 2. Installation

Clone or navigate into the project directory and install dependencies:

```bash
cd Roamly
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```ini
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/roamly
JWT_SECRET=your_secret_key_here
NODE_ENV=development

# Admin credentials
ADMIN_EMAIL=admin@roamly.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Roamly Admin
ADMIN_USERNAME=admin
```

### 4. Database Seeding

Run the seed command to populate Indian destinations, initialize the admin account, and insert sample community reviews:

```bash
npm run seed
```

Or run individual seed scripts:
```bash
npm run seed:destinations   # Seeds 38 Indian tourist destinations
npm run create-admin        # Initializes admin account
npm run seed:reviews        # Seeds sample users and reviews
```

### 5. Start the Application

Start the development server:

```bash
npm start
```

Visit **`http://localhost:3000`** in your browser.

---

## 🔑 Demo Credentials

### Administrator Account
- **Email:** `admin@roamly.com`
- **Password:** `Admin@123`
- **Capabilities:** Admin Dashboard, manage destinations, delete any review, suspend/activate user accounts.

### Community User Accounts
- **User 1:** `priya@example.com` / `Password@123` (Priya Sharma — `@priya_travels`)
- **User 2:** `rahul@example.com` / `Password@123` (Rahul Verma — `@rahul_v`)
- **User 3:** `ananya@example.com` / `Password@123` (Ananya Iyer — `@ananya_i`)

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Sign in & receive cookie + token | Public |
| `POST` | `/api/auth/logout` | Clear auth cookie | Public |
| `GET` | `/api/auth/me` | Get current logged-in user info | Private |

### Destinations (`/api/destinations`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/destinations` | List destinations (search, filter, sort, paginate) | Public |
| `GET` | `/api/destinations/categories` | Get distinct categories | Public |
| `GET` | `/api/destinations/:id` | Get destination by ID or slug | Public |
| `POST` | `/api/destinations` | Create destination | Admin |
| `PUT` | `/api/destinations/:id` | Update destination | Admin |
| `DELETE` | `/api/destinations/:id` | Delete destination & associated reviews | Admin |
| `GET` | `/api/destinations/:id/reviews`| Get paginated reviews & rating distribution | Public |
| `POST` | `/api/destinations/:id/reviews`| Create review for destination | Authenticated |

### Reviews (`/api/reviews`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/reviews/mine` | Get current user's submitted reviews | Authenticated |
| `PUT` | `/api/reviews/:id` | Update existing review | Owner / Admin |
| `DELETE` | `/api/reviews/:id` | Delete review & update destination rating | Owner / Admin |
| `POST` | `/api/reviews/:id/helpful` | Toggle helpful vote on a review | Authenticated |

### User Profile (`/api/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/users/me` | Fetch authenticated user profile | Authenticated |
| `PUT` | `/api/users/me` | Update name and username | Authenticated |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Platform totals (destinations, users, reviews, avg rating) | Admin |
| `GET` | `/api/admin/users` | List registered users with pagination & search | Admin |
| `PUT` | `/api/admin/users/:id/toggle-status` | Toggle user active/suspended state | Admin |
| `GET` | `/api/admin/reviews` | List all reviews for moderation | Admin |
| `DELETE` | `/api/admin/reviews/:id` | Moderate / delete review | Admin |

---

## 🔒 Security Best Practices

1. **Password Hashing**: Passwords are encrypted using `bcryptjs` with salt round factor 12 before being stored.
2. **Cookie Security**: Auth tokens use `httpOnly`, `sameSite: 'lax'`, and conditional HTTPS `secure: true` in production.
3. **HTTP Security Headers**: Powered by `helmet` to mitigate clickjacking, MIME-sniffing, and XSS.
4. **Rate Limiting**: Authentication endpoints (`/register`, `/login`) are throttled via `express-rate-limit` to prevent brute-force attacks.
5. **Input Validation**: Express-validator schemas validate and sanitize all user submissions before processing.
6. **Authorization Guards**: Strict middleware checks enforce user ownership on review updates/deletions and role verification for administrative actions.

---

## 🗄️ Database Models & Relationships

Roamly uses Mongoose ODM with three primary relational models:

```
[ User ] 1 ──── ∞ [ Review ] ∞ ──── 1 [ Destination ]
```

1. **User Model (`src/models.js` → `User`)**:
   - Fields: `name`, `username` (unique), `email` (unique), `password` (hashed), `role` (`'user'` or `'admin'`), `isActive`.
   - Hashes passwords pre-save and provides `.comparePassword()` method.

2. **Destination Model (`src/models.js` → `Destination`)**:
   - Fields: `name`, `slug` (unique), `city`, `state`, `category`, `description`, `images`, `bestTimeToVisit`, `entryFee`, `visitorTips`, `nearbyAttractions`, `averageRating`, `reviewCount`, `isFeatured`.
   - Has text indexes on `name`, `city`, `state`, and `description` for fast multi-field searching.

3. **Review Model (`src/models.js` → `Review`)**:
   - Fields: `destination` (ref to Destination), `user` (ref to User), `rating` (1–5), `title`, `comment`, `visitDate`, `helpfulVotes`.
   - Enforces compound unique index: `{ destination: 1, user: 1 }, { unique: true }` to guarantee a user can only review each place once.
   - Triggers `Review.calcAverageRating()` via post-save and post-delete hooks to automatically maintain destination aggregate ratings.

---

## ⚠️ Known Limitations & Future Scope

1. **Single Image Uploads in Form**: User-submitted reviews currently focus on rich text and numerical ratings; image file uploads from regular travelers could be handled via cloud storage (e.g. AWS S3 or Cloudinary) in a future iteration.
2. **Offline Mode**: While local destination images load offline once server is running, real-time reviews require the local Express and MongoDB services to be active.
3. **Email Verification**: User registration activates accounts immediately without requiring SMTP email verification tokens.

