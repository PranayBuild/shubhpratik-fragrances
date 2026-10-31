# 🏭 SHUBHPRATIK Fragrances – Inventory Management System

A modern, responsive inventory and manufacturing management system designed for **SHUBHPRATIK Fragrances** to manage daily factory operations, workforce, production, stock, purchases, sales, and billing in one centralized platform.

## 📌 About the Project

SHUBHPRATIK Fragrances Inventory Management System is a web-based application developed to simplify and digitize the day-to-day operations of a fragrance manufacturing business.

The system provides a centralized dashboard where administrators and staff can manage factory activities, monitor inventory, record production, track purchases and sales, and generate business reports.

The application features a modern dark-themed interface with a premium purple and golden visual design.

## ✨ Key Features

### 1. 👥 Worker Management
- Add, update, and manage worker information.
- Track daily worker attendance.
- Monitor active and inactive worker status.
- Calculate monthly worker compensation.

### 2. 🏭 Production Management
- Record daily manufacturing production.
- Track fragrance-wise production.
- Monitor total production in kilograms and units.
- Maintain production history.

### 3. 📦 Inventory & Stock Management
- Manage raw materials and stock quantities.
- Monitor available inventory.
- Track daily stock consumption.
- Update and adjust stock quantities.

### 4. 💰 Purchase & Sales Management
- Record purchase transactions.
- Maintain sales records.
- Track financial transactions.
- View date-wise purchase and sales summaries.

### 5. 🧾 Billing Management
- Maintain billing records.
- Manage business transactions.
- Access billing information.

### 6. 📊 Reports & Analytics
- View business activity summaries.
- Track production and inventory information.
- Monitor purchases and sales.
- Generate useful operational insights.

### 7. 🔐 Login & Access Management
- Administrator and staff roles.
- Login interface with role selection.
- Google sign-in integration support.
- User session management.

### 8. 🎨 Modern User Interface
- Premium dark-themed dashboard.
- Responsive design for different screen sizes.
- Animated interface elements.
- Background video and custom brand identity.
- Print and Save as PDF functionality.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| TypeScript | Type safety and application logic |
| Vite | Development server and build tool |
| Tailwind CSS | Styling and responsive design |
| Firebase | Cloud database and authentication integration |
| Cloud Firestore | Data storage and synchronization |
| Lucide React | Icons |
| Motion | UI animations |
| HTML5 & CSS3 | Web structure and styling |
| JavaScript | Application functionality |

## 📂 Project Structure

```text
shubhpratik-fragrances-inventory/
│
├── public/
│   ├── shubhpratik-logo.jpeg
│   └── background-video.mp4
│
├── src/
│   ├── components/
│   │   ├── BillsSection.tsx
│   │   ├── LoginView.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProductionSection.tsx
│   │   ├── PurchaseSellsSection.tsx
│   │   ├── ReportSection.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StocksSection.tsx
│   │   └── WorkersSection.tsx
│   │
│   ├── context/
│   │   └── InventoryContext.tsx
│   │
│   ├── data/
│   │   └── initialData.ts
│   │
│   ├── lib/
│   │   └── firebase.ts
│   │
│   ├── types/
│   │   └── inventory.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── firebase.json
├── firestore.rules
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Installation & Setup

Follow these steps to run the project locally.

### Prerequisites

- Node.js (LTS version recommended)
- npm
- Git
- Firebase project (for cloud database functionality)

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### Step 2: Navigate to the Project Folder

```bash
cd shubhpratik-fragrances-inventory
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Firebase

Configure your Firebase project and update the Firebase configuration used by the application.

Enable Cloud Firestore and configure the required authentication services.

Make sure your Firestore security rules are properly configured before deployment.

### Step 5: Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal (normally http://localhost:3000).

### Step 6: Build for Production

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## 🗄️ Database

The project integrates Firebase Cloud Firestore for cloud data storage and synchronization.

The application manages collections related to:

- Workers
- Worker Daily Status
- Productions
- Fragrance Scents
- Stocks
- Bills
- Purchases
- Sales

Local browser storage is also used to maintain application state.

## 🔮 Future Improvements

- Advanced analytics and interactive charts.
- Export reports to Excel and PDF.
- Automated low-stock notifications.
- Enhanced role-based permissions.
- Improved authentication and security.
- Advanced financial management.
- Mobile application integration.
- Automated backup and recovery.

## 🎯 Project Objective

The main objective of this project is to replace traditional manual inventory management with a digital system that improves operational efficiency, reduces manual errors, simplifies record keeping, and provides better visibility into factory operations.

## 👨‍💻 Developer

**Project:** SHUBHPRATIK Fragrances Inventory Management System

**Category:** Web Development / Inventory Management

**Status:** Development

---

⭐ If you find this project interesting, consider giving this repository a star!

**Made with ❤️ for SHUBHPRATIK Fragrances.**
