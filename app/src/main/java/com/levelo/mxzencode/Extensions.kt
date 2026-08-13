package com.levelo.mxzencode

import android.app.Activity
import android.content.Intent
import android.net.Uri
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import java.io.File
import java.io.FileOutputStream
import java.util.zip.ZipInputStream
import android.widget.Toast
import org.json.JSONObject

class ExtensionsManager(private val activity: AppCompatActivity) {

    private var onExtensionImported: ((Boolean) -> Unit)? = null

    // Activity Result Launcher to pick a ZIP file using SAF
    private val zipPickerLauncher: ActivityResultLauncher<Intent> =
        activity.registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == Activity.RESULT_OK) {
                result.data?.data?.let { uri ->
                    val success = processAndExtractZip(uri)
                    onExtensionImported?.invoke(success)
                } ?: onExtensionImported?.invoke(false)
            } else {
                onExtensionImported?.invoke(false)
            }
        }

    // Function to trigger file picker for extension zip
    fun importExtensionZip(callback: (Boolean) -> Unit) {
        onExtensionImported = callback
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/zip"
        }
        zipPickerLauncher.launch(intent)
    }

    // Extract the selected ZIP file into the app's internal extensions directory
    private fun processAndExtractZip(uri: Uri): Boolean {
        return try {
            val contentResolver = activity.contentResolver
            val extensionsDir = File(activity.filesDir, "extensions")
            if (!extensionsDir.exists()) {
                extensionsDir.mkdirs()
            }

            contentResolver.openInputStream(uri)?.use { inputStream ->
                ZipInputStream(inputStream).use { zipInputStream ->
                    var zipEntry = zipInputStream.nextEntry
                    while (zipEntry != null) {
                        val newFile = File(extensionsDir, zipEntry.name)

                        if (zipEntry.isDirectory) {
                            newFile.mkdirs()
                        } else {
                            // Ensure parent directories exist
                            newFile.parentFile?.mkdirs()

                            FileOutputStream(newFile).use { fos ->
                                val buffer = ByteArray(1024)
                                var len: Int
                                while (zipInputStream.read(buffer).also { len = it } > 0) {
                                    fos.write(buffer, 0, len)
                                }
                            }
                        }
                        zipInputStream.closeEntry()
                        zipEntry = zipInputStream.nextEntry
                    }
                }
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    // Function to get all installed extensions as a JSON string
    fun getInstalledExtensionsJson(): String {
        val extensionsDir = File(activity.filesDir, "extensions")
        if (!extensionsDir.exists() || !extensionsDir.isDirectory) {
            return "[]"
        }

        val jsonArray = StringBuilder()
        jsonArray.append("[")

        val extensionFolders = extensionsDir.listFiles { file -> file.isDirectory }
        if (extensionFolders != null) {
            val foldersList = extensionFolders.filter { it.isDirectory }
            for (i in foldersList.indices) {
                val folder = foldersList[i]
                val jsonFile = File(folder, "extension.json")

                var name = folder.name
                var displayName = folder.name
                var version = "1.0.0"
                var type = "unknown"
                var main = ""

                // If extension.json exists, read its basic info
                if (jsonFile.exists()) {
                    try {
                        val content = jsonFile.readText()
                        // Simple parsing without heavy libraries to keep it easy
                        if (content.contains("\"name\"")) {
                            // Extract values roughly or keep it simple
                            name = folder.name
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }

                jsonArray.append("{")
                jsonArray.append("\"folderName\":\"${folder.name}\",")
                jsonArray.append("\"path\":\"${folder.absolutePath}\"")
                jsonArray.append("}")

                if (i < foldersList.size - 1) {
                    jsonArray.append(",")
                }
            }
        }

        jsonArray.append("]")
        return jsonArray.toString()
    }

    fun loadExtensionMainCode(folderPath: String): String {
        try {
            val folder = File(folderPath)
            if (!folder.exists() || !folder.isDirectory) {
                showToastOnMainThread("Extension folder not found!")
                return ""
            }

            val jsonFile = File(folder, "extension.json")
            if (!jsonFile.exists()) {
                showToastOnMainThread("extension.json missing in ${folder.name}")
                return ""
            }

            // Read extension.json content
            val jsonString = jsonFile.readText()
            val jsonObject = JSONObject(jsonString)

            // Assuming 'main' key holds the main filename in extension.json
            val mainFileName = jsonObject.optString("main", "")
            if (mainFileName.isEmpty()) {
                showToastOnMainThread("Main file not specified in extension.json")
                return ""
            }

            val mainFile = File(folder, mainFileName)
            if (!mainFile.exists()) {
                showToastOnMainThread("Main file '$mainFileName' not found!")
                return ""
            }

            // Return the code content of the main file as string
            return mainFile.readText()

        } catch (e: Exception) {
            e.printStackTrace()
            showToastOnMainThread("Error loading extension: ${e.message}")
            return ""
        }
    }

    // Helper function to show Toast safely from any thread
    private fun showToastOnMainThread(message: String) {
        android.os.Handler(android.os.Looper.getMainLooper()).post {
            Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
        }
    }
}