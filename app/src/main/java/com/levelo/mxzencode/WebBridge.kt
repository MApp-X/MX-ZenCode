package com.levelo.mxzencode

import android.R
import android.net.Uri
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast

class WebBridge(
    private val fileManager: FileManager,
    private val webView: WebView,
    private val mainActivity: MainActivity
) {
    @JavascriptInterface
    fun openFolderPicker() {
        fileManager.openFolderPicker { jsonString ->
            webView.post {
                webView.evaluateJavascript("window.onFolderSelected('$jsonString')", null)
            }
        }
    }

    @JavascriptInterface
    fun getSavedFolderFiles(): String {
        return fileManager.getSavedFolderContents()
    }

    @JavascriptInterface
    fun getSubFolderFiles(folderUri: String): String {
        return fileManager.getFolderContents(Uri.parse(folderUri))
    }

    @JavascriptInterface
    fun readFile(fileUri: String): String {
        return fileManager.readFileContent(fileUri)
    }

    @JavascriptInterface
    fun saveFile(fileUri: String, content: String): Boolean {
        return fileManager.writeFileContent(fileUri, content)
    }

    @JavascriptInterface
    fun showToast(msg: String) {
        webView.post {
            Toast.makeText(webView.context, msg, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun applyTheme(theme: String) {
        webView.post {
            if (theme == "dark") {
                mainActivity.applyStatusBarTheme(true)
            } else {
                mainActivity.applyStatusBarTheme(false)
            }
        }
    }

    @JavascriptInterface
    fun renameFile(uri: String, newName: String): Boolean {
        return fileManager.renameItem(uri, newName)
    }

    @JavascriptInterface
    fun deleteFile(uri: String): Boolean {
        return fileManager.deleteItem(uri);
    }

    @JavascriptInterface
    fun createNewFolder(parentURI: String, folderName: String): Boolean {
        return fileManager.createNewFolder(parentURI, folderName)
    }

    @JavascriptInterface
    fun createNewFile(parentURI: String, folderName: String): Boolean {
        return fileManager.createNewFile(parentURI, folderName)
    }

    @JavascriptInterface
    fun checkDir(uri: String): String {
        return fileManager.checkDir(uri)
    }

    @JavascriptInterface
    fun uriFormat(uri: String) : String {
        return fileManager.getReadablePathFromUri(uri)
    }
}