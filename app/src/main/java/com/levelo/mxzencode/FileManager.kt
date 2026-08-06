package com.levelo.mxzencode

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.provider.DocumentsContract
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.documentfile.provider.DocumentFile
import org.json.JSONArray
import org.json.JSONObject
import android.widget.Toast
import android.util.Log


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

    // ============================ delete file / folder ============================
    fun deleteItem(fileUriString: String): Boolean {
        return try {
            val uri = Uri.parse(fileUriString)
            val documentFile = DocumentFile.fromSingleUri(activity, uri)
                ?: DocumentFile.fromTreeUri(activity, uri)

            if (documentFile != null && documentFile.exists()) {
                documentFile.delete()
            } else {
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    // ============================ rename file / folder ============================
    fun renameItem(fileUriString: String, newName: String): Boolean {
        Log.d("FILE_MANAGER", "Starting rename for: $fileUriString to: $newName")

        return try {
            val targetUri = Uri.parse(fileUriString)

            try {
                val renamedUri = DocumentsContract.renameDocument(
                    activity.contentResolver,
                    targetUri,
                    newName
                )
                if (renamedUri != null) {
                    Log.d("FILE_MANAGER", "Native rename success")
                    return true
                }
            } catch (e: UnsupportedOperationException) {
                Log.w("FILE_MANAGER", "Native rename unsupported by provider, switching to parent-based copy-delete")
            } catch (e: Exception) {
                Log.w("FILE_MANAGER", "Native rename failed: ${e.message}")
            }

            val targetDoc = DocumentFile.fromSingleUri(activity, targetUri) ?: return false

            if (targetDoc.isDirectory) {
                Log.e("FILE_MANAGER", "Directory rename via fallback is not supported")
                return false
            }

            val parentUri = getParentUri(targetUri) ?: run {
                val savedUriString = getSavedFolderUri() ?: return false
                Uri.parse(savedUriString)
            }

            val parentDoc = DocumentFile.fromTreeUri(activity, parentUri)
                ?: DocumentFile.fromSingleUri(activity, parentUri)
                ?: return false

            val mimeType = activity.contentResolver.getType(targetUri) ?: "application/octet-stream"

            val newFile = parentDoc.createFile(mimeType, newName) ?: return false
            var copySuccess = false
            activity.contentResolver.openInputStream(targetUri)?.use { inputStream ->
                activity.contentResolver.openOutputStream(newFile.uri)?.use { outputStream ->
                    inputStream.copyTo(outputStream)
                    outputStream.flush()
                    copySuccess = true
                }
            }

            if (copySuccess) {
                deleteItem(fileUriString)
                Log.d("FILE_MANAGER", "Copy-Delete rename succeeded in exact parent folder: ${newFile.uri}")
                true
            } else {
                newFile.delete()
                false
            }
        } catch (e: Exception) {
            Log.e("FILE_MANAGER", "Rename EXCEPTION: ${e.message}", e)
            false
        }
    }

    private fun getParentUri(fileUri: Uri): Uri? {
        return try {
            val documentId = DocumentsContract.getDocumentId(fileUri)
            val lastSlashIndex = documentId.lastIndexOf('/')

            if (lastSlashIndex != -1) {
                val parentDocumentId = documentId.substring(0, lastSlashIndex)
                DocumentsContract.buildDocumentUriUsingTree(fileUri, parentDocumentId)
            } else {
                null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }


    // ===================================== create new folder ====================================
    fun createNewFolder(parentUriString: String, folderName: String): Boolean {
        Log.d("FILE_MANAGER", "Creating new folder: $folderName in $parentUriString")

        return try {
            val targetUri = resolveTargetUri(parentUriString) ?: return false

            // 1. Native SAF Call for Directory Creation
            val parentDocumentId = getDocumentIdFromUri(targetUri)
            val parentTreeUri = DocumentsContract.buildDocumentUriUsingTree(targetUri, parentDocumentId)

            val newFolderUri = DocumentsContract.createDocument(
                activity.contentResolver,
                parentTreeUri,
                DocumentsContract.Document.MIME_TYPE_DIR,
                folderName
            )

            if (newFolderUri != null) {
                Log.d("FILE_MANAGER", "Native SAF Folder created successfully: $newFolderUri")
                return true
            }

            // 2. DocumentFile Fallback
            val parentDoc = DocumentFile.fromTreeUri(activity, targetUri)
                ?: DocumentFile.fromSingleUri(activity, targetUri)

            if (parentDoc != null && parentDoc.isDirectory) {
                val createdDir = parentDoc.createDirectory(folderName)
                return createdDir != null && createdDir.exists()
            }

            false
        } catch (e: Exception) {
            Log.e("FILE_MANAGER", "Exception while creating folder: ${e.message}", e)
            false
        }
    }

    // ==================================== create new file =======================================
    fun createNewFile(parentUriString: String, fileName: String): Boolean {
        Log.d("FILE_MANAGER", "Creating new file: $fileName in $parentUriString")

        return try {
            val targetUri = resolveTargetUri(parentUriString) ?: return false

            // 1. Dynamic MIME Type Detection based on extension
            val extension = fileName.substringAfterLast('.', "").lowercase()
            val mimeType = if (extension.isNotEmpty()) {
                android.webkit.MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)
                    ?: "application/octet-stream"
            } else {
                "text/plain"
            }

            // 2. Direct Native SAF Call (Fixes Termux & Special Storage Provider issues)
            val parentDocumentId = getDocumentIdFromUri(targetUri)
            val parentTreeUri = DocumentsContract.buildDocumentUriUsingTree(targetUri, parentDocumentId)

            val newFileUri = DocumentsContract.createDocument(
                activity.contentResolver,
                parentTreeUri,
                mimeType,
                fileName
            )

            if (newFileUri != null) {
                Log.d("FILE_MANAGER", "Native SAF File created successfully: $newFileUri")
                return true
            }

            // 3. DocumentFile Fallback
            val parentDoc = DocumentFile.fromTreeUri(activity, targetUri)
                ?: DocumentFile.fromSingleUri(activity, targetUri)

            if (parentDoc != null && parentDoc.isDirectory) {
                val createdFile = parentDoc.createFile(mimeType, fileName)
                return createdFile != null && createdFile.exists()
            }

            false
        } catch (e: Exception) {
            Log.e("FILE_MANAGER", "Exception while creating file: ${e.message}", e)
            false
        }
    }

    // ==================================== HELPER METHODS =======================================
    private fun resolveTargetUri(parentUriString: String): Uri? {
        return if (parentUriString == "root" || parentUriString.isEmpty()) {
            val savedUri = getSavedFolderUri() ?: return null
            Uri.parse(savedUri)
        } else {
            Uri.parse(parentUriString)
        }
    }

    private fun getDocumentIdFromUri(uri: Uri): String {
        return try {
            if (DocumentsContract.isDocumentUri(activity, uri)) {
                DocumentsContract.getDocumentId(uri)
            } else {
                DocumentsContract.getTreeDocumentId(uri)
            }
        } catch (e: Exception) {
            DocumentsContract.getTreeDocumentId(uri)
        }
    }

    // =================================== check dir / file info =================================
    fun checkDir(targetUriString: String): String {
        return try {
            val uri = Uri.parse(targetUriString)
            val result = JSONObject()
            val documentFile = DocumentFile.fromSingleUri(activity, uri)
                ?: DocumentFile.fromTreeUri(activity, uri)

            if (documentFile !== null && documentFile.exists()) {
                result.put("exists", true)
                result.put("name", documentFile.name ?: "Unknown")
                result.put("isDirectory", documentFile.isDirectory)
                result.put("uri", targetUriString)
            } else {
                result.put("exists", false)
                result.put("name", "")
                result.put("isDirectory", false)
                result.put("uri", targetUriString)
            }
            result.toString()
        } catch (e: Exception) {
            Log.e("FILE_MANAGER", "Error checking item: ${e.message}", e)
            JSONObject().apply {
                put("exists", false)
                put("name", "")
                put("isDirectory", false)
                put("uri", targetUriString)
            }.toString()
        }
    }

    // ============================= URI fromater ==============================================
    fun getReadablePathFromUri(uriString: String): String {
        try {
            // Step 1: Decode URL percent-encoding (%3A -> :, %2F -> /)
            val decodedUri = Uri.decode(uriString) ?: return uriString

            // Step 2: Extract the relative path after "document/"
            if (decodedUri.contains("/document/")) {
                val docPath = decodedUri.substringAfter("/document/")

                // Format is usually "primary:Project/index.js"
                if (docPath.contains(":")) {
                    val relativePath = docPath.substringAfter(":")
                    return relativePath // Returns "Project/index.js"
                }
                return docPath
            }

            return decodedUri
        } catch (e: Exception) {
            return uriString
        }
    }
}