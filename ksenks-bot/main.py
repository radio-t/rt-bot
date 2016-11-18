import asyncio
import io
import json.decoder
import pickle
import struct
from os.path import isfile
from time import time
import aiohttp
import numpy as np
from aiohttp import web
from scipy import signal
from sklearn import svm
import audioread
import pytz
from datetime import datetime


SECS_BEFORE_SILENT = 1 * 60
SECS_BEFORE_SLEEP = 5 * 60
DEFAULT_URL = 'http://stream.radio-t.com/'
STREAM_URL = DEFAULT_URL

DEBUG = True
DEBUG_IGNORE_TIME_UNTIL = 0
DEBUG_RESET_FLAG = False

PROBABILITY = 0.85

last_detects = []
last_ksenks_timestamp = 0
svm_state = None


def minutes_word(minutes):
    word = 'минут'
    if minutes % 10 == 1:
        word += 'у'
    elif minutes % 10 in [2, 3, 4]:
        word += 'ы'
    return word


async def info(request):
    data = {'author': 'strayge',
            'info': 'Выводит время с момента последней реплики Ксюши',
            'commands': ['Ксюша!', 'ksenks!']}
    return web.json_response(data)


async def event(request):
    try:
        input_json = await request.json()
    except json.decoder.JSONDecodeError:
        return web.Response(status=417)
    input_text = input_json.get('text')
    # input_username = input_json.get('username')
    # input_displayname = input_json.get('display_name')

    if DEBUG:
        global STREAM_URL, last_ksenks_timestamp, DEBUG_IGNORE_TIME_UNTIL
        global DEBUG_RESET_FLAG, DEFAULT_URL, last_detects, PROBABILITY
        set_away_secs = input_json.get('set_away')
        set_url = input_json.get('set_url')
        get_status = input_json.get('status')
        set_reset = input_json.get('reset')
        set_probability = input_json.get('probability')
        if set_away_secs:
            secs_away = int(set_away_secs)
            if secs_away == 0:
                last_ksenks_timestamp = 0
            else:
                last_ksenks_timestamp = time() - secs_away
            return web.json_response({'text': 'Ок!'})
        if set_url:
            STREAM_URL = str(set_url)
            DEBUG_IGNORE_TIME_UNTIL = time() + 3600
            return web.json_response({'text': 'Ок!'})
        if get_status is not None:
            return web.json_response({'url': STREAM_URL,
                                      'last_timestamp': last_ksenks_timestamp,
                                      'ignore_time_until': DEBUG_IGNORE_TIME_UNTIL,
                                      'reeset_flag': DEBUG_RESET_FLAG,
                                      'last_detects': last_detects,
                                      'probability': PROBABILITY,})
        if set_reset is not None:
            STREAM_URL = DEFAULT_URL
            DEBUG_IGNORE_TIME_UNTIL = 0
            DEBUG_RESET_FLAG = True
            return web.json_response({'text': 'Ок!'})
        if set_probability:
            if float(set_probability) > 0.5 and float(set_probability) < 1:
                PROBABILITY = float(set_probability)
                return web.json_response({'text': 'Ок!'})
            else:
                return web.json_response({'text': 'Fail!'})

    if not input_text:
        return web.Response(status=417)
    if input_text.strip().lower() not in ['ксюша!', 'ksenks!']:
        return web.Response(status=417)

    now = time()
    if not last_ksenks_timestamp or (now - last_ksenks_timestamp) > 24 * 3600:
        text = 'Здесь такая не появлялась :disappointed:'
    else:
        if now - last_ksenks_timestamp < SECS_BEFORE_SILENT:
            text = 'Ксюша с нами! :smile:'
        elif now - last_ksenks_timestamp < SECS_BEFORE_SLEEP:
            minutes = (now - last_ksenks_timestamp) // 60
            text = 'Ксюша молчит уже %i %s...' % (minutes, minutes_word(minutes))
        else:
            minutes = (now - last_ksenks_timestamp) // 60
            text = 'Ксюша заснула %i %s назад :sleeping:' % (minutes, minutes_word(minutes))

    output = {'text': text, 'bot': 'ksenks-bot'}
    return web.json_response(data=output, status=201)


