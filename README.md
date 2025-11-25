# AI Helpdesk

An intelligent email helpdesk system powered by AI that automatically responds to customer emails using your knowledge base. Built with Next.js 16, Better Auth, AIInbx, Upstash Vector, and OpenRouter.

## Overview

AI Helpdesk is an autonomous email support system that:

- **Receives emails** via AIInbx webhooks and intelligently routes them to organizations
- **Searches your knowledge base** using vector similarity search (Upstash Vector) to find relevant information
- **Generates AI-powered responses** using OpenRouter that are contextually aware and based on your documentation
- **Sends professional email replies** automatically, maintaining conversation threads
- **Manages multiple organizations** with separate knowledge bases and email addresses
- **Supports document ingestion** for PDFs, DOCX, and text files to build your knowledge base

Each organization gets a unique email address (e.g., `your-org@ai-helpdesk.aiinbx.app`) and can upload documents to create a searchable knowledge base. When emails arrive, the AI assistant searches the knowledge base and responds with accurate, helpful information.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **Better Auth** - Authentication and organization management with Google OAuth
- **AIInbx** - Email API for AI agents ([aiinbx.com](https://aiinbx.com/))
- **Upstash Vector** - Vector database for semantic search
- **OpenRouter** - AI model API (GPT-4o)
- **Prisma** - Database ORM with PostgreSQL (Neon)
- **TypeScript** - Type-safe development

## Environment Variables

Copy `.env.example` to `.env` and fill in all required values:

```bash
cp .env.example .env
```

### Required Environment Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `DATABASE_URL` | PostgreSQL database connection string | Your Neon/PostgreSQL provider |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth session encryption | Generate a random string |
| `BETTER_AUTH_URL` | Base URL of your application (e.g., `http://localhost:3000` or `https://yourdomain.com`) | Your deployment URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | [Google Cloud Console](https://console.cloud.google.com/) |
| `AIINBX_API_KEY` | API key for AIInbx email service | [aiinbx.com](https://aiinbx.com/) |
| `AIINBX_WEBHOOK_SECRET` | Webhook secret for verifying inbound emails | [aiinbx.com Dashboard](https://aiinbx.com/) |
| `OPENROUTER_API_KEY` | API key for OpenRouter AI models | [OpenRouter](https://openrouter.ai/) |
| `UPSTASH_VECTOR_REST_URL` | Upstash Vector REST API URL | [Upstash Console](https://console.upstash.com/) |
| `UPSTASH_VECTOR_REST_TOKEN` | Upstash Vector REST API token | [Upstash Console](https://console.upstash.com/) |

### Getting Your API Keys

1. **AIInbx** - Sign up at [aiinbx.com](https://aiinbx.com/) to get your API key and webhook secret
2. **OpenRouter** - Create an account at [openrouter.ai](https://openrouter.ai/) and generate an API key
3. **Upstash Vector** - Create a vector index in [Upstash Console](https://console.upstash.com/) with an embedding model (e.g., OpenAI text-embedding-ada-002)
4. **Google OAuth** - Set up OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
5. **Database** - Use Neon, Supabase, or any PostgreSQL provider for your `DATABASE_URL`

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL database
- Accounts for AIInbx, OpenRouter, and Upstash

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-helpdesk
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Set up the database:
```bash
bun run db:generate
bun run db:push
# or for migrations:
bun run db:migrate
```

5. Start the development server:
```bash
bun run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating an Organization

1. Sign in with Google OAuth
2. A personal organization is automatically created
3. Navigate to Settings to configure your organization:
   - Set your website URL
   - Add accepted sender email addresses (optional - leave empty to accept all)
   - View your unique email address (e.g., `your-org@ai-helpdesk.aiinbx.app`)

### Building Your Knowledge Base

1. Go to the Documents section in your dashboard
2. Upload PDF, DOCX, or TXT files
3. Documents are automatically processed, chunked, and indexed in your vector database
4. The AI assistant will use these documents to answer incoming emails

### Receiving Emails

1. Configure your AIInbx webhook to point to: `https://yourdomain.com/api/webhooks/inbound`
2. When emails arrive at your organization's email address:
   - The system verifies the sender (if accepted senders are configured)
   - Retrieves the full conversation thread
   - Searches your knowledge base for relevant information
   - Generates an AI-powered response using GPT-4o
   - Sends the reply automatically

## How It Works

1. **Email Reception**: AIInbx receives emails and sends webhooks to your application
2. **Organization Routing**: The system extracts the organization slug from the email address
3. **Sender Verification**: Checks if the sender is in the accepted senders list (if configured)
4. **Thread Retrieval**: Fetches the full conversation thread for context
5. **Knowledge Base Search**: Uses vector similarity search to find relevant information from uploaded documents
6. **AI Response Generation**: GPT-4o generates a response based on the email content and knowledge base results
7. **Email Reply**: Sends the AI-generated response via AIInbx

## Features

- ✅ Multi-organization support with isolated knowledge bases
- ✅ Automatic email threading and context awareness
- ✅ Vector-based semantic search for accurate information retrieval
- ✅ Support for PDF, DOCX, and TXT document formats
- ✅ Sender email filtering (optional)
- ✅ Google OAuth authentication
- ✅ Real-time webhook processing
- ✅ Professional HTML email responses
