# Activity Center Queue Management System

## Overview

This is a full-stack web application for managing activity queues in a recreation or entertainment center. The system allows visitors to register for activities, tracks queue positions, manages wait times, and provides staff with tools to efficiently process groups through various activities. The application features real-time queue updates, configurable settings for concurrent activities, and comprehensive group management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod schema validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware with status code management
- **Development**: Hot reload via Vite middleware integration

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Connection**: Neon Database serverless driver for PostgreSQL connectivity
- **Fallback Storage**: In-memory storage implementation for development/testing

### Database Schema Design
- **Groups Table**: Stores visitor groups with members, status tracking, queue positions, and timing information
- **Settings Table**: Key-value configuration store for system parameters like concurrent capacity and activity durations
- **Staff Table**: Staff member registry for activity assignment and management
- **Data Validation**: Drizzle-Zod integration for type-safe schema validation

### Authentication and Authorization
- Currently implements a simple session-based approach using express-session
- PostgreSQL session storage via connect-pg-simple
- No complex user authentication - designed for staff terminal usage

### Queue Management Logic
- **Position Tracking**: Automatic queue position assignment and management
- **Wait Time Calculation**: Dynamic estimation based on current queue, activity duration, and concurrent capacity
- **Status Workflow**: Three-state system (waiting → in-progress → completed)
- **Real-time Updates**: Automatic refresh of queue status and statistics

### Configuration Management
- **Dynamic Settings**: Runtime-configurable parameters for concurrent groups and activity durations
- **Break Time Management**: Configurable break periods that affect queue processing
- **Staff Assignment**: Dynamic staff allocation to groups and activities

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting platform
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **Radix UI**: Comprehensive primitive component library for accessible UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library providing consistent iconography
- **class-variance-authority**: Type-safe variant API for component styling

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment integration with runtime error overlays

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **@hookform/resolvers**: Integration bridge between React Hook Form and Zod

### State Management and HTTP
- **TanStack Query**: Server state management with caching and synchronization
- **date-fns**: Date manipulation and formatting utilities
- **CMDK**: Command palette implementation for enhanced UX