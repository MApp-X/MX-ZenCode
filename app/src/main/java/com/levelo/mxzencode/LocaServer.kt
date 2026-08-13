// English comment for LeveloJs project
package com.levelo.mxzencode

import android.content.Context
import android.net.Uri
import android.webkit.MimeTypeMap
import fi.iki.elonen.NanoHTTPD
import java.io.ByteArrayInputStream
import java.io.File
import java.io.InputStream

class LocalServer(
    port: Int,
    private val fileManager: FileManager,
    private val rootPath: String,
    private val rawFilePath: String,
    private val context: Context
) : NanoHTTPD(port) {

    override fun serve(session: IHTTPSession): Response {
        var reqPath = session.uri.removePrefix("/")
        if (reqPath.isEmpty() || reqPath.endsWith("/")) {
            reqPath += "index.html"
        }

        val bytes = getFileBytes("/$reqPath")
        if (bytes != null) {
            val mimeType = getMimeType(reqPath)
            val response = newFixedLengthResponse(
                Response.Status.OK,
                mimeType,
                ByteArrayInputStream(bytes),
                bytes.size.toLong()
            )
            response.addHeader("Access-Control-Allow-Origin", "*")
            response.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            response.addHeader("Access-Control-Allow-Headers", "*")
            return response
        }

        return newFixedLengthResponse(
            Response.Status.NOT_FOUND,
            MIME_PLAINTEXT,
            "404 File Not Found: $reqPath"
        )
    }

    fun getFileBytes(path: String): ByteArray? {
        var reqPath = path.removePrefix("/")
        if (reqPath.isEmpty() || reqPath.endsWith("/")) {
            reqPath += "index.html"
        }

        // Try Path 1: Primary Root Path
        val cleanRootPath = rootPath.removePrefix("file://")
        val targetFile = File(cleanRootPath, reqPath)
        if (targetFile.exists() && !targetFile.isDirectory) {
            return targetFile.readBytes()
        }

        // Try Path 2: Symlink Path Conversion
        if (cleanRootPath.contains("/data/data/")) {
            val altPath = cleanRootPath.replace("/data/data/", "/data/user/0/")
            val altFile = File(altPath, reqPath)
            if (altFile.exists() && !altFile.isDirectory) {
                return altFile.readBytes()
            }
        }

        // Try Path 3: ContentResolver fallback
        if (rawFilePath.startsWith("content://")) {
            try {
                val contentUri = Uri.parse(rawFilePath)
                return context.contentResolver.openInputStream(contentUri)?.use { it.readBytes() }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        return null
    }

    fun getMimeType(fileName: String): String {
        val extension = MimeTypeMap.getFileExtensionFromUrl(fileName)
            .ifEmpty { fileName.substringAfterLast('.', "") }
            .lowercase()

        return MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) ?: "text/html"
    }
}