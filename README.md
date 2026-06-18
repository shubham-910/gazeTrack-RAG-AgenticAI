# Gaze Track
## Prerequisites

- Node.js: Install the latest version of Node.js from [here](https://nodejs.org/)
- Django: Install the latest version of Django from [here](https://www.djangoproject.com/)

## Application Overview

GazeTrack is a fully automated, highly secure web application that enables users to track and improve their cognitive attention health independently, without requiring direct human clinical supervision. By integrating browser-native gaze tracking with evidence-based Attention Bias Modification (ABM) techniques, the system automatically analyzes user visual focus, maps potential threat-monitoring anxiety triggers, and suggests personalized coping exercises. 

By prioritizing patient privacy and compliance (utilizing de-identified server-side Agent flows and full clinical record hard-deletes), GazeTrack provides a safe, private space for individuals to evaluate their mental wellness. Through automated GAD-7 assessments, interactive visual exercises, and an AI-driven historical feedback engine (RAG), users can review their progress, perform daily cognitive adjustments, and progressively build resilience against stress and anxiety over time.

---

## Agentic AI: The CBT Gaze Agent

GazeTrack utilizes a secure, server-side **CBT Gaze Agent** powered by the **Google Gemini API** to analyze user attention patterns and generate personalized cognitive guidance.

```
[Raw Coordinates + Viewport Sizes]
             │
             ▼
[Django Attentional Bias Service]  ──> Calculates Attentional Bias Indices
             │
             ▼
[CBT Gaze Agent (Gemini API)] ──> Ingests scores + GAD-7 baseline history
             │
      ┌──────┴────────────────────────┐
      ▼                               ▼
[Clinical Reasoning Report]     [Structured CBT Guidance]
      │                               │
      └──────┬────────────────────────┘
             ▼
[Strict JSON Schema Validation] ──> Saves response safely to database
```

### Agentic Workflow Overview:
1. **Viewport-Aware Calculation:** The backend parses coordinate sequences alongside dynamic client viewport boundaries to discount outlier coordinates and central dead-zone noise (5% margins), calculating precise Left (Negative) vs. Right (Positive) attentional bias ratios.
2. **HIPAA Safe Harbor De-identification:** To guarantee absolute patient confidentiality, the backend strips all Personally Identifiable Information (PII) and Protected Health Information (PHI) from the payload before querying the external API. Names, emails, and usernames are completely removed, replacing them with a randomized pseudonymous subject ID: `Patient Ref: PATIENT-{user_profile.id}`.
3. **Strict Schema Constraints:** The CBT Gaze Agent enforces Google Gemini's native JSON schema validation (`GEMINI_SCHEMA` declared in `agent_service.py`). The model is strictly constrained to output:
   - `clinical_assessment`: Summary of Left/Right attention bias correlations to GAD-7 levels.
   - `attention_bias_ratio`: Calculated ratio (0.0 to 1.0) of gaze captures on threat stimuli.
   - `cognitive_techniques`: Object array mapping specific, actionable CBT or Attentional Bias Modification (ABM) exercises.
   - `actionable_next_steps`: List of daily visual training guidelines.
4. **Persuasive Prompt Framing:** Prompts leverage evidence-based cognitive conditioning (Framing, Tailoring, and Feedback Loops) to guide the patient away from threat-monitoring habits toward neutral or positive anchors.
5. **Mock Simulator Fallback:** If API credentials (`GEMINI_API_KEY`) are absent, the system defaults to a mock generator to populate dashboard interfaces with clinical-matching guidance without breaking developer setups.

### Agent Credentials Setup:
To enable live AI evaluations, obtain a Gemini API key and declare it in `backendGazeTrack/.env`:
```ini
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## GitLab CI/CD Pipeline

GazeTrack features an automated, parallelized **GitLab CI/CD Pipeline** defined in `.gitlab-ci.yml`. This pipeline automates tests, build artifact generation, and deployment integrations.

```
       ┌──────────────────────┐
       │     git commit       │
       └──────────┬───────────┘
                  ▼
         [GitLab CI Runner]
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
  [test:frontend]     [test:backend]     <── Parallel Testing
        │                   │
        ▼                   ▼
 [build:frontend]    [build:backend]    <── Parallel Building
        │                   │
        ▼                   ▼
[deploy:frontend]   [deploy:backend]    <── Automated CD (Vercel & Render)
```

### Key Pipeline Features:
1. **Parallel Execution:** Testing and building for both frontend and backend directories occur concurrently on separate runners to accelerate development velocity.
2. **Caching:** NPM dependencies and Pip package files are cached locally on runners to avoid redundant installation downloads.
3. **Change-Aware Triggers:** Configured using GitLab `rules:changes` boundaries, frontend code updates will not execute backend pipeline jobs (and vice versa), saving execution budget.
4. **Automated CD Deployments:** On merges to `main`, built static client bundles are deployed to **Vercel** and the Django backend is automatically re-deployed to **Render** via secure webhook webhooks.

### CI/CD Environment Configuration:
Configure the following environment variables under **GitLab Settings > CI/CD > Variables**:
- `VERCEL_TOKEN`: Vercel Authentication Token for frontend hosting integrations.
- `VERCEL_SCOPE`: Associated Vercel project scope (username or team).
- `RENDER_DEPLOY_HOOK_URL`: Secure Render API deploy hook trigger URL.

---

## Key Objectives & Clinical Goals

- **Secure Session Management & Onboarding**: Implements secure user authentication (JWT-based token system) to protect sensitive assessment histories.
- **Mental Health Baseline (GAD-7 Form)**: Conducts a mandatory GAD-7 anxiety survey to establish a baseline clinical score before gaze assessments.
- **Precision Gaze Calibration**: Integrates an interactive gaze calibration tool using browser-based face mesh mapping to align tracking boundaries.
- **Transition-Aware Gaze Evaluation**: Executes a viewport-aware coordinate analysis algorithm that filters off-screen noise and central dead-zone transitions, isolating visual focus splits (threat vs. positive stimuli).
- **Clinical CBT Recommendation Agent**: Utilizes Gemini LLM orchestration to generate de-identified, context-sensitive CBT & ABM exercises.
- **Context-Aware Semantic Chat (RAG)**: Integrates a Retrieval-Augmented Generation chat system, embedding user sessions and using L2 vector similarity to provide historical progress analysis.

## Technologies Used

- **React.js & Tailwind CSS**: Drives the frontend application, powering real-time gaze calibration UI elements, canvas overlays, results chart visualizations, and responsive dashboard panels.
- **Google MediaPipe**: Performs client-side, browser-native face mesh detection and eye gaze coordinate calculations.
- **Django & DRF**: Standardizes the REST API backend, managing user profiles, GAD-7 responses, coordinate logs, and database queries.
- **Google Gemini API**: Generates clinical evaluations (structured JSON outputs) and creates 768-dimensional text embeddings for RAG retrieval.
- **Vector Search Engine**: Dual-setup vector retrieval utilizing PostgreSQL `pgvector` (`L2Distance` calculations) in production environments, and a Python Euclidean L2 similarity search fallback for local SQLite development.

## Implementation Architecture & Prototypes

### 1. Frontend Development & Interactivity:
- **Calibrated Gaze Tracking**: Built dynamic calibration grids mapped directly to coordinate capturing loops.
- **Biometric Visualizations**: Integrated interactive charts to plot Left/Right attention bias ratios and progress over time.
- **Session Security**: Implemented JWT state handling and HTTPS compatibility.

### 2. Backend Orchestration & Cognitive Analytics:
- **Viewport-Aware Spatial Filters**: Designed backend logic to filter out central gaze coordinates (within a 5% boundary center-margin) to eliminate transition noises.
- **Secure Gemini CBT Orchestrator**: Configured schema-locked JSON generators (`clinical_assessment`, `attention_bias_ratio`, `cognitive_techniques`, `actionable_next_steps`) with automatic de-identification (stripping PII/PHI).
- **Session Vectorization**: Created automated RAG pipelines to serialize clinical assessments and index them into semantic vectors.

### 3. Deployment & Scalability:
- **Frontend Hosting**: Scaled for static assets and web hosting deployment.
- **Backend API Hosting**: Deployed on standard cloud resources to handle concurrent REST API loads and external Gemini call durations.
- **Vector Storage**: Scaled databases to support vector storage and Euclidean space lookups.

## Installation Instructions

### Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** database
- **Git**

### Frontend

1. **Navigate to the Frontend Directory**  
   Move into the `frontend` directory:
   ```bash
   cd frontendGazeTrack
   ```
2. Install the required dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm start
   ```

### Backend

1. **Navigate to the Backend Directory**  
   Move into the `backend` directory:
   ```bash
   cd backendGazeTrack
   ```

2. Set Up Python Environment:
   ```sh
   python -m venv venv
   ```
   ```sh
   cd env/bin/activate
   ```
3. Install Dependencies:
   ```sh
   pip install pipenv
   ```
   ```sh
   pipenv install
   ```
4. Run Database Migrations:
   ```sh
   python manage.py makemigrations
   ```
   ```sh
   python manage.py migrate
   ```
5. Start the Backend Server:
   ```sh
   python manage.py runserver
   ```

### Set up the environment variables in env files from .env.example file from the directories.

### Make sure to rename .env.example to .env while setting up the project.

---

### Some visuals of the website.

## Home page:

![Home Page](assets/Homepage.png)

## Insight page:

![Insight Page](assets/InsightPage.png)

## Insight Page (continue):

![Insight Page](assets/Chat-insight1.png)

## Insight page (continue):

![Insight Page](assets/chat-insight2.png)

##

## Author

- [Shubham](shubhamjethva92@gmail.com) - _(Maintainer)_