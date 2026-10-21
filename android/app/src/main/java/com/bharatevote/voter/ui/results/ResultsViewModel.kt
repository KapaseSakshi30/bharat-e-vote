package com.bharatevote.voter.ui.results

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

data class ResultsUiState(
    val loading: Boolean = true,
    val error: String? = null,
    val election: Election? = null,
    val candidates: List<Candidate> = emptyList(),
    val tallies: Map<String, Int> = emptyMap(),
)

class ResultsViewModel(
    private val electionId: String,
    private val repository: VoterRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(ResultsUiState())
    val state: StateFlow<ResultsUiState> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            runCatching {
                Triple(
                    repository.getElection(electionId),
                    repository.listCandidates(electionId),
                    repository.tallies(electionId),
                )
            }
                .onSuccess { (election, candidates, tallies) ->
                    _state.update {
                        it.copy(
                            loading = false,
                            election = election,
                            candidates = candidates.sortedByDescending { c -> tallies[c.id] ?: 0 },
                            tallies = tallies,
                        )
                    }
                }
                .onFailure { e ->
                    _state.update {
                        it.copy(loading = false, error = e.message ?: "Could not load results.")
                    }
                }
        }
    }

    companion object {
        fun factory(electionId: String, repository: VoterRepository) =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T =
                    ResultsViewModel(electionId, repository) as T
            }
    }
}
