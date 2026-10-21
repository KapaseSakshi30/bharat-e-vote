package com.bharatevote.voter.ui.results

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier.modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.bharatevote.voter.di.AppContainer
import com.bharatevote.voter.ui.components.EmptyBlock
import com.bharatevote.voter.ui.components.ErrorBlock
import com.bharatevote.voter.ui.components.LoadingBlock
import com.bharatevote.voter.ui.theme.Leaf

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResultsScreen(
    electionId: String,
    onBack: () -> Unit,
    viewModel: ResultsViewModel = viewModel(
        key = "results-$electionId",
        factory = ResultsViewModel.factory(electionId, AppContainer.repository),
    ),
) {
    val state by viewModel.state.collectAsState()
    val total = state.tallies.values.sum()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Results") },
                navigationIcon = {
                    OutlinedButton(onClick = onBack, modifier = Modifier.padding(start = 8.dp)) {
                        Text("Back")
                    }
                },
            )
        },
    ) { padding ->
        when {
            state.loading -> LoadingBlock("Counting ballots…")
            state.error != null -> ErrorBlock(state.error!!, onRetry = viewModel::load)
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
                    Text(
                        "${election.constituency} · $total votes counted",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    if (state.candidates.isEmpty()) {
                        EmptyBlock(
                            title = "No candidates on the ballot",
                            description = "Results will appear once candidates are added and votes are cast.",
                        )
                    } else {
                        state.candidates.forEachIndexed { index, candidate ->
                            val count = state.tallies[candidate.id] ?: 0
                            val pct = if (total == 0) 0 else ((count * 100f) / total).toInt()
                            Card(modifier = Modifier.fillMaxWidth()) {
                                Column(Modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Row(modifier = Modifier.fillMaxWidth()) {
                                        Text(
                                            text = (if (index == 0 && total > 0) "★ " else "") + candidate.name,
                                            style = MaterialTheme.typography.titleMedium,
                                            modifier = Modifier.weight(1f),
                                        )
                                        Text("$count ($pct%)", style = MaterialTheme.typography.labelLarge)
                                    }
                                    Text(
                                        "${candidate.party} · ${candidate.symbol}",
                                        style = MaterialTheme.typography.bodySmall,
                                    )
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(8.dp)
                                            .background(MaterialTheme.colorScheme.surfaceVariant),
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxHeight()
                                                .fillMaxWidth(pct / 100f)
                                                .background(Leaf),
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
