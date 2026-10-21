package com.bharatevote.voter.data.mock

import com.bharatevote.voter.domain.model.Candidate
import com.bharatevote.voter.domain.model.Election
import com.bharatevote.voter.domain.model.ElectionStatus
import com.bharatevote.voter.domain.model.SessionUser
import com.bharatevote.voter.domain.model.Voter
import com.bharatevote.voter.domain.repository.VoterRepository
import kotlinx.coroutines.delay
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

/**
 * In-memory seed store used when `google-services.json` is missing.
 * Mirrors the web portal mock accounts and collections.
 */
class MockVoterRepository : VoterRepository {
    override val usingMock: Boolean = true

    private data class Vote(
        val id: String,
        val electionId: String,
        val voterUid: String,
        val candidateId: String,
        val castAt: String,
    )

    private val passwords = mutableMapOf(
        "voter@demo.in" to "voter123",
    )

    private val voters = mutableListOf(
        Voter(
            uid = "voter-demo-1",
            name = "Aarav Sharma",
            email = "voter@demo.in",
            voterId = "ABC1234567",
            constituency = "Pune Central",
            createdAt = Instant.now().toString(),
        ),
    )

    private var session: SessionUser? = null

    private val now = Instant.now()
    private val inSeven = now.plus(7, ChronoUnit.DAYS)

    private val elections = mutableListOf(
        Election(
            id = "el-lok-sabha-demo",
            title = "Lok Sabha — Pune Central",
            description = "Cast your vote for the Member of Parliament representing Pune Central.",
            constituency = "Pune Central",
            status = ElectionStatus.OPEN,
            startAt = now.toString(),
            endAt = inSeven.toString(),
        ),
        Election(
            id = "el-closed-demo",
            title = "Municipal Ward 12 — Sample Closed Poll",
            description = "A completed local body poll used to demonstrate published results.",
            constituency = "Ward 12",
            status = ElectionStatus.CLOSED,
            startAt = now.minus(14, ChronoUnit.DAYS).toString(),
            endAt = now.minus(1, ChronoUnit.DAYS).toString(),
        ),
    )

    private val candidates = mutableListOf(
        Candidate("c-1", "el-lok-sabha-demo", "Meera Deshmukh", "Progress Front", "Lotus", "Transit-first city, youth apprenticeships, cleaner rivers."),
        Candidate("c-2", "el-lok-sabha-demo", "Rohit Patil", "People's Alliance", "Hand", "Affordable housing, MSME credit, digital public services."),
        Candidate("c-3", "el-lok-sabha-demo", "Sana Qureshi", "Civic Unity", "Lamp", "Campus safety, open data budgets, local climate action."),
        Candidate("c-4", "el-closed-demo", "Karan Joshi", "Neighbourhood First", "Tree", "Ward parks and waste segregation."),
        Candidate("c-5", "el-closed-demo", "Nisha Kulkarni", "City Voice", "Cycle", "Safer crossings and street lighting."),
    )

    private val votes = mutableListOf(
        Vote("seed-a_el-closed-demo", "el-closed-demo", "seed-a", "c-4", now.minus(2, ChronoUnit.DAYS).toString()),
        Vote("seed-b_el-closed-demo", "el-closed-demo", "seed-b", "c-5", now.minus(2, ChronoUnit.DAYS).toString()),
        Vote("seed-c_el-closed-demo", "el-closed-demo", "seed-c", "c-4", now.minus(2, ChronoUnit.DAYS).toString()),
    )

    override suspend fun signIn(email: String, password: String): SessionUser {
        delay(250)
        if (passwords[email] != password) error("Invalid email or password.")
        val voter = voters.find { it.email == email } ?: error("No voter profile found for this account.")
        return SessionUser(voter.uid, voter.email, voter.name).also { session = it }
    }

    override suspend fun register(
        name: String,
        email: String,
        password: String,
        voterId: String,
        constituency: String,
    ): SessionUser {
        delay(250)
        if (voters.any { it.email == email }) error("An account with this email already exists.")
        if (voters.any { it.voterId.equals(voterId, ignoreCase = true) }) {
            error("This EPIC / voter ID is already registered.")
        }
        val voter = Voter(
            uid = "voter-${UUID.randomUUID().toString().take(8)}",
            name = name,
            email = email,
            voterId = voterId.uppercase(),
            constituency = constituency,
            createdAt = Instant.now().toString(),
        )
        voters += voter
        passwords[email] = password
        return SessionUser(voter.uid, voter.email, voter.name).also { session = it }
    }

    override suspend fun signOut() {
        session = null
    }

    override fun currentSession(): SessionUser? = session

    override suspend fun listElections(): List<Election> {
        delay(200)
        return elections.filter { it.status != ElectionStatus.DRAFT }
            .sortedByDescending { it.startAt }
    }

    override suspend fun getElection(electionId: String): Election {
        delay(150)
        return elections.find { it.id == electionId } ?: error("Election not found.")
    }

    override suspend fun listCandidates(electionId: String): List<Candidate> {
        delay(150)
        return candidates.filter { it.electionId == electionId }
    }

    override suspend fun hasVoted(electionId: String, voterUid: String): Boolean {
        return votes.any { it.electionId == electionId && it.voterUid == voterUid }
    }

    override suspend fun castVote(electionId: String, voterUid: String, candidateId: String) {
        delay(300)
        val election = getElection(electionId)
        if (election.status != ElectionStatus.OPEN) error("This election is not open for voting.")
        val voteId = "${voterUid}_$electionId"
        if (votes.any { it.id == voteId }) error("You have already voted in this election.")
        if (candidates.none { it.id == candidateId && it.electionId == electionId }) {
            error("Invalid candidate for this election.")
        }
        votes += Vote(voteId, electionId, voterUid, candidateId, Instant.now().toString())
    }

    override suspend fun tallies(electionId: String): Map<String, Int> {
        delay(150)
        val result = candidates.filter { it.electionId == electionId }
            .associate { it.id to 0 }
            .toMutableMap()
        votes.filter { it.electionId == electionId }.forEach { vote ->
            result[vote.candidateId] = (result[vote.candidateId] ?: 0) + 1
        }
        return result
    }
}
