package com.bharatevote.voter.di

import com.bharatevote.voter.BuildConfig
import com.bharatevote.voter.data.firebase.FirebaseVoterRepository
import com.bharatevote.voter.data.mock.MockVoterRepository
import com.bharatevote.voter.domain.repository.VoterRepository

object AppContainer {
    val repository: VoterRepository by lazy {
        if (BuildConfig.USE_FIREBASE) FirebaseVoterRepository() else MockVoterRepository()
    }
}
