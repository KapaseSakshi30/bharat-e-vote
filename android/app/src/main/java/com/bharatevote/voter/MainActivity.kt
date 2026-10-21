package com.bharatevote.voter

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.bharatevote.voter.di.AppContainer
import com.bharatevote.voter.ui.auth.LoginScreen
import com.bharatevote.voter.ui.auth.RegisterScreen
import com.bharatevote.voter.ui.ballot.BallotScreen
import com.bharatevote.voter.ui.elections.ElectionsScreen
import com.bharatevote.voter.ui.results.ResultsScreen
import com.bharatevote.voter.ui.theme.BharatEVoteTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            BharatEVoteTheme {
                BharatEVoteNav()
            }
        }
    }
}

private object Routes {
    const val Login = "login"
    const val Register = "register"
    const val Elections = "elections"
    const val Ballot = "ballot/{electionId}"
    const val Results = "results/{electionId}"

    fun ballot(id: String) = "ballot/$id"
    fun results(id: String) = "results/$id"
}

@Composable
private fun BharatEVoteNav() {
    val navController = rememberNavController()
    val start = if (AppContainer.repository.currentSession() != null) {
        Routes.Elections
    } else {
        Routes.Login
    }

    NavHost(navController = navController, startDestination = start) {
        composable(Routes.Login) {
            LoginScreen(
                onSignedIn = {
                    navController.navigate(Routes.Elections) {
                        popUpTo(Routes.Login) { inclusive = true }
                    }
                },
                onGoRegister = { navController.navigate(Routes.Register) },
            )
        }
        composable(Routes.Register) {
            RegisterScreen(
                onSignedIn = {
                    navController.navigate(Routes.Elections) {
                        popUpTo(Routes.Login) { inclusive = true }
                    }
                },
                onGoLogin = { navController.popBackStack() },
            )
        }
        composable(Routes.Elections) {
            ElectionsScreen(
                onOpenBallot = { navController.navigate(Routes.ballot(it)) },
                onOpenResults = { navController.navigate(Routes.results(it)) },
                onSignedOut = {
                    navController.navigate(Routes.Login) {
                        popUpTo(0) { inclusive = true }
                    }
                },
            )
        }
        composable(
            Routes.Ballot,
            arguments = listOf(navArgument("electionId") { type = NavType.StringType }),
        ) { entry ->
            val id = entry.arguments?.getString("electionId").orEmpty()
            BallotScreen(
                electionId = id,
                onBack = { navController.popBackStack() },
                onViewResults = { navController.navigate(Routes.results(it)) },
            )
        }
        composable(
            Routes.Results,
            arguments = listOf(navArgument("electionId") { type = NavType.StringType }),
        ) { entry ->
            val id = entry.arguments?.getString("electionId").orEmpty()
            ResultsScreen(
                electionId = id,
                onBack = { navController.popBackStack() },
            )
        }
    }
}
