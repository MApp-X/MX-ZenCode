package com.levelo.mxzencode

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.documentfile.provider.DocumentFile
import org.json.JSONArray
import org.json.JSONObject
import android.widget.Toast

class FileManager(private val activity: ComponentActivity) {
    private val prefs: SharedPreferences =
        activity.getSharedPreferences("app_storage_prefs", Context.MODE_PRIVATE)

    private var openFolderLauncher: ActivityResultLauncher<Uri?>? = null
    private var onFolderSelectedCallback: ((String) -> Unit)? = null

    init {
        openFolderLauncher = activity.registerForActivityResult(
            ActivityResultContracts.OpenDocumentTree()
        ) { uri: Uri? ->
            uri?.let { folderUri ->
                try {
                    val takeFlags: Int = Intent.FLAG_GRANT_READ_URI_PERMISSION or
                            Intent.FLAG_GRANT_WRITE_URI_PERMISSION

                    activity.contentResolver.takePersistableUriPermission(folderUri, takeFlags)

                    saveSavedFolderUri(folderUri.toString())

                    val fileListJson = getFolderContents(folderUri)
                    onFolderSelectedCallback?.invoke(fileListJson)
                } catch (e: SecurityException) {
                    e.printStackTrace()
                    onFolderSelectedCallback?.invoke("[]")
                }
            }
        }
    }

    // =============================== open folder ================================
    fun openFolderPicker(callback: (String) -> Unit) {
        this.onFolderSelectedCallback = callback
        openFolderLauncher?.launch(null)
    }

    fun getSavedFolderContents(): String {
        val savedUriString = getSavedFolderUri() ?: return "[]"
        return getFolderContents(Uri.parse(savedUriString))
    }

    // =============================== folder content ==============================
    fun getFolderContents(folderUri: Uri): String {
        return try {
            val rootDoc = DocumentFile.fromTreeUri(activity, folderUri) ?: return "[]"
            val jsonArray = JSONArray()

            val files = rootDoc.listFiles()
            for (file in files) {
                val fileObj = JSONObject().apply {
                    put("name", file.name ?: "Unknown")
                    put("uri", file.uri.toString())
                    put("isDirectory", file.isDirectory)
                }
                jsonArray.put(fileObj)
            }
            jsonArray.toString()
        } catch (e: Exception) {
            e.printStackTrace()
            "[]"
        }
    }

    // ============================= file read =====================================
    fun readFileContent(fileUriString: String): String {
        return try {
            val fileUri = Uri.parse(fileUriString)
            activity.contentResolver.openInputStream(fileUri)?.use { inputStream ->
                inputStream.bufferedReader().use { it.readText() }
            } ?: ""
        } catch (e: Exception) {
            e.printStackTrace()
            "Error reading file: ${e.message}"
        }
    }

    // ============================ write file ======================================
    fun writeFileContent(fileUriString: String, content: String): Boolean {
        return try {
            val fileUri = Uri.parse(fileUriString)
            activity.contentResolver.openOutputStream(fileUri, "rwt")?.use { outputStream ->
                outputStream.write(content.toByteArray())
                outputStream.flush()
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            activity.runOnUiThread {
                Toast.makeText(activity, e.message ?: "Unknown error", Toast.LENGTH_SHORT).show()
            } 
            false
        }
    }

    private fun saveSavedFolderUri(uriString: String) {
        prefs.edit().putString("saved_folder_uri", uriString).apply()
    }

    fun getSavedFolderUri(): String? {
        return prefs.getString("saved_folder_uri", null)
    }
}