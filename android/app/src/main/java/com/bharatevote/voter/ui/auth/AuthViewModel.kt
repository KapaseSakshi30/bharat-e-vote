package com.bharatevote.voter.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.bharatevote.voter.domain.repository.VoterRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AuthUiState(
    val loading: Boolean = false,
    val error: String? = null,
    val signedIn: Boolean = false,
    val usingMock: Boolean = true,
)

class AuthViewModel(
    private val repository: VoterRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(
        AuthUiState(
            signedIn = repository.currentSession() != null,
            usingMock = repository.usingMock,
        ),
    )
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            runCatching { repository.signIn(email.trim(), password) }
                .onSuccess { _state.update { s -> s.copy(loading = false, signedIn = true) } }
                .onFailure { e ->
                    _state.update { s ->
                        s.copy(loading = false, error = e.message ?: "Sign-in failed.")
                    }
                }
        }
    }

    fun register(
        name: String,
        email: String,
        password: String,
        voterId: String,
        constituency: String,
    ) {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            runCatching {
                repository.register(name.trim(), email.trim(), password, voterId.trim(), constituency.trim())
            }
                .onSuccess { _state.update { s -> s.copy(loading = false, signedIn = true) } }
                .onFailure { e ->
                    _state.update { s ->
                        s.copy(loading = false, error = e.message ?: "Registration failed.")
                    }
                }
        }
    }

    fun clearError() = _state.update { it.copy(error = null) }

    companion object {
        fun factory(repository: VoterRepository) = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T =
                AuthViewModel(repository) as T
        }
    }
}
