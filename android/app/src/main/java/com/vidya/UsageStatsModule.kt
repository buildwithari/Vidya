package com.vidya

import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.*

class UsageStatsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "UsageStats"

    @ReactMethod
    fun hasPermission(promise: Promise) {
        try {
            val usm = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE)
                    as UsageStatsManager
            val time = System.currentTimeMillis()
            val stats = usm.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                time - 1000 * 60,
                time
            )
            promise.resolve(stats != null && stats.isNotEmpty())
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun requestPermission() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun getForegroundApp(promise: Promise) {
        try {
            val usm = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE)
                    as UsageStatsManager
            val time = System.currentTimeMillis()
            val stats = usm.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                time - 1000 * 10,
                time
            )
            if (stats == null || stats.isEmpty()) {
                promise.resolve(null)
                return
            }
            val sorted = stats.sortedByDescending { it.lastTimeUsed }
            promise.resolve(sorted.firstOrNull()?.packageName)
        } catch (e: Exception) {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun getUsageStats(promise: Promise) {
        try {
            val usm = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE)
                    as UsageStatsManager
            val cal = java.util.Calendar.getInstance()
            cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
            cal.set(java.util.Calendar.MINUTE, 0)
            val stats = usm.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                cal.timeInMillis,
                System.currentTimeMillis()
            )
            val result = Arguments.createArray()
            stats?.forEach { stat ->
                if (stat.totalTimeInForeground > 0) {
                    val map = Arguments.createMap()
                    map.putString("packageName", stat.packageName)
                    map.putDouble("totalMins", stat.totalTimeInForeground / 60000.0)
                    result.pushMap(map)
                }
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.resolve(Arguments.createArray())
        }
    }
}