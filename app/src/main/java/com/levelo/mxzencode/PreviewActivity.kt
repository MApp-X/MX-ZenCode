package com.levelo.mxzencode

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import android.widget.Toast

class PreviewActivity : AppCompatActivity() {
    private lateinit var previewWebView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_preview)

        previewWebView = findViewById(R.id.previewWebView)

        val settings: WebSettings = previewWebView.settings
        settings.javaScriptEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.domStorageEnabled = true
        @Suppress("DEPRECATION")
        settings.allowFileAccessFromFileURLs = true
        @Suppress("DEPRECATION")
        settings.allowUniversalAccessFromFileURLs = true

        val filePath = intent.getStringExtra("FILE_PATH")

        if (!filePath.isNullOrEmpty()) { // 👈 ফিক্সড: isNullOrEmpty()
            val formattedPath = when {
                filePath.startsWith("file://") || filePath.startsWith("content://") || filePath.startsWith("http") -> filePath
                else -> "file://$filePath"
            }

            previewWebView.webViewClient = WebViewClient() // 👈 ব্রাউজারে জাম্প রোদ করার জন্য
            previewWebView.loadUrl(formattedPath)
            Toast.makeText(this, "Showing: $formattedPath", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "File path is null or empty", Toast.LENGTH_SHORT).show()
        }
    }
}