package com.bharatevote.voter.data.firebase

import com.bharatevote.voter.domain.model.Candidate
import com.bharatevote.voter.domain.model.Election
import com.bharatevote.voter.domain.model.ElectionStatus
import com.bharatevote.voter.domain.model.SessionUser
import com.bharatevote.voter.domain.model.Voter
import com.bharatevote.voter.domain.repository.VoterRepository
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.tasks.await
import java.time.Instant

/**
 * Live Firebase Auth + Firestore implementation sharing collections with the web portal.
 * Only compiled/used when `google-services.json` is present (BuildConfig.USE_FIREBASE).
 */
class FirebaseVoterRepository(
    private val auth: FirebaseAuth = Firebase.auth,
    private val db: FirebaseFirestore = Firebase.firestore,
) : VoterRepository {
    override val usingMock: Boolean = false

    private var cached: SessionUser? = null

    override suspend fun signIn(email: String, password: String): SessionUser {
        val cred = auth.signInWithEmailAndPassword(email, password).await()
        val uid = cred.user?.uid ?: error("Sign-in failed.")
        val snap = db.collection("voters").document(uid).get().await()
        if (!snap.exists()) {
            auth.signOut()
            error("No voter profile found for this account.")
        }
        val voter = snap.toVoter(uid)
        return SessionUser(voter.uid, voter.email, voter.name).also { cached = it }
    }

    override suspend fun register(
        name: String,
        email: String,
        password: String,
        voterId: String,
        constituency: String,
    ): SessionUser {
        val cred = auth.createUserWithEmailAndPassword(email, password).await()
        val uid = cred.user?.uid ?: error("Registration failed.")
        val voter = Voter(
            uid = uid,
            name = name,
            email = email,
            voterId = voterId.uppercase(),
            constituency = constituency,
            createdAt = Instant.now().toString(),
        )
        db.collection("voters").document(uid).set(
            mapOf(
                "uid" to voter.uid,
                "name" to voter.name,
                "email" to voter.email,
                "voterId" to voter.voterId,
                "constituency" to voter.constituency,
                "createdAt" to voter.createdAt,
            ),
        ).await()
        return SessionUser(uid, email, name).also { cached = it }
    }

    override suspend fun signOut() {
        auth.signOut()
        cached = null
    }

    override fun currentSession(): SessionUser? {
        cached?.let { return it }
        val user = auth.currentUser ?: return null
        return SessionUser(
            uid = user.uid,
            email = user.email.orEmpty(),
            displayName = user.displayName ?: user.email.orEmpty(),
        ).also { cached = it }
    }

    override suspend fun listElections(): List<Election> {
        val snap = db.collection("elections").get().await()
        return snap.documents.mapNotNull { it.toElection() }
            .filter { it.status != ElectionStatus.DRAFT }
            .sortedByDescending { it.startAt }
    }

    override suspend fun getElection(electionId: String): Election {
        val snap = db.collection("elections").document(electionId).get().await()
        return snap.toElection() ?: error("Election not found.")
    }

    override suspend fun listCandidates(electionId: String): List<Candidate> {
        val snap = db.collection("candidates")
            .whereEqualTo("electionId", electionId)
            .get()
            .await()
        return snap.documents.mapNotNull { doc ->
            Candidate(
                id = doc.id,
                electionId = doc.getString("electionId") ?: return@mapNotNull null,
                name = doc.getString("name") ?: return@mapNotNull null,
                party = doc.getString("party").orEmpty(),
                symbol = doc.getString("symbol").orEmpty(),
                manifesto = doc.getString("manifesto").orEmpty(),
            )
        }
    }

    override suspend fun hasVoted(electionId: String, voterUid: String): Boolean {
        val snap = db.collection("votes").document("${voterUid}_$electionId").get().await()
        return snap.exists()
    }

    override suspend fun castVote(electionId: String, voterUid: String, candidateId: String) {
        val election = getElection(electionId)
        if (election.status != ElectionStatus.OPEN) error("This election is not open for voting.")
        val voteId = "${voterUid}_$electionId"
        val existing = db.collection("votes").document(voteId).get().await()
        if (existing.exists()) error("You have already voted in this election.")
        db.collection("votes").document(voteId).set(
            mapOf(
                "electionId" to electionId,
                "voterUid" to voterUid,
                "candidateId" to candidateId,
                "castAt" to Instant.now().toString(),
            ),
        ).await()
    }

    override suspend fun tallies(electionId: String): Map<String, Int> {
        val candidates = listCandidates(electionId)
        val result = candidates.associate { it.id to 0 }.toMutableMap()
        val snap = db.collection("votes").whereEqualTo("electionId", electionId).get().await()
        snap.documents.forEach { doc ->
            val candidateId = doc.getString("candidateId") ?: return@forEach
            result[candidateId] = (result[candidateId] ?: 0) + 1
        }
        return result
    }

    private fun com.google.firebase.firestore.DocumentSnapshot.toVoter(uid: String): Voter =
        Voter(
            uid = uid,
            name = getString("name").orEmpty(),
            email = getString("email").orEmpty(),
            voterId = getString("voterId").orEmpty(),
            constituency = getString("constituency").orEmpty(),
            createdAt = getString("createdAt").orEmpty(),
        )

    private fun com.google.firebase.firestore.DocumentSnapshot.toElection(): Election? {
        if (!exists()) return null
        val status = when (getString("status")?.lowercase()) {
            "open" -> ElectionStatus.OPEN
            "closed" -> ElectionStatus.CLOSED
            else -> ElectionStatus.DRAFT
        }
        return Election(
            id = id,
            title = getString("title") ?: return null,
            description = getString("description").orEmpty(),
            constituency = getString("constituency").orEmpty(),
            status = status,
            startAt = getString("startAt").orEmpty(),
            endAt = getString("endAt").orEmpty(),
        )
    }
}