async def processing_audio(web_app):
    def get_frames_from_flv_or_mp3(chunk, tail=b''):
        def unpack_uint24_be(x):
            if len(x) != 3:
                return 0
            return 2 ** 16 * x[0] + 2 ** 8 * x[1] + x[2]

        mp3_frames = []
        chunk = tail + chunk

        # mp3 frame start marker (first 11 bit setted to 1)
        if chunk[0] == 0xff and chunk[1] >= 0xe0:
            current_frame_offset = 0
            while current_frame_offset != -1 and len(chunk) - current_frame_offset > 10:
                next_frame_offset = chunk.find(chunk[current_frame_offset: current_frame_offset + 2],
                                               current_frame_offset + 2)
                if next_frame_offset == -1:
                    break
                frame = chunk[current_frame_offset: next_frame_offset]
                mp3_frames.append(frame)
                current_frame_offset = next_frame_offset
            tail = chunk[current_frame_offset:]
            return mp3_frames, tail

        # trying detect flv-container
        signature = struct.unpack('3s', chunk[0:3])[0]
        # skip flv header
        if signature == b'FLV':
            start_pos = 9
        else:
            start_pos = 0
        while len(chunk) - start_pos > 15:
            packet_type = chunk[start_pos + 4]
            payload_size = unpack_uint24_be(chunk[start_pos + 5: start_pos + 8])
            if len(chunk) <= start_pos + 15 + payload_size:
                break
            if packet_type == 8:
                frame = chunk[start_pos + 16: start_pos + 15 + payload_size]
                mp3_frames.append(frame)
            start_pos = start_pos + 15 + payload_size
        tail = chunk[start_pos:]
        return mp3_frames, tail

    def get_pcm_from_frames(all_frames):
        input_data = io.BytesIO()
        for frame in all_frames:
            input_data.write(frame)
        input_data.seek(0)
        try:
            f_convert = audioread.decode(input_data)
        except:
            return b''
        full_pcm = b''
        for pcm in f_convert:
            full_pcm += pcm
        f_convert.close()
        input_data.close()
        return full_pcm

    def is_ksenks_on_pcm(pcm):
        def build_svm():
            svm_filename = 'svm_model.pickle'
            np_data_filenames = ['svm_x.npy', 'svm_y.npy']
            global svm_state
            if isfile(svm_filename):
                f_svm = open(svm_filename, 'rb')
                svm_state = pickle.load(f_svm)
                f_svm.close()
            elif isfile(np_data_filenames[0]) and isfile(np_data_filenames[1]):
                print('%s not found, recalculating' % svm_filename)
                X = np.load(np_data_filenames[0])
                Y = np.load(np_data_filenames[1])
                svm_state = svm.SVC(class_weight='balanced', probability=True)
                svm_state.fit(X, Y)
                f_svm = open(svm_filename, 'wb')
                pickle.dump(svm_state, f_svm)
                f_svm.close()
            else:
                print('no files presents, exitting...')
                exit()

        def gen_featutes_from_pcm(pcm):
            pcm_array = np.frombuffer(pcm, dtype='<i2')
            freqs, _, Pxx = signal.spectrogram(pcm_array, fs=44100, nfft=256, window=signal.get_window('hann', 256),
                                               noverlap=128)
            avg_freqs_values = np.zeros(len(freqs))
            min_freqs_values = np.zeros(len(freqs))
            max_freqs_values = np.zeros(len(freqs))
            # loop for each freq (in Pxx[i] stored freq's values for each timepoint for freq #i)
            for i, freq in enumerate(Pxx):
                avg_freqs_values[i] = np.log10(np.sum(freq) / len(freq)) / np.log10(2 ** 16)
                if np.max(freq):
                    max_freqs_values[i] = np.log10(np.max(freq)) / np.log10(2 ** 16)  # scaled = [0,1]
                if np.min(freq):
                    min_freqs_values[i] = np.log10(np.min(freq))
                else:
                    min_freqs_values[i] = 0
            features = np.concatenate((avg_freqs_values, min_freqs_values, max_freqs_values))
            return features

        if not svm_state:
            build_svm()

        features = gen_featutes_from_pcm(pcm)
        probability = svm_state.predict_proba([features])[0][1]

        if probability >= PROBABILITY:
            if DEBUG:
                global last_detects
                last_detects.append({'time': round(time()), 'probability': probability})
                if len(last_detects) > 10:
                    del(last_detects[0])
                print('Ksenks detected, prob = %5.2f %%' % (probability * 100))
            return True
        else:
            return False

    try:
        async with aiohttp.ClientSession() as session:
            while True:
                try:
                    current_date = datetime.now(tz=pytz.timezone('Europe/Moscow'))
                    print('date check')
                    if (current_date.weekday() == 5 and current_date.hour >= 22) or \
                       (current_date.weekday() == 6 and current_date.hour <= 4) or \
                       (DEBUG and DEBUG_IGNORE_TIME_UNTIL and time() < DEBUG_IGNORE_TIME_UNTIL):
                        async with session.get(STREAM_URL) as resp:
                            tail = b''
                            not_processed_frames = []
                            while True:
                                if DEBUG:
                                    global DEBUG_RESET_FLAG
                                    if DEBUG_RESET_FLAG:
                                        DEBUG_RESET_FLAG = False
                                        resp.close()
                                        break
                                stream_chunk = await resp.content.read(65536)
                                if not stream_chunk:
                                    print('stream ended?')
                                    break
                                frames, tail = get_frames_from_flv_or_mp3(stream_chunk, tail)
                                not_processed_frames += frames
                                if len(not_processed_frames) > 100:
                                    pcm = get_pcm_from_frames(not_processed_frames)
                                    not_processed_frames = []
                                    if len(pcm) == 0:
                                        print('error in audio decoding')
                                        continue
                                    if is_ksenks_on_pcm(pcm):
                                        global last_ksenks_timestamp
                                        last_ksenks_timestamp = time()
                    else:
                        print('wait start time')
                        await asyncio.sleep(30)
                except aiohttp.ClientResponseError:
                    print('aiohttp.ClientResponseError')

    except asyncio.CancelledError:
        pass
    finally:
        pass

async def start_background_tasks(web_app):
    web_app['audio_processor'] = web_app.loop.create_task(processing_audio(web_app))


async def cleanup_background_tasks(web_app):
    web_app['audio_processor'].cancel()
    await web_app['audio_processor']

if __name__ == "__main__":
    app = web.Application()
    app.on_startup.append(start_background_tasks)
    app.on_cleanup.append(cleanup_background_tasks)
    app.router.add_get('/info', info)
    app.router.add_post('/event', event)
    web.run_app(app, port=8080)