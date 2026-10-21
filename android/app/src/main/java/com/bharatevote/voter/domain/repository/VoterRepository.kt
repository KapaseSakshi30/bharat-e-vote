package com.bharatevote.voter.domain.repository

import com.bharatevote.voter.domain.model.Candidate
import com.bharatevote.voter.domain.model.Election
import com.bharatevote.voter.domain.model.SessionUser

interface VoterRepository {
    val usingMock: Boolean

    suspend fun signIn(email: String, password: String): SessionUser

    suspend fun register(
        name: String,
        email: String,
        password: String,
        voterId: String,
        constituency: String,
    ): SessionUser

    suspend fun signOut()

    fun currentSession(): SessionUser?

    suspend fun listElections(): List<Election>

    suspend fun getElection(electionId: String): Election

    suspend fun listCandidates(electionId: String): List<Candidate>

    suspend fun hasVoted(electionId: String, voterUid: String): Boolean

    suspend fun castVote(electionId: String, voterUid: String, candidateId: String)

    suspend fun tallies(electionId: String): Map<String, Int>
}
