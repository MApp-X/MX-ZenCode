package com.levelo.mxzencode

import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.WindowInsetsController
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader
import android.webkit.WebChromeClient
import androidx.activity.OnBackPressedCallback
import android.widget.Toast

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var fileManager: FileManager
    private lateinit var extensionsManager: ExtensionsManager
    private var isThemeApplied = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main);

        fileManager = FileManager(this)
        extensionsManager = ExtensionsManager(this)

        webView = findViewById(R.id.editorWebView)

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true

        webView.addJavascriptInterface(WebBridge(fileManager, webView, this, extensionsManager), "AndroidBridge")

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()


        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest
            ): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url)
            }

        }

        webView.webChromeClient = WebChromeClient()

        webView.loadUrl("https://appassets.androidplatform.net/assets/editor/dist/index.html")

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.animate()
                        .alpha(0.0f)
                        .setDuration(200)
                        .withEndAction {
                            webView.goBack()
                            webView.animate().alpha(1.0f).setDuration(150).start()
                        }
                        .start()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    fun applyStatusBarTheme(isDark: Boolean) {
        val window = window

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val controller = window.insetsController
            if (isDark) {
                window.statusBarColor = Color.parseColor("#121212")
                controller?.setSystemBarsAppearance(
                    0,
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                )
            } else {
                window.statusBarColor = Color.parseColor("#FFFFFF")
                controller?.setSystemBarsAppearance(
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                )
            }
        } else @Suppress("DEPRECATION") {
            if (isDark) {
                window.statusBarColor = Color.parseColor("#121212")
                window.decorView.systemUiVisibility = 0
            } else {
                window.statusBarColor = Color.parseColor("#FFFFFF")
                window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            }
        }
    }
}