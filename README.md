# 🌾 Krishi Khata — Backend API

Production-ready Node.js + Express + MongoDB backend for the Krishi Khata farmer financial management app.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Environment is already configured in .env
#    MongoDB URI is set — just run:
npm run dev

# 3. Verify server is running
curl http://localhost:3000/health
```

---

## 📁 Project Structure

```
src/
├── app.js                    # Entry point — express setup, route registration
├── config/
│   ├── app.js                # All config values from .env
│   └── db.js                 # MongoDB connection with reconnect handling
├── utils/
│   ├── AppError.js           # Custom operational error class
│   ├── apiResponse.js        # Standardized response helpers
│   ├── asyncHandler.js       # Wraps async controllers (no try/catch needed)
│   ├── jwtHelper.js          # JWT generate + verify
│   └── logger.js             # Winston logger (console + file)
├── middlewares/
│   ├── auth.js               # JWT protect middleware
│   ├── errorHandler.js       # Global error handler (handles Mongoose errors too)
│   ├── notFound.js           # 404 handler
│   ├── rateLimiter.js        # API limiter + strict auth limiter
│   └── validate.js           # Joi request body validation
├── models/                   # 11 Mongoose models
│   ├── Farmer.model.js
│   ├── Field.model.js
│   ├── Crop.model.js
│   ├── Expense.model.js
│   ├── ExpenseCategory.model.js
│   ├── Bataidaar.model.js
│   ├── Production.model.js
│   ├── Sale.model.js
│   ├── Settlement.model.js
│   ├── Loan.model.js
│   └── Dealer.model.js
├── validations/              # Joi schemas for every route
│   ├── auth.validation.js
│   ├── field.validation.js
│   ├── crop.validation.js
│   ├── expense.validation.js
│   ├── category.validation.js
│   ├── bataidaar.validation.js
│   ├── production.validation.js
│   ├── sale.validation.js
│   ├── loan.validation.js
│   └── dealer.validation.js
├── services/                 # All business logic lives here
│   ├── auth.service.js
│   ├── field.service.js      # Cascade soft delete (field → crops → expenses)
│   ├── crop.service.js       # Crop diary photos, cascade delete
│   ├── expense.service.js
│   ├── category.service.js   # Seeds 15 system categories on startup
│   ├── bataidaar.service.js  # Keeps crops.bataidaarId in sync
│   ├── production.service.js # Manages unsoldBalance
│   ├── sale.service.js       # Auto-updates unsoldBalance on create/delete
│   ├── settlement.service.js # Full settlement engine from PRD Section 12
│   ├── loan.service.js
│   ├── dealer.service.js
│   ├── trash.service.js      # View all soft-deleted items across all collections
│   └── sync.service.js       # Offline-first batch upsert for Flutter sync
├── controllers/              # Thin HTTP handlers — delegates to services
└── routes/                   # Express routers
```

---

## 🔌 All API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | Public | Register farmer after OTP |
| POST | `/api/v1/auth/login` | Public | Login with mobile |
| GET | `/api/v1/auth/me` | ✅ | Get own profile |
| PATCH | `/api/v1/auth/me` | ✅ | Update profile |

### Fields
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/fields` | All active fields |
| POST | `/api/v1/fields` | Create field |
| GET | `/api/v1/fields/:fieldId` | Single field |
| PATCH | `/api/v1/fields/:fieldId` | Update field |
| DELETE | `/api/v1/fields/:fieldId` | Soft delete + cascade |
| PATCH | `/api/v1/fields/:fieldId/restore` | Restore from trash |

### Crops
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/crops/field/:fieldId` | Crops by field |
| POST | `/api/v1/crops` | Create crop |
| GET | `/api/v1/crops/:cropId` | Single crop |
| PATCH | `/api/v1/crops/:cropId` | Update crop |
| DELETE | `/api/v1/crops/:cropId` | Soft delete + cascade |
| PATCH | `/api/v1/crops/:cropId/restore` | Restore from trash |
| POST | `/api/v1/crops/:cropId/photos` | Add crop diary photo |
| DELETE | `/api/v1/crops/:cropId/photos` | Remove crop diary photo |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/expenses/crop/:cropId` | Expenses for a crop (filter: `?phase=management`) |
| POST | `/api/v1/expenses` | Add expense |
| PATCH | `/api/v1/expenses/:expenseId` | Update expense |
| DELETE | `/api/v1/expenses/:expenseId` | Soft delete |
| PATCH | `/api/v1/expenses/:expenseId/restore` | Restore |

### Expense Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories` | All categories (filter: `?phase=management`) |
| POST | `/api/v1/categories` | Create custom category |
| PATCH | `/api/v1/categories/:categoryId/toggle` | Show/hide category |
| DELETE | `/api/v1/categories/:categoryId` | Delete custom category |

### Bataidaars
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/bataidaars/crop/:cropId` | Get bataidaar for crop |
| POST | `/api/v1/bataidaars` | Add bataidaar (auto-links to crop) |
| PATCH | `/api/v1/bataidaars/:bataidaarId` | Update bataidaar |
| DELETE | `/api/v1/bataidaars/:bataidaarId` | Soft delete (unlinks from crop) |
| PATCH | `/api/v1/bataidaars/:bataidaarId/restore` | Restore (re-links to crop) |

### Productions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/productions/crop/:cropId` | Get harvest record |
| POST | `/api/v1/productions` | Record harvest (marks crop as harvested) |
| PATCH | `/api/v1/productions/:productionId` | Update harvest |
| DELETE | `/api/v1/productions/:productionId` | Soft delete + cascade sales |
| PATCH | `/api/v1/productions/:productionId/restore` | Restore + cascade sales |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/sales/crop/:cropId` | Sales by crop |
| GET | `/api/v1/sales/production/:productionId` | Sales by production |
| POST | `/api/v1/sales` | Record sale (auto-reduces unsoldBalance) |
| PATCH | `/api/v1/sales/:saleId` | Update sale |
| DELETE | `/api/v1/sales/:saleId` | Soft delete (restores unsoldBalance) |
| PATCH | `/api/v1/sales/:saleId/restore` | Restore (re-deducts unsoldBalance) |

### Settlements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/settlements` | All settlements (yearly summary) |
| GET | `/api/v1/settlements/crop/:cropId/preview` | Calculate without saving |
| POST | `/api/v1/settlements/crop/:cropId/finalize` | Save immutable snapshot |
| GET | `/api/v1/settlements/crop/:cropId` | Get saved settlement |

### Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/loans` | All loans (filter: `?status=active`) |
| POST | `/api/v1/loans` | Add loan |
| GET | `/api/v1/loans/:loanId` | Single loan |
| PATCH | `/api/v1/loans/:loanId` | Update loan |
| DELETE | `/api/v1/loans/:loanId` | Soft delete |
| PATCH | `/api/v1/loans/:loanId/restore` | Restore |

### Dealers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dealers` | All dealers |
| POST | `/api/v1/dealers` | Add dealer |
| GET | `/api/v1/dealers/:dealerId` | Single dealer |
| GET | `/api/v1/dealers/:dealerId/ledger` | Dealer + all tagged expenses |
| PATCH | `/api/v1/dealers/:dealerId` | Update dealer |
| POST | `/api/v1/dealers/:dealerId/payment` | Mark payment (reduces balance) |
| DELETE | `/api/v1/dealers/:dealerId` | Delete dealer |

### Trash
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/trash` | All deleted items with days remaining |
| PATCH | `/api/v1/trash/restore` | Restore any item `{ type, id }` |

### Offline Sync (Flutter → MongoDB)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/sync/fields` | Batch upsert fields |
| POST | `/api/v1/sync/crops` | Batch upsert crops |
| POST | `/api/v1/sync/expenses` | Batch upsert expenses |
| POST | `/api/v1/sync/bataidaars` | Batch upsert bataidaars |
| POST | `/api/v1/sync/productions` | Batch upsert productions |
| POST | `/api/v1/sync/sales` | Batch upsert sales |
| POST | `/api/v1/sync/loans` | Batch upsert loans |
| POST | `/api/v1/sync/dealers` | Batch upsert dealers |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

---

## 📨 API Response Format

Every response follows this standard shape:

```json
// Success
{
  "success": true,
  "message": "Fields fetched",
  "data": [...],
  "meta": { "count": 3 }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "mobile", "message": "Enter a valid 10-digit mobile number" }
  ]
}
```

---

## 🔐 Authentication

All routes except `/auth/register` and `/auth/login` require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

Tokens expire in **7 days**. Send mobile number to `/auth/login` to get a new token.

---

## 🔄 Offline Sync Flow

Flutter app sends pending SQLite records to sync endpoints:

```json
POST /api/v1/sync/expenses
{
  "records": [
    { "expenseId": "uuid", "cropId": "uuid", "amount": 1200, ... },
    { "expenseId": "uuid2", ... }
  ]
}

// Response
{
  "success": true,
  "message": "Synced 2 records",
  "data": {
    "syncedIds": ["uuid", "uuid2"],
    "failedIds": []
  }
}
```

---

## 🗑 Trash System

Soft-deleted records stay for **30 days** then are auto-purged by MongoDB TTL indexes.

```json
GET /api/v1/trash
// Response groups items by type with days remaining
{
  "data": {
    "expenses": [
      { "expenseId": "...", "_daysRemaining": 27, "_trashType": "expense", ... }
    ],
    "crops": [...],
    "summary": { "totalItems": 3 }
  }
}

// Restore any item
PATCH /api/v1/trash/restore
{ "type": "expense", "id": "uuid-here" }
```

---

## ⚙️ Settlement Engine

Matches PRD Section 12 exactly:

```
profitLoss            = totalIncome - totalExpense
profitPerAcre         = profitLoss / field.areaAcres
bataidaarShareValue   = (sharePercent / 100) × totalIncome
bataidaarExpensesPaid = SUM(expenses WHERE paidBy = 'bataidaar')
netPayable            = bataidaarShareValue - bataidaarExpensesPaid
```

Preview (no save) → `GET /settlements/crop/:cropId/preview`
Finalize (saves immutable snapshot) → `POST /settlements/crop/:cropId/finalize`

---

## 📦 npm Scripts

```bash
npm run dev       # Start with nodemon (auto-restart on file change)
npm start         # Production start
npm run lint      # ESLint check
npm run lint:fix  # ESLint auto-fix
npm run format    # Prettier format
```

---

## 🔒 Security Features

- **Helmet** — sets secure HTTP headers
- **CORS** — whitelist via `ALLOWED_ORIGINS` env var
- **Rate limiting** — 100 req/15min for API, 10 req/15min for auth routes
- **JWT** — 7-day expiry, stored in `EncryptedSharedPreferences` on device
- **Joi validation** — every request body validated before hitting controller
- **Farmer isolation** — every query filters by `farmerId` from JWT payload
- **Input sanitization** — Mongoose schema types enforce data integrity

---

## 🌱 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` / `production` |
| `MONGODB_URI` | MongoDB Atlas URI | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing key | `long_random_string` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `ALLOWED_ORIGINS` | CORS whitelist (comma separated) | `http://localhost:3000` |
| `CLOUDINARY_*` | For photo uploads | See `.env.example` |
