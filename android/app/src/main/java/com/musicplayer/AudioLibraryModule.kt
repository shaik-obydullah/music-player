package com.musicplayer

import android.content.ContentUris
import android.database.Cursor
import android.net.Uri
import android.provider.MediaStore
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AudioLibraryModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "AudioLibrary"

  @ReactMethod
  fun getDeviceTracks(folderPath: String?, promise: Promise) {
    try {
      val collection = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
      val projection = arrayOf(
          MediaStore.Audio.Media._ID,
          MediaStore.Audio.Media.TITLE,
          MediaStore.Audio.Media.ARTIST,
          MediaStore.Audio.Media.ALBUM,
          MediaStore.Audio.Media.ALBUM_ID,
          MediaStore.Audio.Media.DURATION,
          MediaStore.Audio.Media.DATA,
          MediaStore.Audio.Media.DISPLAY_NAME,
      )

      val sortOrder = MediaStore.Audio.Media.DISPLAY_NAME + " ASC"
      val tracks = Arguments.createArray()

      val cursor: Cursor? = reactApplicationContext.contentResolver.query(
          collection, projection, null, null, sortOrder)

      val seen = HashSet<Long>()

      cursor?.use { c ->
        val idCol = c.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
        val titleCol = c.getColumnIndex(MediaStore.Audio.Media.TITLE)
        val artistCol = c.getColumnIndex(MediaStore.Audio.Media.ARTIST)
        val albumCol = c.getColumnIndex(MediaStore.Audio.Media.ALBUM)
        val albumIdCol = c.getColumnIndex(MediaStore.Audio.Media.ALBUM_ID)
        val durationCol = c.getColumnIndex(MediaStore.Audio.Media.DURATION)
        val dataCol = c.getColumnIndex(MediaStore.Audio.Media.DATA)
        val nameCol = c.getColumnIndex(MediaStore.Audio.Media.DISPLAY_NAME)

        while (c.moveToNext()) {
          val id = c.getLong(idCol)
          if (!seen.add(id)) continue
          val contentUri: Uri = ContentUris.withAppendedId(
              MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id)
          val title = if (titleCol >= 0) c.getString(titleCol) else null
          val artist = if (artistCol >= 0) c.getString(artistCol) else null
          val album = if (albumCol >= 0) c.getString(albumCol) else null
          val albumId =
              if (albumIdCol >= 0) c.getLong(albumIdCol) else -1L
          val duration = if (durationCol >= 0) c.getLong(durationCol) else 0L
          val data = if (dataCol >= 0) c.getString(dataCol) else null
          val name = if (nameCol >= 0) c.getString(nameCol) else null

          val track = Arguments.createMap()
          track.putString("id", id.toString())
          track.putString("uri", contentUri.toString())
          track.putString("title", title ?: (name ?: "Unknown"))
          track.putString("artist", artist ?: "Unknown Artist")
          track.putString("album", album ?: "Unknown Album")
          val artwork =
              if (albumId > 0) {
                ContentUris.withAppendedId(
                    Uri.parse("content://media/external/audio/albumart"),
                    albumId).toString()
              } else {
                ""
              }
          track.putString("artwork", artwork)
          track.putDouble("duration", duration / 1000.0)
          track.putString("path", data)
          tracks.pushMap(track)
        }
      }

      promise.resolve(tracks)
    } catch (e: Exception) {
      promise.reject("AUDIO_LIBRARY_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun getAppInfo(promise: Promise) {
    try {
      val info = Arguments.createMap()
      val pkg = reactApplicationContext.packageManager.getPackageInfo(
          reactApplicationContext.packageName, 0)
      info.putString("versionName", pkg.versionName)
      info.putInt("versionCode", pkg.versionCode)
      info.putString("version", pkg.versionName)
      promise.resolve(info)
    } catch (e: Exception) {
      promise.reject("APP_INFO_ERROR", e.message, e)
    }
  }
}
