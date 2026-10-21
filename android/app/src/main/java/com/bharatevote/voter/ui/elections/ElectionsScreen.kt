package com.bharatevote.voter.ui.elections

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.bharatevote.voter.di.AppContainer
import com.bharatevote.voter.domain.model.Election
import com.bharatevote.voter.domain.model.ElectionStatus
import com.bharatevote.voter.ui.components.EmptyBlock
import com.bharatevote.voter.ui.components.ErrorBlock
import com.bharatevote.voter.ui.components.LoadingBlock
import com.bharatevote.voter.ui.components.MockBanner

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ElectionsScreen(
    onOpenBallot: (String) -> Unit,
    onOpenResults: (String) -> Unit,
    onSignedOut: () -> Unit,
    viewModel: ElectionsViewModel = viewModel(factory = ElectionsViewModel.factory(AppContainer.repository)),
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Your ballot box") },
                actions = {
                    TextButton(onClick = { viewModel.signOut(onSignedOut) }) {
                        Text("Sign out")
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
        ) {
            MockBanner(state.usingMock)
            when {
                state.loading -> LoadingBlock("Fetching elections…")
                state.error != null -> ErrorBlock(state.error!!, onRetry = viewModel::refresh)
                state.elections.isEmpty() -> EmptyBlock(
                    title = "No elections yet",
                    description = "When an officer opens a poll for your constituency, it will show up here.",
                )
                else -> LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    item {
                        Text(
                            text = state.user?.let { "Welcome, ${it.displayName}. Open elections appear below." }
                                ?: "Open elections appear below.",
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.padding(bottom = 4.dp),
                        )
                    }
                    items(state.elections, key = { it.id }) { election ->
                        ElectionCard(
                            election = election,
                            onClick = {
                                if (election.status == ElectionStatus.OPEN) onOpenBallot(election.id)
                                else onOpenResults(election.id)
                            },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ElectionCard(election: Election, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(election.title, style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
                AssistChip(onClick = {}, label = { Text(election.status.name.lowercase()) })
            }
            Text(election.constituency, style = MaterialTheme.typography.labelLarge)
            Text(election.description, style = MaterialTheme.typography.bodyMedium)
            Text(
                if (election.status == ElectionStatus.OPEN) "Tap to open ballot" else "Tap to view results",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.secondary,
            )
        }
    }
}
