# FormAssist AR — AI-Powered Document Assistant

FormAssist AR is an AI-powered document assistant designed to simplify
form-filling by extracting information from documents and assisting
users through an augmented reality (AR) interface.

The platform explores how multimodal AI, voice interaction, and
WebAR can make document completion more accessible and convenient.

## Overview

Filling out forms manually can be time-consuming, especially when
users need to transfer information from existing documents into
physical or digital forms.

FormAssist AR aims to simplify this process by helping users extract
structured information from uploaded documents and guiding them
through form completion.

## Key Features

- **AI-Powered Information Extraction:** Extract structured
  information from documents using multimodal AI capabilities.

- **Augmented Reality Assistance:** Explore camera-based assistance
  for mapping extracted information to physical form fields.

- **Guided Form Filling:** Help users complete forms through a
  structured, step-by-step workflow.

- **Multilingual Support:** Support translation to make document
  assistance more accessible across languages.

- **Voice Interaction:** Provide voice-based question-and-answer
  functionality.

- **Digital Document Support:** Support workflows involving digital
  PDF documents.

> Note: Feature availability depends on the functionality implemented
> in the current version of the project.

## Tech Stack

### Frontend
- React.js
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### AI and Integrations
- Google Gemini Multimodal API
- Web-based camera and AR capabilities

## How It Works

1. **Upload a Document:** Provide a document containing information
   required for form completion.
2. **Extract Information:** Use AI-powered processing to identify
   relevant information.
3. **Review Extracted Data:** Review the extracted information before
   using it.
4. **Assist with Form Filling:** Use the guided interface to help
   transfer information into the appropriate form fields.
5. **Complete the Form:** Review the completed information and finish
   the form-filling workflow.

## Project Architecture

The application can be understood through the following high-level
workflow:

User
  |
  v
React Frontend
  |
  v
Node.js / Express Backend
  |
  v
Gemini Multimodal API
  |
  v
Structured Information
  |
  v
Guided Form-Filling Interface

MongoDB is used for application data where required by the
implemented backend.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB, if required by the application
- Google Gemini API key

### Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>

