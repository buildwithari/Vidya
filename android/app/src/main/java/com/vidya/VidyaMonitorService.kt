package com.vidya

import android.app.*
import android.content.Context
import android.content.Intent
import android.app.usage.UsageStatsManager
import android.os.IBinder
import android.os.Handler
import android.os.Looper
import androidx.core.app.NotificationCompat

class VidyaMonitorService : Service() {

    private val handler = Handler(Looper.getMainLooper())
    private val channelId = "vidya_monitor"
    private val notifChannelId = "vidya_main"

    private val distractionApps = mapOf(
        "com.instagram.android" to "Instagram",
        "com.facebook.katana" to "Facebook",
        "com.google.android.youtube" to "YouTube",
        "com.zhiliaoapp.musically" to "TikTok",
        "com.twitter.android" to "Twitter/X",
        "com.snapchat.android" to "Snapchat"
    )

    private var lastNudgeTime = 0L
    private val nudgeCooldown = 5 * 60 * 1000L

    private val checkRunnable = object : Runnable {
        override fun run() {
            checkForegroundApp()
            handler.postDelayed(this, 30000)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createChannels()
        startForeground(1, buildPersistentNotification())
        handler.post(checkRunnable)
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(checkRunnable)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun checkForegroundApp() {
        val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val time = System.currentTimeMillis()
        val stats = usm.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            time - 10000,
            time
        ) ?: return

        val topApp = stats.maxByOrNull { it.lastTimeUsed }?.packageName ?: return
        val appName = distractionApps[topApp] ?: return

        val now = System.currentTimeMillis()
        if (now - lastNudgeTime < nudgeCooldown) return
        lastNudgeTime = now

        sendNudgeNotification(appName)
    }

    private fun sendNudgeNotification(appName: String) {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notif = NotificationCompat.Builder(this, notifChannelId)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("Vidya 🪔")
            .setContentText("$appName. Close it. You know what you should be doing.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        manager.notify((System.currentTimeMillis() % 10000).toInt(), notif)
    }

    private fun buildPersistentNotification(): Notification {
        return NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Vidya is watching")
            .setContentText("Staying focused today.")
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setSilent(true)
            .build()
    }

    private fun createChannels() {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        NotificationChannel(
            channelId,
            "Vidya Monitor",
            NotificationManager.IMPORTANCE_MIN
        ).also { manager.createNotificationChannel(it) }

        NotificationChannel(
            notifChannelId,
            "Vidya",
            NotificationManager.IMPORTANCE_HIGH
        ).also { manager.createNotificationChannel(it) }
    }
}