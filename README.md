# The Westwood Booking System
## Description
The Westwood Booking System is a React-based booking management system designed for The Westwood. Its primary purpose is to streamline the process of creating, searching, viewing, and updating room bookings for staff, while leveraging Google Sheets as the backend data store and Google Drive for document management.

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

## Seamless Connectivity with Python FastAPI Backend (`tww-service`)

The TWW Booking ReactJS frontend is designed for robust, seamless integration with the Python-based FastAPI backend, [`tww-service`](https://github.com/tww-kookal/tww-service). Here’s how this connectivity is achieved in detail:

### 1. API-Driven Communication
All frontend actions—such as booking rooms, managing customers, processing payments, and generating reports—are performed via RESTful API calls to the FastAPI backend. The backend exposes endpoints for each business function, and the frontend sends HTTP requests (GET, POST, PUT, DELETE) with JSON payloads. Responses are parsed and rendered in real time, ensuring a dynamic and interactive user experience.

### 2. Authentication & Authorization
- **Google OAuth**: Users authenticate via Google OAuth in the frontend. The resulting token is sent to the backend for verification.
- **Session Management**: The backend validates tokens, issues JWTs or session cookies, and enforces role-based access control. The frontend includes these tokens in all subsequent requests, ensuring secure access to protected resources.
- **Role Awareness**: The frontend adapts its UI based on user roles, hiding or showing admin features as appropriate.

### 3. Data Synchronization
- **Module Mapping**: Each frontend module (Booking, Customer, Payments, Reports) maps directly to backend routers. For example, booking creation triggers a POST to `/api/bookings`, while payment recording uses `/api/payments`.
- **Live Updates**: The frontend periodically fetches updated data (e.g., room availability, payment status) to keep the UI current. Optimistic UI updates and error handling provide a smooth experience.

### 4. Error Handling
- **Consistent Feedback**: The backend returns standardized error codes and messages. The frontend interprets these and displays clear notifications, guiding users to resolve issues.

### 5. Environment Configuration
- **Backend URL**: The frontend’s `.env` files specify the FastAPI backend URL (e.g., `VITE_API_BASE_URL`), allowing easy switching between development, staging, and production.
- **CORS**: The backend is configured to accept cross-origin requests from the frontend’s domain, enabling secure communication.

### 6. Google Drive Integration
- **Data Sync**: Actions like booking and payment trigger backend logic that updates Google Drive. The frontend displays sync status and feedback to users.

### 7. Deployment & Scalability
- **Decoupled Deployment**: The frontend (on GitHub Pages) and backend (on Railway.app or other platforms) are independently deployable. As long as the API base URL is set, the frontend can connect to any backend instance, supporting scalability and maintainability.

### 8. Security Best Practices
- **HTTPS**: All communication is encrypted via HTTPS.
- **Token Expiry**: The frontend gracefully handles token expiry, prompting re-authentication as needed.

### 9. Extensibility
- **Modular Design**: Both frontend and backend are modular, allowing rapid addition of new features and endpoints. The frontend can consume new APIs as they are exposed.

---

**Summary:**
The ReactJS frontend and FastAPI backend are tightly integrated through a secure, scalable, and modular API architecture. This ensures that user actions in the frontend are instantly reflected in backend operations, with real-time feedback, robust authentication, and seamless data synchronization.

For backend details, see [`tww-service`](https://github.com/tww-kookal/tww-service).

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
   - Open [https://tww-kookal.github.io/tww-booking/](https://tww-kookal.github.io/tww-booking/) in your browser.

## License
```
MIT License

Let me know if you want further customization or more details for any section.
```
