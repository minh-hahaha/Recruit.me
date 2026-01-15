# Recruit.me Frontend

This is the Next.js frontend application for Recruit.me, a recruitment platform connecting applicants with companies.

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The page will auto-update as you edit files in the `src/app` directory.

## Project Structure

```
src/app/
├── applicant/          # Applicant-facing pages
│   ├── apply/         # Apply to jobs
│   ├── edit/          # Edit profile
│   ├── login/         # Applicant login
│   ├── profile/       # View profile
│   ├── register/      # Applicant registration
│   └── search/        # Search jobs
├── company/           # Company-facing pages
│   ├── edit/          # Edit company profile
│   ├── job/           # Job management
│   │   ├── applicants/ # View applicants for a job
│   │   ├── create/    # Create new job
│   │   └── edit/      # Edit job
│   ├── login/         # Company login
│   ├── offers/        # Manage offers
│   ├── profile/       # View company profile
│   ├── register/      # Company registration
│   └── skills-search/ # Search applicants by skills
├── admin/             # Admin pages
│   ├── login/         # Admin login
│   ├── profile/       # Admin profile
│   ├── reportApplicants/ # Applicant reports
│   ├── reportCompanies/  # Company reports
│   └── reportJobs/    # Job reports
├── api/               # API route handlers
└── page.tsx           # Landing page
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Styling

This project uses:
- **Tailwind CSS 4** for styling
- **Geist font** (automatically optimized via Next.js)

## Dependencies

### Production
- `next`: 16.0.0
- `react`: 19.2.0
- `react-dom`: 19.2.0

### Development
- TypeScript 5
- Tailwind CSS 4
- ESLint with Next.js config
- Prettier for code formatting

## Backend Integration

The frontend communicates with AWS Lambda functions via API Gateway. Ensure your backend is properly configured and deployed before running the frontend in production.

## Notes

- This project uses the Next.js App Router (app directory)
- All pages are server components by default
- TypeScript is used throughout for type safety
- The application supports dark mode via Tailwind CSS

For more information about the full project, see the main [README.md](../README.md) in the root directory.
