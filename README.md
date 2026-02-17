# WishWise

A simple, intentional wishlist app that helps users organize, prioritize, and plan future purchases.

## Authors

- Rahul Nayak
- Raagini Tyagi

## Class Link

[Insert your class link here]

## Objective

WishWise is a web application designed to help users manage and organize items they want to purchase in the future. Instead of scattered notes, bookmarks, browser tabs, or shopping lists, users can track wishlist items in one place with optional product links, prices, priorities, and statuses. Items can be grouped into optional categories to support flexible organization without enforcing strict relationships. The application emphasizes intentional consumption and planning rather than impulse buying.

### Key Features

- **Items Management**: Full CRUD operations for wishlist items with:
  - Title (required)
  - Optional product link and price
  - Priority level (1-5, required)
  - Status (considering, want, bought, archived)
  - Optional category assignment
  - Notes field

- **Categories Management**: Full CRUD operations for categories:
  - Create, view, update, and delete categories
  - Categories are independent of items
  - When a category is deleted, items become uncategorized (not deleted)

- **Filtering & Sorting**: 
  - Filter items by status
  - Sort items by priority or title
  - Sort order (ascending/descending)

## Screenshot

![WishWise Application](screenshot.png)

## Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB (native driver, no Mongoose)
- **Frontend**: Vanilla JavaScript (client-side rendering)
- **Styling**: CSS modules organized by component

## Structure

```
WishWise/
├── database/
│   └── connection.js          # MongoDB connection module
├── routes/
│   ├── items.js               # Items CRUD API routes
│   └── categories.js          # Categories CRUD API routes
├── scripts/
│   └── seed.js                # Database seeding script
├── public/
│   ├── index.html             # Main HTML page
│   ├── css/
│   │   ├── reset.css         # CSS reset
│   │   ├── layout.css        # Layout styles
│   │   ├── header.css        # Header styles
│   │   ├── items.css         # Items component styles
│   │   ├── categories.css    # Categories component styles
│   │   ├── forms.css         # Form styles
│   │   └── modal.css         # Modal styles
│   └── js/
│       ├── main.js           # Main application entry
│       ├── api.js             # API communication module
│       ├── items.js           # Items management module
│       └── categories.js      # Categories management module
├── server.js                  # Express server
├── package.json               # Dependencies and scripts
├── .eslintrc.json            # ESLint configuration
├── .prettierrc               # Prettier configuration
└── README.md                  # This file
```

## Instructions to Build

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas connection string)
- npm or yarn

### Installation

1. **Clone or download the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=wishwise
   ```
   
   For MongoDB Atlas, use:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
   MONGODB_DB_NAME=wishwise
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running locally, or use a MongoDB Atlas connection string.

5. **Seed the database (optional)**
   
   To populate the database with sample data (1,000+ records):
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   npm start
   ```

7. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Development

For development with auto-reload:
```bash
npm run dev
```

## Usage Instructions

### Adding Items

1. Click the "Add Item" button
2. Fill in the required fields:
   - **Title**: Name of the item you want
   - **Priority**: Select a priority level (1-5, where 5 is highest)
   - **Status**: Choose from considering, want, bought, or archived
3. Optionally add:
   - Product link
   - Price
   - Category (select from existing categories or leave uncategorized)
   - Notes
4. Click "Save Item"

### Managing Items

- **Filter**: Use the status filter dropdown to show items by status
- **Sort**: Choose to sort by priority or title, and select sort order
- **Edit**: Click the "Edit" button on any item card to modify it
- **Delete**: Click the "Delete" button to remove an item

### Managing Categories

1. Click "Add Category" in the categories sidebar
2. Enter a category name (required) and optional description
3. Click "Save Category"
4. Edit or delete categories using the buttons on each category card
5. **Note**: Deleting a category will make all items in that category uncategorized (items are not deleted)

## API Endpoints

### Items

- `GET /api/items` - Get all items (with optional query params: status, sortBy, sortOrder)
- `GET /api/items/:id` - Get a single item
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a single category
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

## Security Notes

- Database credentials are stored in environment variables (`.env` file)
- The `.env` file is excluded from version control via `.gitignore`
- Never commit sensitive credentials to the repository

## License

MIT License - see LICENSE file for details
