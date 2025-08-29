# Overview

This is a modern chat application built with React and Express.js that enables real-time conversations with an AI assistant. The application features a clean, responsive interface for sending messages and receiving AI-generated responses, with conversation management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built using React with TypeScript and follows a component-based architecture. Key architectural decisions include:

- **UI Framework**: Built with Radix UI primitives and shadcn/ui components for consistent, accessible design
- **Styling**: Uses Tailwind CSS for utility-first styling with CSS variables for theming
- **State Management**: Uses React Query (@tanstack/react-query) for server state management and caching
- **Routing**: Implements client-side routing with Wouter for lightweight navigation
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server follows a REST API pattern with Express.js:

- **Framework**: Express.js with TypeScript for type safety
- **API Design**: RESTful endpoints for conversation and message management
- **Database Layer**: Drizzle ORM with PostgreSQL schema definitions, currently using in-memory storage for development
- **AI Integration**: OpenAI API integration for generating assistant responses
- **Development Setup**: Hot reload with Vite integration for seamless full-stack development

## Data Storage Solutions
- **Schema Definition**: Drizzle ORM schemas for users, conversations, and messages with proper relationships
- **Database**: Configured for PostgreSQL with Neon database support
- **Development Storage**: In-memory storage implementation for rapid prototyping
- **Migration Support**: Drizzle migrations configured for schema changes

## Authentication and Authorization
The application has a basic user structure defined in the schema but currently operates in demo mode without full authentication implementation. The architecture supports future authentication integration through the existing user schema.

## Design Patterns
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Modular Components**: Reusable UI components with consistent prop interfaces
- **Error Handling**: Centralized error handling with toast notifications
- **Loading States**: Proper loading and error states throughout the application

# External Dependencies

## Third-Party Services
- **OpenAI API**: For AI assistant responses and conversation generation
- **Neon Database**: PostgreSQL database hosting service for production data storage

## Key Libraries
- **UI Components**: Radix UI primitives for accessible, unstyled components
- **Styling**: Tailwind CSS for utility-first styling approach
- **Database**: Drizzle ORM for type-safe database interactions with PostgreSQL
- **HTTP Client**: Native fetch API wrapped in React Query for caching and state management
- **Development Tools**: Vite for build tooling, tsx for TypeScript execution, esbuild for production bundling