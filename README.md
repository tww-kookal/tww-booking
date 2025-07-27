# The Westwood Booking System

A React-based booking management system for The Westwood, allowing staff to create, search, view, and update room bookings with Google Sheets integration for data storage.

## Features

- **Google Authentication**: Secure login with Google OAuth
- **Dashboard**: View booking statistics including total bookings, upcoming bookings, today's check-ins, and check-outs
- **Booking Management**: Create, view, update, and search bookings
- **Receipt Generation**: Generate printable receipts for bookings
- **Google Sheets Integration**: Store and retrieve booking data from Google Sheets

## Project Structure

```
├── src/
│   ├── App.jsx              # Main application component with routing
│   ├── App.css              # Main application styles
│   ├── config.js            # Google API configuration
│   ├── main.jsx             # Application entry point
│   ├── components/
│   │   ├── Booking.jsx      # Booking form component
│   │   ├── Booking.css      # Booking form styles
│   │   ├── Dashboard.jsx    # Dashboard component
│   │   ├── Navbar.jsx       # Navigation bar component
│   │   ├── SearchBooking.jsx # Booking search component
│   │   ├── constants.js     # Application constants
│   │   └── css/             # Component-specific styles
├── index.html              # HTML entry point
├── package.json            # Project dependencies
└── vite.config.js          # Vite configuration
```

## Dependencies

- **React**: ^18.2.0
- **React Router**: ^7.7.1
- **Axios**: ^1.6.2
- **GAPI Script**: ^1.2.0
- **JWT Decode**: ^4.0.0
- **Vite**: ^4.3.0 (Development)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud Platform account with Sheets API enabled
- Google Sheet for storing booking data

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd the-westwood-booking
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Configure Google API credentials:
   - Create a project in Google Cloud Platform
   - Enable Google Sheets API and Google Drive API
   - Create OAuth 2.0 credentials
   - Update `src/config.js` with your credentials:
     ```js
     export const CLIENT_ID = "your-client-id.apps.googleusercontent.com";
     export const API_KEY = "your-api-key";
     export const SCOPES = "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets";
     export const SHEET_ID = "your-google-sheet-id";
     ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Build for production:
   ```bash
   npm run build
   # or
   yarn build
   ```

## Usage

### Authentication

Users must sign in with Google to access the application. The app requires permissions to access Google Sheets and Drive APIs.

### Dashboard

The dashboard displays booking statistics and provides quick access to create new bookings or search existing ones.

### Creating a Booking

1. Click "New Booking" in the navbar or "Create New Booking" on the dashboard
2. Fill in the required booking details:
   - Room Name
   - Customer Name
   - Check-in/Check-out Dates
   - Contact Number
   - Number of People
   - Status
   - Source of Booking
   - Room Amount
3. Optional fields include:
   - Advance Payment
   - Food
   - Camp Fire
   - Remarks
4. The system automatically calculates:
   - Number of Nights
   - Commission (based on booking source)
   - Balance to Pay
   - TWW Revenue
5. Click "Save Booking" to store the booking

### Searching Bookings

1. Click "Search Bookings" in the navbar
2. Filter bookings by:
   - Booking Date
   - Guest Name
   - Check-in Date
   - Contact Number
3. Click "Search" to view matching bookings
4. Click "View Details" on any booking to view or edit its details

### Generating Receipts

1. Open a booking
2. Click "Generate Receipt"
3. A printable receipt will open in a new tab

## Google Sheets Structure

The application expects the following column structure in your Google Sheet:

1. Room Name
2. Customer Name
3. Booking Date
4. Check-in Date
5. Check-out Date
6. Contact Number
7. Number of People
8. Number of Nights
9. Status
10. Source of Booking
11. Room Amount
12. Advance Paid
13. Advance Paid To
14. Food
15. Camp Fire
16. Commission
17. Balance to Pay
18. TWW Revenue
19. Balance Paid To
20. Remarks

## License

[Your License Information]