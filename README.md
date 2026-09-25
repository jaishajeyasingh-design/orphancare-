# OrphanCare+ Residential Center Portal

OrphanCare+ is a dedicated, full-stack residential care management portal for a single orphanage home. It streamlines internal home operations, resident (orphan children & elderly) management, donor contributions, volunteer activity drives, guardian ward updates, and adoption application workflows in one centralized hub.


## 🌟 Features

- **Role-Based Access Control**: Secure dashboards tailored for 5 distinct roles: Administrator, Donor, Volunteer, Adopter, and Guardian.
- **Secure Donations & Fee Payments**: Integrated with Razorpay for secure server-side verified digital transactions.
- **Resident Management**: Complete tracking of residents, their requirements, and progress.
- **Volunteer Tracking**: Activity management and tracking for volunteers.
- **Modern User Interface**: Built with an intuitive, dynamic SaaS-style dashboard using React and styled with Tailwind CSS v4.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Payment Gateway**: Razorpay

## 📁 Project Structure

```text
OrphanCare/
├── client/          # React.js frontend application
├── server/          # Node.js + Express backend application
└── README.md        # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (local instance or MongoDB Atlas)
- Razorpay Account (API keys)

### Installation

1. **Navigate to the project folder:**
   ```bash
   cd OrphanCare
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration:**
   - Create a `.env` file in the `server/` directory and configure your MongoDB URI, Razorpay keys, and other required environment variables.

### Running the Application

1. **Start the Backend Server:**
   ```bash
   cd server
   npm run dev
   # Server typically runs on http://localhost:5000
   ```

2. **Start the Frontend Development Server:**
   ```bash
   cd ../client
   npm run dev
   # Client typically runs on http://localhost:5173
   ```
