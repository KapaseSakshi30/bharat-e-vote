package com.bharatevote.voter.ui.elections

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.bharatevote.voter.domain.model.Election
import com.bharatevote.voter.domain.model.SessionUser
import com.bharatevote.voter.domain.repository.VoterRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ElectionsUiState(
    val loading: Boolean = true,
    val error: String? = null,
    val elections: List<Election> = emptyList(),
    val user: SessionUser? = null,
    val usingMock: Boolean = true,
)

class ElectionsViewModel(
    private val repository: VoterRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(ElectionsUiState(usingMock = repository.usingMock))
    val state: StateFlow<ElectionsUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update {
                it.copy(loading = true, error = null, user = repository.currentSession())
            }
            runCatching { repository.listElections() }
                .onSuccess { list ->
                    _state.update { s -> s.copy(loading = false, elections = list) }
                }
                .onFailure { e ->
                    _state.update { s ->
                        s.copy(loading = false, error = e.message ?: "Failed to load elections.")
                    }
                }
        }
    }

    fun signOut(onDone: () -> Unit) {
        viewModelScope.launch {
            repository.signOut()
            onDone()
        }
    }

    companion object {
        fun factory(repository: VoterRepository) = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T =
                ElectionsViewModel(repository) as T
        }
    }
}
