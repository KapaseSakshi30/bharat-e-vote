package com.bharatevote.voter.ui.ballot

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier.modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.bharatevote.voter.di.AppContainer
import com.bharatevote.voter.domain.model.ElectionStatus
import com.bharatevote.voter.ui.components.EmptyBlock
import com.bharatevote.voter.ui.components.ErrorBlock
import com.bharatevote.voter.ui.components.LoadingBlock
import com.bharatevote.voter.ui.theme.Leaf

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BallotScreen(
    electionId: String,
    onBack: () -> Unit,
    onViewResults: (String) -> Unit,
    viewModel: BallotViewModel = viewModel(
        key = electionId,
        factory = BallotViewModel.factory(electionId, AppContainer.repository),
    ),
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Ballot") },
                navigationIcon = {
                    OutlinedButton(onClick = onBack, modifier = Modifier.padding(start = 8.dp)) {
                        Text("Back")
                    }
                },
            )
        },
    ) { padding ->
        when {
            state.loading -> LoadingBlock("Opening ballot…")
            state.error != null && state.election == null ->
                ErrorBlock(state.error!!, onRetry = viewModel::load)
            else -> {
                val election = state.election ?: return@Scaffold
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text(election.title, style = MaterialTheme.typography.headlineSmall)
                    Text(election.constituency, style = MaterialTheme.typography.labelLarge)
                    Text(election.description, style = MaterialTheme.typography.bodyMedium)

                    if (election.status != ElectionStatus.OPEN) {
                        EmptyBlock(
                            title = "Voting is closed",
                            description = "This poll is no longer accepting ballots.",
                        )
                        Button(onClick = { onViewResults(election.id) }) { Text("View results") }
                    } else if (state.alreadyVoted) {
                        Text(
                            state.success ?: "You have already voted in this election.",
                            style = MaterialTheme.typography.titleMedium,
                            color = Leaf,
                        )
                        Button(onClick = { onViewResults(election.id) }) { Text("Preview live tally") }
                    } else if (state.candidates.isEmpty()) {
                        EmptyBlock(
                            title = "No candidates yet",
                            description = "Officers have not added candidates to this ballot.",
                        )
                    } else {
                        state.candidates.forEach { candidate ->
                            val selected = state.selectedId == candidate.id
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(
                                        width = if (selected) 2.dp else 1.dp,
                                        color = if (selected) Leaf else MaterialTheme.colorScheme.outlineVariant,
                                        shape = RoundedCornerShape(12.dp),
                                    )
                                    .clickable { viewModel.select(candidate.id) }
                                    .padding(12.dp),
                                verticalAlignment = Alignment.Top,
                            ) {
                                RadioButton(
                                    selected = selected,
                                    onClick = { viewModel.select(candidate.id) },
                                )
                                Column(modifier = Modifier.padding(start = 8.dp)) {
                                    Text(candidate.name, style = MaterialTheme.typography.titleMedium)
                                    Text(
                                        "${candidate.party} · Symbol: ${candidate.symbol}",
                                        style = MaterialTheme.typography.bodySmall,
                                    )
                                    Text(candidate.manifesto, style = MaterialTheme.typography.bodyMedium)
                                }
                            }
                        }
                        state.error?.let {
                            Text(it, color = MaterialTheme.colorScheme.error)
                        }
                        Button(
                            onClick = viewModel::castVote,
                            enabled = !state.submitting,
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text(if (state.submitting) "Recording vote…" else "Cast my vote")
                        }
                    }
                }
            }
        }
    }
}
