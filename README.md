# The Westwood Booking System
## Description
TWW Booking is a comprehensive React-based booking management system designed for The Westwood. Its primary purpose is to streamline the process of creating, searching, viewing, and updating room bookings for staff, while leveraging Google Sheets as the backend data store and Google Drive for document management.

## Key Features

- Google Authentication: Secure login using Google OAuth, ensuring only authorized staff can access the system.
- Dashboard: Provides an overview of booking statistics, including total bookings, upcoming bookings, today's check-ins, and check-outs.
- Booking Management: Enables staff to create new bookings, update existing ones, and search for bookings using various filters.
- Receipt Generation: Allows users to generate and print receipts for bookings directly from the application.
- Google Drive Integration: Facilitates document management by allowing users to upload and access files related to bookings.

## Architecture & Components

- **App.jsx**: Sets up routing and layout for the app.
- **Navbar.jsx**: Provides navigation links and handles authentication status.
- **ProtectedRoute.jsx**: Ensures only authenticated users can access certain routes.
- **AuthContext.jsx**: Manages user authentication state and provides context to components.
- **Dashboard.jsx**: Displays booking statistics and quick actions.
- **Booking.jsx**: Form for creating and editing bookings.
- **BookingList.jsx**: Shows a list of all bookings with options to view/edit.
- **BookingSearch.jsx**: Allows searching bookings by various filters.
- **Customer.jsx**: Manages customer information.
- **Payments.jsx**: Handles payment records and status.
- **Documents.jsx**: Integrates with Google Drive for document management.
- **Roles.jsx**: Manages user roles and permissions.
- **Rooms.jsx**: Manages room details and availability.
- **User.jsx/Users.jsx**: User profile and user management.
- **AvailabilityChart.jsx**: Visualizes room availability.

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
│   │   ├── BookingSearch.jsx # Booking search component
│   │   ├── Dashboard.jsx    # Dashboard component
│   │   ├── Navbar.jsx       # Navigation bar component
│   │   ├── constants.js     # Application constants
│   │   └── css/             # Component-specific styles
├── index.html              # HTML entry point
├── package.json            # Project dependencies
└── vite.config.js          # Vite configuration
```




## User Navigation Flow
1. **Login**: User lands on the login page and authenticates via Google OAuth.
2. **Dashboard**: After login, user sees booking statistics and navigation options.
3. **Booking Management**:
   - Create new booking via Dashboard or Navbar
   - Search bookings using filters
   - View/edit booking details
   - Generate and print receipts
4. **Customer Management**: Access customer details and update information.
5. **Payments**: Manage payments related to bookings.
6. **Documents**: Upload/view documents via Google Drive integration.
7. **Rooms/Roles/Users**: Manage rooms, user roles, and user profiles.

## Local Development Setup
1. **Clone the repository**:
```bash
   git clone <repository-url>
   cd tww-booking
   npm install
    # or
   yarn install
   ```
2. **Configure Google API credentials**:
   - Create a project in Google Cloud Platform
   - Enable Google Sheets and Drive APIs
   - Create OAuth 2.0 credentials
   - Update src/modules/config.js with your credentials
   
```bash
export const CLIENT_ID = "your-client-id.apps.googleusercontent.com";
export const API_KEY = "your-api-key";
export const SCOPES = "https://www.googleapis.com/auth/drive ";
```
3. **Start the development server**:
```bash
   npm start
   # or
   yarn start
   ```
4. **Build for production**:
```bash
   npm run build
   # or
   yarn build
   ```
## Deployment to GitHub Pages via GitHub Actions
1. **Configure GitHub Pages**:
    - Set the repository's GitHub Pages source to the gh-pages branch.
2. **Add GitHub Actions workflow**:
    - Create .github/workflows/deploy.yml with the following:
```bash
name: Deploy to GitHub Pages
on:
  push:
    branches:
      - main
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. **Push changes to github**:
```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

4. **Access your site**:
   - Open [https://tww-kookal.github.io/tww-bill-generator/](https://tww-kookal.github.io/tww-bill-generator/) in your browser.

## License
```
MIT License

Let me know if you want further customization or more details for any section.
```
