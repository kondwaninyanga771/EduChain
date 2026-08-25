# Blockchain-Based Online Student Evaluation System

## Overview
The **Blockchain Security Framework for an Online Student Evaluation System** is a decentralized application designed to ensure data integrity, transparency, immutability, and security of academic assessment records. By integrating Ethereum blockchain technologies, smart contracts, decentralized storage (IPFS), and modern web technologies (React, Node.js), this framework creates a secure and tamper-proof evaluation environment for higher education institutions.

## Key Features & Security
*   **Data Integrity:** Assessment records cannot be modified once stored on the blockchain.
*   **Immutability:** Student submissions and results remain permanently recorded and tamper-proof.
*   **Transparency:** Authorized stakeholders can verify transactions and assessment activities.
*   **Authentication and Authorization:** Smart contracts ensure secure access control and student verification.
*   **Non-Repudiation:** Students and lecturers cannot deny submitted or approved transactions.
*   **Decentralization:** Elimination of a single point of failure improves system reliability and security.
*   **Auditability:** Blockchain records provide a transparent audit trail for academic assessments and grading activities.

## Technology Stack

### Blockchain Layer
*   **Ethereum:** Core decentralized infrastructure for immutable record management.
*   **Solidity:** Primary programming language for smart contracts (defining rules, logic, and validation).
*   **Remix IDE:** Used for writing, compiling, testing, and debugging smart contracts.
*   **Truffle Suite:** Framework for managing contract compilation, deployment, and testing.
*   **Ganache:** Local blockchain environment for simulation and testing.
*   **Web3.js:** Establishes communication between the web frontend and deployed smart contracts.
*   **OpenZeppelin:** Libraries for secure smart contract development.

### Backend & Database
*   **Node.js & Express.js:** Server-side operations, API management, and blockchain communication.
*   **SQLite / PostgreSQL:** Relational database for storing off-chain data (user profiles, course details).

### Frontend
*   **React.js:** Dynamic and responsive user interface for dashboards (Students, Lecturers, Admins).
*   **Tailwind CSS:** Utility-first CSS framework for styling the web application.

### Decentralized Storage
*   **IPFS (InterPlanetary File System):** Secure, decentralized storage for large assessment files and multimedia.

## System Architecture

The system operates across a 5-layer architecture:
1.  **Frontend:** React.js dashboards for users.
2.  **Backend API:** Node.js + Express.js handling business logic and routing.
3.  **Database:** SQLite/PostgreSQL managing relational data (names, emails, courses).
4.  **Blockchain Layer:** Ethereum + Solidity managing immutable records and logic.
5.  **IPFS Storage:** Decentralized storage for assignment files.

### Data Storage Strategy
To minimize gas fees and optimize performance, data is divided intelligently:
*   **Blockchain:** Student ID hash, Submission hash, Grade hash, Timestamp, Transaction history.
*   **Database:** User names, emails, courses, passwords, profiles.
*   **IPFS (InterPlanetary File System):** PDF assignments, images, videos, documents.
    *   **How the IPFS Content Hash Works:** When a student uploads an assignment, IPFS mathematically processes the file and generates a unique cryptographic fingerprint (CID) that typically starts with `Qm...`. This hash is strictly derived from the *contents* of the file. 
    *   **Immutability Guarantee:** If anyone alters even a single pixel or word inside that assignment file, the resulting IPFS Hash would completely change. 
    *   **Blockchain Tethering:** When a lecturer grades a submission, the system pairs the score with this exact IPFS Content Hash and writes both to the Ethereum smart contract. The **Transaction Hash** proves *when* the grade was assigned, and the **IPFS Content Hash** proves *exactly what* the student submitted, ensuring complete mathematical fairness.
*   *Mechanism:* The blockchain stores only the `IPFS Hash + Metadata + Timestamp`.

## Project Structure

```text
student-evaluation-system/
├── frontend/             # React.js web interface
│   ├── src/
│   ├── pages/
│   ├── components/
│   └── services/
├── backend/              # Node.js + Express API
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   └── config/
├── blockchain/           # Smart Contracts & Deployment
│   ├── contracts/
│   ├── migrations/
│   └── test/
├── database/             # SQLite/PostgreSQL schemas
│   └── schema.sql
├── uploads/              # Temporary local uploads
└── docs/                 # Project documentation
```

## User Roles & Capabilities

### 1. Students
*   **Register/Login** securely using JWT and role-based access.
*   **View available assessments** and deadlines.
*   **Upload assignments** (files stored via IPFS).
*   **View graded results**.
*   **Verify their blockchain records** and transaction hashes.

### 2. Lecturers
*   **Create and manage assessments.**
*   **Grade student submissions.**
*   **Publish results** to the blockchain.
*   **View transparent audit logs** for their courses.

### 3. Administrators
*   **Manage user accounts** and roles.
*   **Manage courses** and assignments.
*   **Monitor** overall blockchain transactions and system health.

## Development Workflow & Setup

### Environment Networks
*   **Ganache:** For local development and rapid testing (zero transaction costs).
*   **Sepolia Testnet:** For staging, integration, and broader testing.
*   **Ethereum Mainnet:** For final production deployment.

*(More detailed setup instructions to follow as development progresses)*

## Roadmap & Timeline

| Week | Description |
| :--- | :--- |
| **Week 1** | Requirements & System Architecture Design |
| **Week 2** | Database Design & Implementation |
| **Week 3** | Authentication (JWT, bcrypt, Role-based access) |
| **Week 4** | Backend API Development |
| **Week 5** | Frontend Development (React + Tailwind) |
| **Week 6** | Smart Contract Development (Solidity, Remix, Truffle) |
| **Week 7** | Web3 + IPFS Integration |
| **Week 8** | System Testing (Unit, Integration, UAT) |
| **Week 9** | Security Review & Hardening |
| **Week 10** | Deployment (Vercel, Railway, Sepolia/Mainnet) |
