# Business Management System

A comprehensive multi-tenant business management platform built with React and Vite, designed to streamline operations across different organizational roles and hierarchies.

## Overview

This application provides role-based dashboards and workflows for managing business operations including order processing, inventory management, sales analytics, financial tracking, and team coordination.

## Tech Stack

- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.8.2
- **Styling**: Tailwind CSS 3.4.15
- **UI Components**: 
  - Material-UI (MUI) 7.3.4
  - Headless UI 2.2.9
  - Radix UI
  - Lucide React (icons)
- **State Management**: React Context API, TanStack Query 5.85.9
- **Forms**: React Hook Form 7.62.0
- **Animations**: Framer Motion 12.23.12
- **Charts**: Recharts 3.2.0
- **Internationalization**: i18next 25.6.0
- **HTTP Client**: Axios 1.11.0
- **PDF Generation**: jsPDF 3.0.3 with jspdf-autotable
- **Notifications**: React Hot Toast 2.6.0, React Toastify 11.0.5

## Features

### User Roles & Dashboards

- **Super Admin**: Company management, system-wide oversight
- **Managing Director**: Executive dashboard, factory reports, financial reports, operations, analytics
- **Sales Manager**: Team management, distributor onboarding, pricing catalog, order tracking
- **Accountant**: Payment processing, invoice management, client management, sales analytics
- **Store Manager**: Stock management, stock transfers, order processing
- **Warehouse Manager**: Order fulfillment, inventory management
- **Wholesaler**: Order placement, invoice tracking, stock management
- **Retailer**: Order management, invoice tracking, wholesaler relationships
- **Distributor**: Order processing, price management, sales analytics

### Core Functionality

- Multi-tenant architecture with role-based access control
- Order processing workflow (process → fulfill → post-process)
- Inventory and stock management
- Price management and reduction tracking
- Invoice generation and payment tracking
- Sales analytics and reporting
- Team management and user permissions
- Real-time notifications
- Multi-language support
- Dark/Light theme support

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Alternative: Start with Vite directly
npm run dev:vite
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Project Structure

```
src/
├── accountant/         # Accountant role components and pages
├── assets/            # Static assets (images, fonts, etc.)
├── components/        # Shared components
├── config/            # Configuration files
├── context/           # React Context providers
├── contexts/          # Additional context providers
├── distributor/       # Distributor role components and pages
├── lib/               # Utility libraries
├── pages/             # Shared pages (auth, legal, etc.)
├── retailer/          # Retailer role components and pages
├── sales-manager/     # Sales Manager role components and pages
├── store-manager/     # Store Manager role components and pages
├── super-admin/       # Super Admin role components and pages
├── utils/             # Utility functions
├── wholesaler/        # Wholesaler role components and pages
├── App.jsx            # Main application component
└── main.jsx           # Application entry point
```

## Environment Variables

Create a `.env` file in the root directory with the necessary environment variables for your backend API and other services.

## Authentication

The application uses JWT-based authentication with the following flows:
- Login/Register
- Tenant registration
- System user registration
- Password reset (Forgot Password → OTP Verification → Reset)

## Legal Pages

- Privacy Policy
- Terms of Service
- Cookie Policy

## Contributing

1. Follow the existing code structure and naming conventions
2. Use React hooks and functional components
3. Maintain role-based access control patterns
4. Test across different user roles before submitting changes

## License

Private - All rights reserved
