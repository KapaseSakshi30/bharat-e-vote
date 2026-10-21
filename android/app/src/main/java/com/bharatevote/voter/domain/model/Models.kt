package com.bharatevote.voter.domain.model

enum class ElectionStatus {
    DRAFT,
    OPEN,
    CLOSED,
}

data class Voter(
    val uid: String,
    val name: String,
    val email: String,
    val voterId: String,
    val constituency: String,
    val createdAt: String,
)

data class Election(
    val id: String,
    val title: String,
    val description: String,
    val constituency: String,
    val status: ElectionStatus,
    val startAt: String,
    val endAt: String,
)

data class Candidate(
    val id: String,
    val electionId: String,
    val name: String,
    val party: String,
    val symbol: String,
    val manifesto: String,
)

data class SessionUser(
    val uid: String,
    val email: String,
    val displayName: String,
)
