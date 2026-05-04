package com.vidya

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.*

class MonitorModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "VidyaMonitor"

    @ReactMethod
    fun startMonitoring() {
        val intent = Intent(reactApplicationContext, VidyaMonitorService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactApplicationContext.startForegroundService(intent)
        } else {
            reactApplicationContext.startService(intent)
        }
    }

    @ReactMethod
    fun stopMonitoring() {
        val intent = Intent(reactApplicationContext, VidyaMonitorService::class.java)
        reactApplicationContext.stopService(intent)
    }
}