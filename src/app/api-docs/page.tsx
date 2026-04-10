'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import Swagger to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Nexus Academy API Docs',
    version: '1.0.0',
    description: 'Endpoints for the E-Learning Platform',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Authenticate User',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
        responses: { '200': { description: 'Success' } },
        security: [],
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register New Student',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } } } } } },
        responses: { '201': { description: 'Created' } },
        security: [],
      },
    },
    '/api/courses': {
      get: { summary: 'Get All Courses', responses: { '200': { description: 'Success' } } },
      post: { 
        summary: 'Publish a Course (Instructor)', 
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } } } } } },
        responses: { '201': { description: 'Created' } } 
      }
    },
    '/api/courses/{id}': {
      get: { 
        summary: 'Get Specific Course Data', 
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], 
        responses: { '200': { description: 'Success' } } 
      }
    },
    '/api/modules': {
      post: { 
        summary: 'Add Module to Course (Instructor)',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { courseId: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' } } } } } },
        responses: { '201': { description: 'Created' } }
      }
    },
    '/api/quizzes': {
        post: { 
          summary: 'Attach Quiz to Module (Instructor)',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { moduleId: { type: 'string' }, title: { type: 'string' }, questions: { type: 'array' } } } } } },
          responses: { '201': { description: 'Created' } }
        }
    },
    '/api/resources': {
        post: { 
          summary: 'Attach URL Resources to Module',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { moduleId: { type: 'string' }, title: { type: 'string' }, url: { type: 'string' } } } } } },
          responses: { '201': { description: 'Created' } }
        }
    },
    '/api/enrollments': {
        post: { 
          summary: 'Enroll Student into Course',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { courseId: { type: 'string' } } } } } },
          responses: { '201': { description: 'Created' } }
        }
    },
    '/api/progress': {
        post: { 
          summary: 'Mark Module as Complete',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { moduleId: { type: 'string' } } } } } },
          responses: { '200': { description: 'Success' } }
        }
    },
    '/api/progress/{courseId}': {
        get: { 
          summary: 'Fetch Personal Course Progress Metrics',
          parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }], 
          responses: { '200': { description: 'Success' } }
        }
    },
    '/api/quizzes/{id}/attempt': {
        post: { 
          summary: 'Submit Quiz Answers',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Quiz ID' }], 
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { answers: { type: 'array' } } } } } },
          responses: { '201': { description: 'Success' } }
        }
    },
    '/api/certificates': {
        post: { 
          summary: 'Check 50% Threshold & Generate Certificate',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { courseId: { type: 'string' } } } } } },
          responses: { '201': { description: 'Success' }, '400': { description: 'Progress unmet' } }
        }
    }
  },
};

export default function ApiDocs() {
  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Nexus Academy Swagger Documentation</h1>
      <SwaggerUI spec={spec} />
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
         <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>← Back to Application</Link>
      </div>
    </div>
  );
}
