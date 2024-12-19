# ConverseChronicle Backend

A Node.js backend service for the ConverseChronicle application, providing audio transcription, summarization, and conversation management capabilities.

## 🚀 Features

- Audio file transcription using Deepgram and Speechmatics
- AI-powered conversation summarization using Claude
- Secure file storage with Supabase
- User authentication with Clerk
- RESTful API endpoints for conversation management
- PostgreSQL database with Prisma ORM

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Clerk
- **Storage**: Supabase
- **AI Services**:
  - Anthropic Claude (summarization)
  - Deepgram (transcription)

## 📋 Prerequisites

- Node.js (v16+)
- PostgreSQL
- npm or yarn
- Clerk account
- Deepgram API key
- Anthropic API key
- Supabase account

## 🔧 Installation

1. Clone the repository

```bash
git clone <repository-url>
cd backend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.template .env
```

4. Fill in the environment variables in `.env`:

```
DATABASE_URL=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DEEPGRAM_API_KEY=
SUPABASE_API_KEY=
SUPABASE_URL=
PORT=3000
ANTHROPIC_API_KEY=
SPEECHMATICS_API_KEY=
```

5. Run database migrations

```bash
npx prisma migrate dev
```

## 🚀 Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## 📝 API Endpoints

### Conversations

- `GET /recordings` - List all recordings
- `GET /recordings/:recording_id` - Get recording details
- `POST /recordings/create` - Create new recording
- `DELETE /recordings/:recording_id` - Delete recording
- `PUT /recordings/:recording_id` - Update recording

## 🧪 Testing

```bash
npm test
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── apis/           # External API integrations
│   ├── controllers/    # Request handlers
│   ├── types/         # TypeScript type definitions
│   └── index.ts       # Application entry point
├── prisma/
│   └── schema.prisma  # Database schema
└── tests/             # Test files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
