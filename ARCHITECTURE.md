# Application Architecture

This document visualizes the flow of data across the NestJS Rules Engine, the Next.js Client Boundaries, and the Google GenAI Integration.

## System Workflow

```mermaid
graph TD
    %% Define styles
    classDef client fill:#E2E8F0,stroke:#64748B,stroke-width:2px,color:#1E293B
    classDef nextjs fill:#0F172A,stroke:#334155,stroke-width:2px,color:#F8FAFC
    classDef nestjs fill:#EA2845,stroke:#BE123C,stroke-width:2px,color:#FEF2F2
    classDef external fill:#F59E0B,stroke:#B45309,stroke-width:2px,color:#FFFBEB
    classDef docker fill:#0284C7,stroke:#0369A1,stroke-width:2px,color:#F0F9FF,stroke-dasharray: 5 5

    subgraph DockerNetwork [Internal Bridge]
        direction TB
        
        subgraph NextJSWorkspace [Frontend App: 8081]
            A[Browser Client]:::client -->|Client-side Fetch\nadmin panel| D
            A -->|Server Action Fetch\ngenerateCopy| B
            
            B[App Router\nServer Actions]:::nextjs
            C[SSR Server\nLanding Page]:::nextjs
        end

        subgraph NestJSWorkspace [Backend API: 8080]
            D[ConsentInterceptor]:::nestjs
            E[DecisionController]:::nestjs
            F[Rule Engine\nVariants]:::nestjs
            
            D -->|Strips PII if\nmarketing=false| E
            E --> F
            F -->|Response| D
        end
        
        C -->|Internal Fetch\nHTTP:3000| D
        B -->|Server-To-Server| D
    end

    G([Google GenAI\n gemini-2.5-flash]):::external
    B -->|Content Generation| G
    G -->|Response / Validation| B
```

## Security & Privacy Logic

```mermaid
sequenceDiagram
    participant Client as Next.js Admin Panel
    participant Action as generateCopyAsync()
    participant GenAI as gemini-2.5-flash
    
    Client->>Action: Request Headline (Context)
    Action->>GenAI: Prompt + Allowed Claims
    GenAI-->>Action: Model Output (JSON)
    
    alt Valid Claim ID
        Action-->>Client: Success (Status 200)
    else Invalid Claim ID (Hallucination)
        Action->>GenAI: 1-Time Retry (Strict Correction Prompt)
        GenAI-->>Action: Corrected Output
        
        alt Success on Retry
            Action-->>Client: Retry Success
        else Fail Again / API Timeout
            Action-->>Client: Deterministic Fallback Object
        end
    end
```
