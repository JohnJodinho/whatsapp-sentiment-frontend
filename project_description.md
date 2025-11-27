# WhatsApp Sentiment Frontend

## Overview
WhatsApp Sentiment Frontend is a modern React-based web application designed for analyzing and visualizing sentiment patterns in WhatsApp conversations. Users can upload exported WhatsApp chat files, receive AI-powered sentiment analysis, and explore interactive dashboards displaying conversation insights and emotional trends.

## Key Features

### 1. Chat Upload & Processing
- **File Upload**: Supports WhatsApp export files in .txt format or ZIP archives
- **Validation**: Automatic validation of WhatsApp export structure and content
- **Security**: All uploads are processed securely and not permanently stored after analysis
- **Processing**: Backend integration for sentiment analysis with real-time status tracking

### 2. Sentiment Dashboard
- **Sentiment Metrics**: Displays overall sentiment KPIs and breakdowns
- **Trend Analysis**: Visualization of sentiment changes over time (daily, hourly)
- **Interactive Charts**:
  - Sentiment trend line chart
  - Sentiment distribution by day
  - Sentiment breakdown pie chart
  - Sentiment by hour gauge
- **Highlights**: Key sentiment insights and notable patterns
- **Filters**: Time-based and participant-based filtering options

### 3. General Dashboard (Analytics)
- **KPI Cards**: Total messages, participants, activities, and engagement metrics
- **Messages Over Time**: Time-series chart showing chat volume trends
- **Participant Analysis**:
  - Contribution pie charts
  - Activity heatmaps
  - Individual participant statistics
- **Timeline Table**: Detailed message timeline with participant filtering
- **Optional Insights**: Collapsible view with activity by day and hourly patterns

### 4. AI Chat Interface
- **Context-Aware Conversation**: AI chat powered by uploaded chat sentiment analysis
- **Interactive Queries**: Ask questions about conversation patterns and sentiment
- **Dynamic Responses**: Contextual answers based on analyzed chat data

## Technical Stack

### Frontend Framework
- **React 19**: Latest React version with modern hooks and features
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Fast build tool and development server

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI components
- **Framer Motion**: Smooth animations and transitions
- **Lucide Icons**: Modern icon library

### Data Visualization
- **Recharts**: Composable charting library for React
- **React Markdown**: Rich text rendering support

### State Management & APIs
- **React Query**: Server state management and caching
- **Axios**: Promise-based HTTP client for API calls
- **React Router**: Client-side routing

### File Handling
- **React Dropzone**: Drag-and-drop file upload interface
- **JSZip**: ZIP file extraction and processing
- **Date-fns**: Modern date utility library

## Application Architecture

### Routing Structure
- `/`: Home page
- `/upload`: Chat upload interface
- `/dashboard`: General analytics dashboard
- `/sentiment-dashboard`: Sentiment-specific analytics
- `/chat-to-chat`: AI chat interface

### Component Organization
- **Pages**: Route-level components
- **Components**: Reusable UI components
- **UI**: Radix UI-based primitives
- **Charts**: Visualization components
- **Custom UI**: Specialized components
- **Hooks**: Shared logic and utilities

### State Management
- Local Storage: Chat data and session persistence
- React Query: Server state and API caching
- Context API: Theme and global state management

## Development & Build

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

### Project Structure
```
src/
├── components/           # Reusable components
├── pages/               # Route components
├── types/               # TypeScript type definitions
├── lib/                 # Utilities and API functions
├── assets/              # Static assets
└── hooks/               # Custom hooks
```

## Features in Detail

### Upload Process
1. Users drag-and-drop or select WhatsApp export files
2. Files are validated for format and structure
3. Valid files are sent to backend for analysis
4. Processing status is tracked with progress indicators
5. Completed analysis redirects to sentiment dashboard

### Sentiment Analysis Pipeline
1. **Processing States**: Tracks analysis from pending to completion
2. **Error Handling**: Graceful error states and retry mechanisms
3. **Data Visualization**: Multiple chart types for comprehensive sentiment overview
4. **Interactive Elements**: Filtering, zooming, and detailed insights

### Dashboard Features
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark/Light Theme**: User-preference based theming
- **Accessible UI**: ARIA-compatible components and keyboard navigation
- **Performance**: Optimized rendering and data fetching

## Security Considerations
- Chat data privacy: Files are used only for analysis and not stored permanently
- API security: Secure communication with backend services
- Input validation: Comprehensive file and input validation
- Session management: Automatic chat expiration after 4 hours

This application provides comprehensive WhatsApp chat analysis capabilities through an intuitive, modern web interface, combining powerful sentiment analysis with engaging data visualizations.
