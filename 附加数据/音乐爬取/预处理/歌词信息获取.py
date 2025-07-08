import json
import random
from collections import defaultdict
import jieba
from datetime import datetime

# 定义情感关键词词典
emotion_keywords = {
    '快乐': ['快乐', '幸福', '开心', '笑', '喜欢', '美好', '欢乐', '甜蜜', '高兴', '开心', '愉快'],
    '悲伤': ['悲伤', '难过', '痛苦', '哭', '伤心', '遗憾', '离别', '孤独', '忧伤', '思念'],
    '愤怒': ['愤怒', '生气', '恨', '憎恨', '发怒', '讨厌', '不满', '怒火'],
    '恐惧': ['害怕', '恐惧', '担心', '焦虑', '惊慌', '紧张', '恐慌'],
    '平静': ['平静', '安详', '宁静', '温柔', '温暖', '安心', '平和', '祥和']
}

# 定义歌词风格关键词
style_keywords = {
    '古典': ['琴', '笛', '箫', '雅', '韵', '清幽', '婉约'],
    '流行': ['时尚', '潮流', '节奏', '动感', '现代'],
    '摇滚': ['激情', '狂野', '力量', '摇滚', '电吉他'],
    '民谣': ['朴实', '自然', '生活', '民间', '传统'],
    '电子': ['电音', '节拍', '混音', '律动', 'DJ'],
    '说唱': ['说唱', '饶舌', '嘻哈', 'rap', '节奏'],
    '儿童': ['童真', '可爱', '快乐', '天真', '童年']
}

def analyze_lyrics(lyrics):
    if not lyrics:
        return random.choice(list(emotion_keywords.keys())), random.choice(list(style_keywords.keys())), []

    # 情感分析
    emotion_scores = defaultdict(int)
    for emotion, keywords in emotion_keywords.items():
        for keyword in keywords:
            if keyword in lyrics:
                emotion_scores[emotion] += lyrics.count(keyword)

    # 风格分析
    style_scores = defaultdict(int)
    for style, keywords in style_keywords.items():
        for keyword in keywords:
            if keyword in lyrics:
                style_scores[style] += lyrics.count(keyword)

    # 获取得分最高的情感和风格
    # 获取得分最高的情感和风格
    lyric_type = max(emotion_scores.items(), key=lambda x: x[1])[0] if emotion_scores else random.choice(list(emotion_keywords.keys()))
    style = max(style_scores.items(), key=lambda x: x[1])[0] if style_scores else random.choice(list(style_keywords.keys()))

    # 分词获取关键词
    words = jieba.lcut(lyrics)
    # 过滤掉单字词和停用词
    words = [w for w in words if len(w) > 1]
    # 统计词频
    word_freq = defaultdict(int)
    for word in words:
        word_freq[word] += 1

    # 获取出现频率最高的3个词
    wordle = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:3]
    wordle = [word for word, _ in wordle]

    return lyric_type, style, wordle

def process_data(input_data):
    # 按年份组织数据
    year_data = defaultdict(list)

    for singer in input_data:
        for song in singer.get('songs', []):
            time_str = song.get('time', '')
            if time_str:
                try:
                    year = datetime.strptime(time_str, '%Y-%m-%dT%H:%M:%S').year
                    lyrics = song.get('lyrics', '')
                    lyric_type, style, wordle = analyze_lyrics(lyrics)

                    song_data = {
                        "song": song.get('song_name', ''),
                        "style": style,
                        "time": time_str,
                        "wordle": wordle,
                        "lyric_type": lyric_type
                    }

                    year_data[str(year)].append(song_data)
                except:
                    continue

    # 转换为目标格式
    result = []
    for year, songs in year_data.items():
        result.append({
            "time": year,
            "all_song": songs
        })

    return result

try:
    # 读取输入数据
    with open('../music_data/all_singers.json', 'r', encoding='utf-8') as f:
        input_data = json.load(f)

    # 处理数据
    result = process_data(input_data)

    # 保存结果
    with open('lyrics_analysis_result.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print("数据处理完成，已保存到 lyrics_analysis_result.json")

    # 打印一些统计信息
    total_songs = sum(len(year_data['all_song']) for year_data in result)
    total_years = len(result)
    print(f"\n统计信息：")
    print(f"总年份数：{total_years}")
    print(f"总歌曲数：{total_songs}")

    # 打印示例数据
    if result:
        print("\n示例数据（第一年的第一首歌）：")
        first_year = result[0]
        if first_year['all_song']:
            print(json.dumps(first_year['all_song'][0], ensure_ascii=False, indent=2))

except FileNotFoundError:
    print("错误：找不到输入文件 music_data/all_singers.json")
except json.JSONDecodeError:
    print("错误：输入文件格式不正确")
except Exception as e:
    print(f"处理过程中发生错误：{str(e)}")