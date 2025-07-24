# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Payload CMS 3.0 project using Next.js 15, MongoDB, and TypeScript. It's configured as a CRM template with user authentication and media management capabilities.

## Common Commands

### Development
- `pnpm dev` - Start development server on http://localhost:3000
- `pnpm devsafe` - Clean build and start dev server (removes .next directory)
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Testing
- `pnpm test` - Run all tests (integration + e2e)
- `pnpm test:int` - Run integration tests with Vitest
- `pnpm test:e2e` - Run end-to-end tests with Playwright

### Code Quality
- `pnpm lint` - Run ESLint

### Payload Commands
- `pnpm payload` - Run Payload CLI commands
- `pnpm generate:types` - Generate TypeScript types from Payload config
- `pnpm generate:importmap` - Generate import map for admin panel

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **CMS**: Payload CMS 3.0
- **Database**: MongoDB with Mongoose adapter
- **Storage**: Vercel Blob Storage for media uploads
- **Testing**: Vitest for integration tests, Playwright for e2e tests
- **Styling**: Custom SCSS with Payload's admin UI

### Project Structure
- `src/app/(frontend)/` - Frontend Next.js app routes
- `src/app/(payload)/` - Payload CMS admin routes and API endpoints
- `src/collections/` - Payload collection definitions (Users, Media)
- `src/payload.config.ts` - Main Payload configuration
- `tests/int/` - Integration tests
- `tests/e2e/` - End-to-end tests

### Collections
- **Users**: Auth-enabled collection for admin panel access
- **Media**: Upload-enabled collection with Vercel Blob storage integration

### Environment Setup
The project requires these environment variables:
- `DATABASE_URI` - MongoDB connection string
- `PAYLOAD_SECRET` - Secret key for Payload
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

### Docker Support
Docker Compose is available for local MongoDB development. Use `docker-compose up` to start a local MongoDB instance.

### Development Notes
- Uses pnpm as package manager
- Node.js version requirement: ^18.20.2 || >=20.9.0
- TypeScript strict mode enabled
- ESLint configured with Next.js and TypeScript rules
- Custom ESLint rules allow underscore-prefixed unused variables