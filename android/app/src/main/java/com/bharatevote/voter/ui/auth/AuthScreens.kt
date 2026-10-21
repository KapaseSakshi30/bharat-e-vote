package com.bharatevote.voter.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.bharatevote.voter.di.AppContainer
import com.bharatevote.voter.ui.components.MockBanner

@Composable
fun LoginScreen(
    onSignedIn: () -> Unit,
    onGoRegister: () -> Unit,
    viewModel: AuthViewModel = viewModel(factory = AuthViewModel.factory(AppContainer.repository)),
) {
    val state by viewModel.state.collectAsState()
    var email by remember { mutableStateOf("voter@demo.in") }
    var password by remember { mutableStateOf("voter123") }

    LaunchedEffect(state.signedIn) {
        if (state.signedIn) onSignedIn()
    }

    Column(Modifier = Modifier.fillMaxSize()) {
        MockBanner(state.usingMock)
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("Bharat E Vote", style = MaterialTheme.typography.displaySmall)
            Text("Voter sign in", style = MaterialTheme.typography.titleLarge)
            Text(
                "Use your registered email to open today’s ballot.",
                style = MaterialTheme.typography.bodyMedium,
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = email,
                onValueChange = { email = it; viewModel.clearError() },
                label = { Text("Email") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            )
            OutlinedTextField(
                value = password,
                onValueChange = { password = it; viewModel.clearError() },
                label = { Text("Password") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
            )
            state.error?.let {
                Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            }
            Button(
                onClick = { viewModel.signIn(email, password) },
                enabled = !state.loading,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(if (state.loading) "Signing in…" else "Sign in")
            }
            TextButton(onClick = onGoRegister, modifier = Modifier.fillMaxWidth()) {
                Text("New elector? Register with EPIC ID")
            }
        }
    }
}

@Composable
fun RegisterScreen(
    onSignedIn: () -> Unit,
    onGoLogin: () -> Unit,
    viewModel: AuthViewModel = viewModel(factory = AuthViewModel.factory(AppContainer.repository)),
) {
    val state by viewModel.state.collectAsState()
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var voterId by remember { mutableStateOf("") }
    var constituency by remember { mutableStateOf("") }

    LaunchedEffect(state.signedIn) {
        if (state.signedIn) onSignedIn()
    }

    Column(modifier = Modifier.fillMaxSize()) {
        MockBanner(state.usingMock)
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("Register as a voter", style = MaterialTheme.typography.headlineMedium)
            Text(
                "Link your EPIC number so officers can verify you against the roll.",
                style = MaterialTheme.typography.bodyMedium,
            )
            OutlinedTextField(name, { name = it }, label = { Text("Full name") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            OutlinedTextField(email, { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            OutlinedTextField(
                password,
                { password = it },
                label = { Text("Password") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
            )
            OutlinedTextField(voterId, { voterId = it }, label = { Text("EPIC / voter ID") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            OutlinedTextField(constituency, { constituency = it }, label = { Text("Constituency") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            state.error?.let {
                Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            }
            Button(
                onClick = { viewModel.register(name, email, password, voterId, constituency) },
                enabled = !state.loading,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(if (state.loading) "Creating account…" else "Create voter account")
            }
            OutlinedButton(onClick = onGoLogin, modifier = Modifier.fillMaxWidth()) {
                Text("Already registered? Sign in")
            }
        }
    }
}
