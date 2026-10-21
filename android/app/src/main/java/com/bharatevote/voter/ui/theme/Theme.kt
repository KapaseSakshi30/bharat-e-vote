package com.bharatevote.voter.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Ink = Color(0xFF0A1628)
val Saffron = Color(0xFFE86A1A)
val Leaf = Color(0xFF0F766E)
val Mist = Color(0xFFEEF3F7)
val Paper = Color(0xFFF8FAFC)

private val LightColors = lightColorScheme(
    primary = Saffron,
    onPrimary = Ink,
    secondary = Leaf,
    onSecondary = Color.White,
    background = Mist,
    onBackground = Ink,
    surface = Paper,
    onSurface = Ink,
)

private val DarkColors = darkColorScheme(
    primary = Saffron,
    onPrimary = Ink,
    secondary = Leaf,
    background = Ink,
    onBackground = Mist,
    surface = Color(0xFF122033),
    onSurface = Mist,
)

@Composable
fun BharatEVoteTheme(content: @Composable () -> Unit) {
    val dark = isSystemInDarkTheme()
    MaterialTheme(
        colorScheme = if (dark) DarkColors else LightColors,
        content = content,
    )
}
