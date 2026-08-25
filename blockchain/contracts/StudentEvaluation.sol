// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title StudentEvaluation
 * @dev Immutable ledger for storing student evaluation records.
 */
contract StudentEvaluation is AccessControl {
    bytes32 public constant LECTURER_ROLE = keccak256("LECTURER_ROLE");

    struct EvaluationRecord {
        string submissionId;
        string studentId;
        string ipfsHash;
        uint256 score;
        uint256 timestamp;
        address gradedBy;
    }

    // Mapping from submissionId to EvaluationRecord
    mapping(string => EvaluationRecord) public evaluations;

    // Events
    event GradePublished(
        string indexed submissionId,
        string indexed studentId,
        string ipfsHash,
        uint256 score,
        address gradedBy,
        uint256 timestamp
    );

    constructor() {
        // Grant the contract deployer the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Publishes a new grade for a student's submission.
     * Only callers with the LECTURER_ROLE can call this function.
     */
    function publishGrade(
        string memory _submissionId,
        string memory _studentId,
        string memory _ipfsHash,
        uint256 _score
    ) external onlyRole(LECTURER_ROLE) {
        // Ensure submission hasn't been graded yet
        require(evaluations[_submissionId].timestamp == 0, "Submission already graded");

        EvaluationRecord memory record = EvaluationRecord({
            submissionId: _submissionId,
            studentId: _studentId,
            ipfsHash: _ipfsHash,
            score: _score,
            timestamp: block.timestamp,
            gradedBy: msg.sender
        });

        evaluations[_submissionId] = record;

        emit GradePublished(
            _submissionId,
            _studentId,
            _ipfsHash,
            _score,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Retrieves an evaluation record by submission ID.
     */
    function getEvaluation(string memory _submissionId) external view returns (EvaluationRecord memory) {
        return evaluations[_submissionId];
    }
}
