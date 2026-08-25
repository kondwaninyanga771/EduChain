# EduChain Database Schema

The following Entity-Relationship Diagram outlines the normalized database schema (3NF) designed for the Blockchain Security Framework for an Online Student Evaluation System.

This schema acts as a hybrid bridge, connecting traditional relational data (users, courses, metadata) with Web3 decentralized storage (IPFS hashes for submissions) and immutable ledger records (Ethereum transaction hashes for grades).

```mermaid
erDiagram
    USERS {
        uuid id PK
        string first_name
        string last_name
        string email
        string password_hash
        enum role "STUDENT, LECTURER, ADMIN"
        string wallet_address "Nullable"
        datetime created_at
    }

    COURSES {
        uuid id PK
        string course_code
        string course_name
        text description
        datetime created_at
    }

    COURSE_ENROLLMENTS {
        uuid student_id PK, FK
        uuid course_id PK, FK
        datetime enrolled_at
    }

    COURSE_LECTURERS {
        uuid lecturer_id PK, FK
        uuid course_id PK, FK
        datetime assigned_at
    }

    ASSESSMENTS {
        uuid id PK
        uuid course_id FK
        uuid created_by_lecturer_id FK
        string title
        text description
        datetime due_date
        datetime created_at
    }

    SUBMISSIONS {
        uuid id PK
        uuid assessment_id FK
        uuid student_id FK
        string ipfs_hash "File pointer"
        string file_name
        datetime submitted_at
        enum status "PENDING, GRADED"
    }

    GRADES {
        uuid id PK
        uuid submission_id FK "UNIQUE"
        uuid graded_by_lecturer_id FK
        numeric score
        text feedback
        string blockchain_tx_hash "Smart Contract Tx"
        datetime graded_at
    }

    SYSTEM_LOGS {
        uuid id PK
        uuid user_id FK
        enum action_type "LOGIN, ASSESSMENT_CREATED, GRADE_PUBLISHED"
        string description
        datetime timestamp
        string ip_address
    }

    USERS ||--o{ COURSE_ENROLLMENTS : "enrolls in"
    COURSES ||--o{ COURSE_ENROLLMENTS : "has enrolled"
    
    USERS ||--o{ COURSE_LECTURERS : "teaches"
    COURSES ||--o{ COURSE_LECTURERS : "is taught by"
    
    COURSES ||--o{ ASSESSMENTS : "has"
    USERS ||--o{ ASSESSMENTS : "creates"
    
    ASSESSMENTS ||--o{ SUBMISSIONS : "receives"
    USERS ||--o{ SUBMISSIONS : "submits"
    
    SUBMISSIONS ||--o| GRADES : "is given"
    USERS ||--o{ GRADES : "grades"

    USERS ||--o{ SYSTEM_LOGS : "generates"
```
