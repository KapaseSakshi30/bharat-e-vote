package com.bharatevote.voter.ui.ballot

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.bharatevote.voter.domain.model.Candidate
import com.bharatevote.voter.domain.model.Election
import com.bharatevote.voter.domain.repository.VoterRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class BallotUiState(
    val loading: Boolean = true,
    val submitting: Boolean = false,
    val error: String? = null,
    val success: String? = null,
    val election: Election? = null,
    val candidates: List<Candidate> = emptyList(),
    val selectedId: String? = null,
    val alreadyVoted: Boolean = false,
)

class BallotViewModel(
    private val electionId: String,
    private val repository: VoterRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(BallotUiState())
    val state: StateFlow<BallotUiState> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            val session = repository.currentSession()
            if (session == null) {
                _state.update { it.copy(loading = false, error = "Please sign in again.") }
                return@launch
            }
            runCatching {
                val election = repository.getElection(electionId)
                val candidates = repository.listCandidates(electionId)
                val voted = repository.hasVoted(electionId, session.uid)
                Triple(election, candidates, voted)
            }
                .onSuccess { (election, candidates, voted) ->
                    _state.update {
                        it.copy(
                            loading = false,
                            election = election,
                            candidates = candidates,
                            alreadyVoted = voted,
                        )
                    }
                }
                .onFailure { e ->
                    _state.update {
                        it.copy(loading = false, error = e.message ?: "Could not open ballot.")
                    }
                }
        }
    }

    fun select(candidateId: String) = _state.update { it.copy(selectedId = candidateId, error = null) }

    fun castVote() {
        val selected = _state.value.selectedId
        val session = repository.currentSession()
        if (selected == null) {
            _state.update { it.copy(error = "Select a candidate before casting your vote.") }
            return
        }
        if (session == null) {
            _state.update { it.copy(error = "Please sign in again.") }
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(submitting = true, error = null) }
            runCatching { repository.castVote(electionId, session.uid, selected) }
                .onSuccess {
                    _state.update {
                        it.copy(
                            submitting = false,
                            alreadyVoted = true,
                            success = "Your vote has been recorded. Thank you for participating.",
                        )
                    }
                }
                .onFailure { e ->
                    _state.update {
                        it.copy(submitting = false, error = e.message ?: "Vote could not be cast.")
                    }
                }
        }
    }

    companion object {
        fun factory(electionId: String, repository: VoterRepository) =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T =
                    BallotViewModel(electionId, repository) as T
            }
    }
}
