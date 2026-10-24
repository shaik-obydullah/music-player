package com.musicplayer

import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.nio.ByteBuffer

class VisualizerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "AudioVisualizer"

  // Target decode rate. Low enough to keep FFT cheap, high enough to show bass.
  private val TARGET_RATE = 8000
  // Samples per FFT window (250 ms at 8 kHz).
  private val WINDOW = 2048
  // Frames per second of output bars.
  private val FPS = 4
  // Cap the number of output frames to bound memory.
  private val MAX_FRAMES = 1500
  // Running source-sample counter for streaming resample continuity.
  private var srcPos = 0L

  @ReactMethod
  fun analyze(uri: String, bars: Int) {
    val ctx = reactApplicationContext
    Thread {
      try {
        val frames = decodeAndAnalyze(uri, bars)
        val result = Arguments.createArray()
        for (frame in frames) {
          val row = Arguments.createArray()
          for (v in frame) row.pushInt(v)
          result.pushArray(row)
        }
        val map = Arguments.createMap()
        map.putString("uri", uri)
        map.putInt("bars", bars)
        map.putArray("frames", result)
        ctx.runOnUiQueueThread {
          ctx.getJSModule(ReactContext.RCTDeviceEventEmitter::class.java)
              .emit("AudioVisualizerFrames", map)
        }
      } catch (e: Exception) {
        Log.d("VisualizerModule", "analyze error=${e.message}")
      }
    }.start()
  }

  /** Returns a list of frames; each frame is `bars` amplitude values (0..255). */
  private fun decodeAndAnalyze(uri: String, bars: Int): List<IntArray> {
    val pcm = decodeToMono(uri)
    if (pcm.size < WINDOW) return emptyList()

    val hop = TARGET_RATE / FPS // samples between frames
    val frames = ArrayList<IntArray>()
    var pos = 0
    while (pos + WINDOW <= pcm.size && frames.size < MAX_FRAMES) {
      frames.add(windowToBars(pcm, pos, bars))
      pos += hop
    }
    return frames
  }

  private fun windowToBars(pcm: ShortArray, offset: Int, bars: Int): IntArray {
    val magnitudes = fftMagnitudes(pcm, offset, WINDOW)
    val out = IntArray(bars)
    val n = magnitudes.size
    val per = n / bars
    for (b in 0 until bars) {
      var sum = 0.0
      val start = b * per
      val end = if (b == bars - 1) n else (b + 1) * per
      var max = 0.0f
      for (i in start until end) {
        val m = magnitudes[i]
        if (m > max) max = m
        sum += m
      }
      var v = max
      if (v < 1.0f) v = 0.0f
      out[b] = fftToByte(v).toInt() and 0xff
    }
    return out
  }

  /** Convert an FFT magnitude to a 0..255 byte (log scale). */
  private fun fftToByte(mag: Float): Byte {
    if (mag <= 0f) return 0
    val db = 20.0 * Math.log10((mag + 1.0)) // dB-ish
    // Reasonable ceiling ~90 dB; map 0..90 -> 0..255.
    val v = (db / 90.0) * 255.0
    return (if (v > 255.0) 255.0 else if (v < 0.0) 0.0 else v).toInt().toByte()
  }

  /** In-place-ish radix-2 FFT returning magnitude per bin (Nyquist-limited). */
  private fun fftMagnitudes(pcm: ShortArray, offset: Int, n: Int): FloatArray {
    val re = FloatArray(n)
    val im = FloatArray(n)
    for (i in 0 until n) re[i] = pcm[offset + i] / 32768f

    val bits = Integer.numberOfTrailingZeros(n)
    for (i in 0 until n) {
      var j = Integer.reverse(i) ushr (32 - bits)
      if (j > i) {
        val tr = re[i]; re[i] = re[j]; re[j] = tr
        val ti = im[i]; im[i] = im[j]; im[j] = ti
      }
    }
    var len = 2
    while (len <= n) {
      val ang = 2.0 * Math.PI / len
      val wRe = Math.cos(ang).toFloat()
      val wIm = -Math.sin(ang).toFloat()
      var i = 0
      while (i < n) {
        var wR = 1f
        var wI = 0f
        for (j in 0 until len / 2) {
          val uR = re[i + j]
          val uI = im[i + j]
          val vR = wR * re[i + j + len / 2] - wI * im[i + j + len / 2]
          val vI = wR * im[i + j + len / 2] + wI * re[i + j + len / 2]
          re[i + j] = uR + vR
          im[i + j] = uI + vI
          re[i + j + len / 2] = uR - vR
          im[i + j + len / 2] = uI - vI
          val nR = wR * wRe - wI * wIm
          wI = wR * wIm + wI * wRe
          wR = nR
        }
        i += len
      }
      len = len shl 1
    }

    // Magnitudes. Bootstrap bin at 0 is DC (ignore it).
    val mags = FloatArray(n / 2 + 1)
    for (i in 1 until mags.size) {
      val r = re[i]
      val imv = im[i]
      mags[i] = Math.sqrt(r.toDouble() * r + imv * imv).toFloat()
    }
    return mags
  }

  /** Decodes the audio at `uri` to mono 8 kHz PCM (ShortArray), streaming/resampling to bound memory. */
  private fun decodeToMono(uri: String): ShortArray {
    val extractor = MediaExtractor()
    try {
      extractor.setDataSource(reactApplicationContext, android.net.Uri.parse(uri), null)
    } catch (e: Exception) {
      Log.d("VisualizerModule", "setDataSource error=${e.message}")
      throw e
    }
    var trackIndex = -1
    for (i in 0 until extractor.trackCount) {
      val f = extractor.getTrackFormat(i)
      if (f.getString(MediaFormat.KEY_MIME)?.startsWith("audio/") == true) {
        trackIndex = i
        break
      }
    }
    if (trackIndex < 0) {
      extractor.release()
      throw IllegalStateException("no audio track")
    }
    val format = extractor.getTrackFormat(trackIndex)
    extractor.selectTrack(trackIndex)

    val mime = format.getString(MediaFormat.KEY_MIME) ?: "audio/mpeg"
    val sourceRate =
      if (format.containsKey(MediaFormat.KEY_SAMPLE_RATE)) {
        format.getInteger(MediaFormat.KEY_SAMPLE_RATE)
      } else 44100

    // Pre-size the 8 kHz mono output to bound memory to ~a few MB regardless of song length.
    val maxOutLen = MAX_FRAMES * (TARGET_RATE / FPS) + WINDOW
    var out = ShortArray(65536)
    var outLen = 0

    val codec = MediaCodec.createDecoderByType(mime)
    try {
      srcPos = 0L
      codec.configure(format, null, null, 0)
      codec.start()

      val inputBufs = codec.inputBuffers
      var outputBufs = codec.outputBuffers
      val bufferInfo = MediaCodec.BufferInfo()
      var codecInputDone = false
      var outputDone = false
      var codecRelease = false

      while (!codecRelease) {
        if (!codecInputDone) {
          val inIndex = codec.dequeueInputBuffer(10000)
          if (inIndex >= 0) {
            val buf = inputBufs[inIndex]
            val sampleSize = extractor.readSampleData(buf, 0)
            if (sampleSize < 0) {
              codec.queueInputBuffer(inIndex, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
              codecInputDone = true
            } else {
              codec.queueInputBuffer(inIndex, 0, sampleSize, extractor.sampleTime, 0)
              extractor.advance()
            }
          }
        }

        val outIndex = codec.dequeueOutputBuffer(bufferInfo, 10000)
        if (outIndex >= 0) {
          val outBuf = outputBufs[outIndex]
          val data = ByteBuffer.allocate(bufferInfo.size)
          outBuf.position(bufferInfo.offset)
          outBuf.limit(bufferInfo.offset + bufferInfo.size)
          data.put(outBuf)
          data.flip()
          val mono = bytesToFloatMono(data, format)

          // Grow the 8 kHz output buffer if needed (bounded).
          if (outLen + mono.size >= out.size && out.size < maxOutLen) {
            out = out.copyOf(Math.min(out.size * 2, maxOutLen))
          }
          outLen = appendResampled(out, outLen, mono, sourceRate)
          codec.releaseOutputBuffer(outIndex, false)
          if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) {
            outputDone = true
          }
        } else if (outIndex == MediaCodec.INFO_OUTPUT_BUFFERS_CHANGED) {
          outputBufs = codec.outputBuffers
        }

        if (codecInputDone && outputDone) {
          codecRelease = true
        }
      }

      return out.copyOfRange(0, outLen)
    } finally {
      try {
        codec.stop()
      } catch (_: Exception) {
      }
      codec.release()
      extractor.release()
    }
  }

  private fun bytesToFloatMono(buf: ByteBuffer, format: MediaFormat): FloatArray {
    val channels = if (format.containsKey(MediaFormat.KEY_CHANNEL_COUNT)) {
      format.getInteger(MediaFormat.KEY_CHANNEL_COUNT)
    } else 1
    val encoding = if (format.containsKey(MediaFormat.KEY_PCM_ENCODING)) {
      format.getInteger(MediaFormat.KEY_PCM_ENCODING)
    } else AudioEncodingValues.PCM_16BIT

    val totalSamples = buf.remaining() / 2
    val frameCount = totalSamples / channels
    val mono = FloatArray(frameCount)
    for (f in 0 until frameCount) {
      var sum = 0L
      for (c in 0 until channels) {
        val idx = (f * channels + c) * 2
        val lo = buf.get(idx).toInt() and 0xff
        val hi = buf.get(idx + 1).toInt()
        val s = (hi shl 8) or lo
        sum += s
      }
      mono[f] = (sum / channels) / 32768f
    }
    return mono
  }

  /**
   * Downsamples a mono source-rate chunk into the 8 kHz output (nearest-sample).
   * `srcPos` across calls keeps target indices continuous between buffers.
   * Returns the new 8 kHz output length.
   */
  private fun appendResampled(
      out: ShortArray,
      outLen: Int,
      mono: FloatArray,
      sourceRate: Int,
  ): Int {
    var w = outLen
    for (i in mono.indices) {
      if (w >= out.size) break
      val target = (srcPos + i) * TARGET_RATE / sourceRate
      if (target >= w) {
        if (target >= out.size) break
        out[target.toInt()] = toShort(mono[i])
        w = target.toInt() + 1
      }
    }
    srcPos += mono.size
    return w
  }

  private fun toShort(f: Float): Short =
    (if (f > 1f) 1f else if (f < -1f) -1f else f * 32767f).toInt().toShort()

  override fun invalidate() {
    super.invalidate()
  }
}

private object AudioEncodingValues {
  const val PCM_16BIT: Int = 2
}